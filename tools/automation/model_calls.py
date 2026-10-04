"""One bounded provider call; no tools, provider retries or code execution."""
from __future__ import annotations

import json
import os
import datetime as dt
import urllib.error
import urllib.request
import time

from .pipeline import model_limits


def call(role, instructions, context, schema, transport=None, *, task=None):
    if transport is None and dt.date.today() > dt.date(2026, 11, 2):
        raise ValueError('Pricing qualification expired; verify model/pricing policy before another paid call')
    spec = model_limits(role, task)
    limit = spec['max_input']
    # Includes schema/instructions overhead; generous byte upper bound is priced
    # as tokens. No tools, automatic tier upgrade, long context or cache writes.
    input_bytes = len(json.dumps([instructions, context, schema], ensure_ascii=False).encode()) + 4096
    if input_bytes > limit:
        raise ValueError('Model context exceeds reserved budget')
    if spec['provider'] == 'openai':
        credential = 'CODEX_WORKER_API_KEY' if role == 'build' else 'GUARDIAN_OPENAI_REVIEW_KEY'
        endpoint = 'https://api.openai.com/v1/responses'
        body = {'model': spec['model'], 'store': False, 'service_tier': 'default',
                'background': True,
                'max_output_tokens': spec['max_output'], 'reasoning': {'effort': 'high'},
                'instructions': instructions, 'input': json.dumps(context, ensure_ascii=False),
                'text': {'format': {'type': 'json_schema', 'name': 'guardian_' + role,
                                    'strict': True, 'schema': schema}}}
        headers = {'Authorization': 'Bearer ' + os.environ.get(credential, '')}
    else:
        credential = 'GUARDIAN_ANTHROPIC_REVIEW_KEY'
        endpoint = 'https://api.anthropic.com/v1/messages'
        body = {'model': spec['model'], 'max_tokens': spec['max_output'],
                'system': instructions, 'messages': [{'role': 'user', 'content': json.dumps(context, ensure_ascii=False)}],
                'thinking': {'type': 'adaptive'},
                'output_config': {'effort': 'high', 'format': {'type': 'json_schema', 'schema': schema}}}
        headers = {'x-api-key': os.environ.get(credential, ''), 'anthropic-version': '2023-06-01'}
    if transport is None:
        if not os.environ.get(credential):
            raise ValueError('Missing dedicated provider credential')
        request = urllib.request.Request(endpoint, data=json.dumps(body).encode(),
                                         headers={**headers, 'Content-Type': 'application/json'}, method='POST')
        try:
            # OpenAI reasoning calls run in background mode so large bounded web
            # tasks are not lost merely because synchronous generation exceeds a
            # short HTTP socket timeout. Creating the response is still a single
            # paid request; subsequent GETs only retrieve that same response.
            create_timeout = 90 if spec['provider'] == 'openai' else 240
            with urllib.request.urlopen(request, timeout=create_timeout) as response:
                raw = response.read(2 * 1024 * 1024 + 1)
            if len(raw) > 2 * 1024 * 1024:
                raise ValueError('Oversized provider response')
            payload = json.loads(raw)

            if spec['provider'] == 'openai' and payload.get('status') in {'queued', 'in_progress'}:
                response_id = payload.get('id')
                if not isinstance(response_id, str) or not response_id.startswith('resp_'):
                    raise ValueError('Background response missing stable response ID')
                deadline = time.monotonic() + 600
                retrieve_url = endpoint + '/' + response_id
                while payload.get('status') in {'queued', 'in_progress'}:
                    if time.monotonic() >= deadline:
                        raise RuntimeError(
                            f'OpenAI background response {response_id} still running after 600s; '
                            'do not create a duplicate paid request')
                    time.sleep(2)
                    retrieve = urllib.request.Request(
                        retrieve_url, headers={**headers, 'Content-Type': 'application/json'}, method='GET')
                    with urllib.request.urlopen(retrieve, timeout=60) as response:
                        raw = response.read(2 * 1024 * 1024 + 1)
                    if len(raw) > 2 * 1024 * 1024:
                        raise ValueError('Oversized provider response')
                    payload = json.loads(raw)
        except urllib.error.HTTPError as exc:
            reason = {401: 'credential rejected', 403: 'provider/model permission denied', 404: 'model or endpoint unavailable',
                      400: 'provider rejected request contract', 422: 'provider rejected request contract',
                      429: 'rate/quota limit reached'}.get(exc.code, 'provider failure; billing outcome unknown')
            raise RuntimeError(f"{role} ({spec['model']}): HTTP {exc.code}, {reason}; reservation retained, no automatic retry") from None
        except RuntimeError:
            raise
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            # If creation or retrieval becomes ambiguous we still stop. Background
            # mode makes that state far less likely and preserves a retrievable ID
            # whenever the create request was acknowledged.
            raise RuntimeError('Provider result unknown; reservation retained, automatic retry forbidden') from None
    else:
        payload = transport(endpoint, body)
    if payload.get('model') != spec['model']:
        raise ValueError('Returned model differs; no implicit downgrade or upgrade')
    if spec['provider'] == 'openai':
        if payload.get('status') != 'completed':
            raise ValueError('Incomplete/refused model response')
        content = [item for message in payload.get('output', []) if message.get('type') == 'message' for item in message.get('content', [])]
        if not content or any(c.get('type') != 'output_text' for c in content):
            raise ValueError('Refused or unexpected model output')
        result = json.loads(''.join(c['text'] for c in content))
        usage = payload.get('usage', {})
        used_in, used_out = usage.get('input_tokens'), usage.get('output_tokens')
    else:
        if payload.get('stop_reason') != 'end_turn':
            raise ValueError('Incomplete/refused model response')
        content = payload.get('content', [])
        if not content or any(c.get('type') not in {'text', 'thinking', 'redacted_thinking'} for c in content):
            raise ValueError('Unexpected Anthropic output')
        result = json.loads(''.join(c['text'] for c in content if c.get('type') == 'text'))
        usage = payload.get('usage', {})
        used_in, used_out = usage.get('input_tokens'), usage.get('output_tokens')
    if type(used_in) is not int or type(used_out) is not int or not 0 <= used_in <= limit or not 0 <= used_out <= spec['max_output']:
        raise ValueError('Missing or out-of-budget token accounting')
    return result, {'provider': spec['provider'], 'model': spec['model'], 'inputTokens': used_in,
                    'outputTokens': used_out, 'estimatedUsd': round((used_in * spec['input'] + used_out * spec['output']) / 1e6, 6),
                    'pricing': 'standard rates verified 2026-10-04; no cache discount; not an invoice'}

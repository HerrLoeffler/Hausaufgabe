"""One bounded provider call; no tools, provider retries or code execution."""
from __future__ import annotations

import json
import os
import datetime as dt
import urllib.error
import urllib.request

from .pipeline import MODELS, MAX_CONTEXT, MAX_REVIEW_CONTEXT


def call(role, instructions, context, schema, transport=None):
    if transport is None and dt.date.today() > dt.date(2026, 11, 2):
        raise ValueError('Pricing qualification expired; verify model/pricing policy before another paid call')
    spec = MODELS[role]
    limit = MAX_CONTEXT if role == 'build' else MAX_REVIEW_CONTEXT
    # Includes schema/instructions overhead; generous byte upper bound is priced
    # as tokens. No tools, automatic tier upgrade, long context or cache writes.
    input_bytes = len(json.dumps([instructions, context, schema], ensure_ascii=False).encode()) + 4096
    if input_bytes > limit:
        raise ValueError('Model context exceeds reserved budget')
    if spec['provider'] == 'openai':
        credential = 'CODEX_WORKER_API_KEY' if role == 'build' else 'GUARDIAN_OPENAI_REVIEW_KEY'
        endpoint = 'https://api.openai.com/v1/responses'
        body = {'model': spec['model'], 'store': False, 'service_tier': 'default',
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
            with urllib.request.urlopen(request, timeout=240) as response:
                raw = response.read(2 * 1024 * 1024 + 1)
            if len(raw) > 2 * 1024 * 1024:
                raise ValueError('Oversized provider response')
            payload = json.loads(raw)
        except urllib.error.HTTPError as exc:
            reason = {401: 'credential rejected', 403: 'provider/model permission denied', 404: 'model or endpoint unavailable',
                      400: 'provider rejected request contract', 422: 'provider rejected request contract',
                      429: 'rate/quota limit reached'}.get(exc.code, 'provider failure; billing outcome unknown')
            raise RuntimeError(f"{role} ({spec['model']}): HTTP {exc.code}, {reason}; reservation retained, no automatic retry") from None
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            # Ambiguous paid calls retain their full reservation. Never retry.
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
                    'pricing': 'conservative ceiling, verified 2026-10-03; not an invoice'}

#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { evaluateQualityGate } from '../../shared/intelligence/quality-gate.mjs';

// Trusted local evaluation exports only. No network, credentials, model calls or raw-content output.
const [policyPath, evidencePath, ...extra] = process.argv.slice(2);
if (!policyPath || !evidencePath || extra.length) {
  console.error('Usage: node tools/evaluation/check-quality.mjs policy.json evidence.json');
  process.exitCode = 2;
} else {
  try {
    const read = async path => {
      const data = await readFile(path);
      if (data.length > 32 * 1024 * 1024) throw new Error('FILE_TOO_LARGE');
      return JSON.parse(data.toString('utf8'));
    };
    const [policy, evidence] = await Promise.all([read(policyPath), read(evidencePath)]);
    const report = evaluateQualityGate(policy, evidence);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.recommendation === 'eligible_for_review' ? 0 : 1;
  } catch (error) {
    // Parse errors can embed input content: only emit an allowlisted machine code.
    const code = /^[A-Z_]{3,80}$/.test(error.message) ? error.message : 'INVALID_INPUT';
    console.error(JSON.stringify({ recommendation: 'blocked', runtimeAuthorized: false, error: code }));
    process.exitCode = 2;
  }
}

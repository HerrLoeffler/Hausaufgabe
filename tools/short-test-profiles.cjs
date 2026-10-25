#!/usr/bin/env node
'use strict';
// Read-only preparation for the existing Remy form/callable. No network or credentials.
const { SHORT_TEST_PROFILES, profileRequest } = require('../functions/lib/short-test-profiles');
const [id, output] = process.argv.slice(2);
if (!id) {
  console.log(SHORT_TEST_PROFILES.map(profile => profile.id + ' — ' + profile.title).join('\n'));
} else {
  try {
    if (output && output !== '--json') throw new Error('Als Ausgabeoption ist nur --json erlaubt.');
    const request = profileRequest(id);
    if (output === '--json') {
      console.log(JSON.stringify(request, null, 2));
    } else {
      console.log([
        request.topic,
        'Fach: ' + request.subject + ' | Klasse: ' + request.grade,
        'Gezielte Testvorschau: ' + request.count + ' Aufgaben | ' + request.points + ' Punkte',
        'Schulart/Region sind Pilotvorgaben, keine curriculare Freigabe.',
        '',
        'Lehrerwünsche für den bestehenden Remy-Ablauf:',
        request.notes
      ].join('\n'));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}


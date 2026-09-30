"use strict";

const { createHash, randomBytes, randomUUID } = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");

initializeApp();
const db = getFirestore();
const REGION = "europe-west1";
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_PLAYERS = 30;
const VALID_OPS = new Set(["add", "sub", "mul", "div", "round"]);
const VALID_DOMAINS = new Set(["natural", "integer", "decimal", "fraction"]);
const VALID_LEVELS = new Set(["n1", "n2", "n3", "n4"]);
const VALID_PENALTIES = new Set([0, 25, 50, 100, 200]);
const VALID_LOCKS = new Set([0, 2, 5, 10, 30]);

function hashToken(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

function fail(code, message, status = 400) {
  const err = new Error(message);
  err.apiCode = code;
  err.httpStatus = status;
  throw err;
}

function text(value, max) {
  return String(value || "").trim().slice(0, max);
}

function cleanName(value) {
  const name = text(value, 24).replace(/[<>]/g, "");
  if (!name) fail("name_required", "Bitte ein Kürzel oder einen kurzen Namen eingeben.");
  return name;
}

function cleanPlayerKey(value) {
  const key = String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  if (key.length < 8) fail("player_key_invalid", "Ungültige Spielerkennung.");
  return key;
}

function cleanList(values, valid, fallback) {
  const list = Array.isArray(values) ? [...new Set(values.map(String).filter(v => valid.has(v)))] : [];
  return list.length ? list : [...fallback];
}

function cleanConfig(raw = {}) {
  const operations = cleanList(raw.operations, VALID_OPS, ["add", "sub", "mul", "div"]);
  const domains = cleanList(raw.domains, VALID_DOMAINS, ["natural"]);
  const level = VALID_LEVELS.has(raw.level) ? raw.level : "n2";
  const durationSec = Math.max(60, Math.min(300, Math.round(Number(raw.durationSec || 180) / 60) * 60));
  const scoring = raw.scoring || {};
  const wrongPenalty = VALID_PENALTIES.has(Number(scoring.wrongPenalty)) ? Number(scoring.wrongPenalty) : 50;
  const lockSeconds = VALID_LOCKS.has(Number(scoring.lockSeconds)) ? Number(scoring.lockSeconds) : 5;
  const leaderboardMode = ["live", "after", "hidden"].includes(raw.leaderboardMode) ? raw.leaderboardMode : "after";
  return {
    version: 4,
    operations,
    domains,
    level,
    durationSec,
    scoring: {
      correctPoints: 100,
      wrongPenalty,
      lockSeconds,
      speedBonus: scoring.speedBonus !== false,
      streakBonus: scoring.streakBonus !== false,
      allowNegative: scoring.allowNegative !== false,
      showSolution: scoring.showSolution !== false
    },
    leaderboardMode,
    roundMode: "live"
  };
}

function officialHighscoreConfig(domain, level) {
  const selectedDomain = ["natural", "integer", "decimal", "fraction", "mixed", "rounding"].includes(domain) ? domain : "natural";
  const selectedLevel = VALID_LEVELS.has(level) ? level : "n2";
  const rounding = selectedDomain === "rounding";
  return {
    boardId: rounding ? `v2_rounding_${selectedLevel}` : `v1_${selectedDomain}_${selectedLevel}`,
    config: {
      version: 4,
      operations: rounding ? ["round"] : ["add", "sub", "mul", "div"],
      domains: rounding ? ["decimal"] : selectedDomain === "mixed" ? ["natural", "integer", "decimal", "fraction"] : [selectedDomain],
      level: selectedLevel,
      durationSec: 120,
      scoring: {
        correctPoints: 100,
        wrongPenalty: 100,
        lockSeconds: 3,
        speedBonus: true,
        streakBonus: true,
        allowNegative: true,
        showSolution: false
      },
      leaderboardMode: "after",
      roundMode: "highscore"
    }
  };
}

function cleanSummary(raw = {}) {
  const total = Math.max(0, Math.min(500, Math.trunc(Number(raw.total || raw.answered || 0))));
  const correct = Math.max(0, Math.min(total, Math.trunc(Number(raw.correct || 0))));
  const bestStreak = Math.max(0, Math.min(correct, Math.trunc(Number(raw.bestStreak || 0))));
  const score = Math.max(-100000, Math.min(1000000, Math.trunc(Number(raw.score || 0))));
  return { total, correct, bestStreak, score };
}

async function leaderboard(boardId, limit = 20) {
  const snap = await db.collection("fastQuizBoards").doc(boardId).collection("scores")
    .orderBy("score", "desc").limit(Math.max(1, Math.min(30, limit))).get();
  return snap.docs.map((doc, index) => {
    const value = doc.data();
    return {
      rank: index + 1,
      name: text(value.name, 24),
      score: Number(value.score || 0),
      correct: Number(value.correct || 0),
      total: Number(value.total || 0),
      bestStreak: Number(value.bestStreak || 0)
    };
  });
}

async function createRoom(payload) {
  const config = cleanConfig(payload.config);
  const hostToken = newToken();
  const now = Date.now();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const ref = db.collection("fastQuizRooms").doc(code);
    try {
      await ref.create({
        version: 4,
        code,
        seed: randomBytes(4).readUInt32BE(0),
        config,
        status: "waiting",
        hostTokenHash: hashToken(hostToken),
        playerCount: 0,
        createdAtMs: now,
        startsAtMs: null,
        endsAtMs: null,
        expiresAtMs: now + ROOM_TTL_MS,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      return { code, hostToken, config, maxPlayers: MAX_PLAYERS };
    } catch (err) {
      if (![6, "6", "ALREADY_EXISTS", "already-exists"].includes(err?.code)) throw err;
    }
  }
  fail("room_code_unavailable", "Es konnte kein freier Rundencode erzeugt werden.", 503);
}

async function getRoomOrFail(code) {
  const cleanCode = String(code || "").replace(/\D/g, "").slice(0, 6);
  if (cleanCode.length !== 6) fail("room_code_invalid", "Bitte einen sechsstelligen Rundencode eingeben.");
  const ref = db.collection("fastQuizRooms").doc(cleanCode);
  const snap = await ref.get();
  if (!snap.exists) fail("room_not_found", "Diese Runde wurde nicht gefunden.", 404);
  const room = snap.data();
  if (Number(room.expiresAtMs || 0) < Date.now()) fail("room_expired", "Diese Runde ist abgelaufen.", 410);
  return { code: cleanCode, ref, room };
}

async function joinRoom(payload) {
  const name = cleanName(payload.name);
  const { code, ref } = await getRoomOrFail(payload.code);
  const playerId = randomUUID();
  const playerToken = newToken();
  const playerRef = ref.collection("players").doc(playerId);
  let config;
  let seed;
  await db.runTransaction(async tx => {
    const roomSnap = await tx.get(ref);
    if (!roomSnap.exists) fail("room_not_found", "Diese Runde wurde nicht gefunden.", 404);
    const room = roomSnap.data();
    if (room.status !== "waiting") fail("room_started", "Diese Live-Runde wurde bereits gestartet.", 409);
    if (Number(room.playerCount || 0) >= MAX_PLAYERS) fail("room_full", `Die Runde ist mit ${MAX_PLAYERS} Teilnehmenden voll.`, 409);
    config = room.config;
    seed = room.seed;
    tx.create(playerRef, {
      id: playerId,
      tokenHash: hashToken(playerToken),
      name,
      status: "ready",
      score: 0,
      correct: 0,
      total: 0,
      bestStreak: 0,
      joinedAtMs: Date.now(),
      updatedAt: FieldValue.serverTimestamp(),
      finishedAtMs: null
    });
    tx.update(ref, { playerCount: Number(room.playerCount || 0) + 1, updatedAt: FieldValue.serverTimestamp() });
  });
  return { code, playerId, playerToken, name, config, seed, maxPlayers: MAX_PLAYERS };
}

function hostAllowed(room, token) {
  return Boolean(token) && hashToken(token) === room.hostTokenHash;
}

async function startRoom(payload) {
  const { code, ref, room } = await getRoomOrFail(payload.code);
  if (!hostAllowed(room, payload.hostToken)) fail("host_forbidden", "Lehrerzugriff ungültig.", 403);
  if (room.status !== "waiting") fail("room_already_started", "Die Runde wurde bereits gestartet.", 409);
  const startsAtMs = Date.now() + 5000;
  const endsAtMs = startsAtMs + Number(room.config.durationSec || 180) * 1000;
  await ref.update({ status: "running", startsAtMs, endsAtMs, updatedAt: FieldValue.serverTimestamp() });
  return { code, status: "running", startsAtMs, endsAtMs };
}

async function roomState(payload) {
  const { code, ref, room: rawRoom } = await getRoomOrFail(payload.code);
  let room = rawRoom;
  const now = Date.now();
  if (room.status === "running" && Number(room.endsAtMs || 0) > 0 && now >= Number(room.endsAtMs)) {
    await ref.update({ status: "finished", updatedAt: FieldValue.serverTimestamp() }).catch(() => {});
    room = { ...room, status: "finished" };
  }

  const isHost = hostAllowed(room, payload.hostToken);
  const canShowLeaderboard = isHost || room.config.leaderboardMode === "live" || (room.config.leaderboardMode === "after" && room.status === "finished");
  let players = [];

  if (isHost || canShowLeaderboard) {
    const playersSnap = await ref.collection("players").get();
    players = playersSnap.docs.map(doc => {
      const p = doc.data();
      return {
        id: p.id || doc.id,
        name: text(p.name, 24),
        status: p.status || "ready",
        score: Number(p.score || 0),
        correct: Number(p.correct || 0),
        total: Number(p.total || 0),
        bestStreak: Number(p.bestStreak || 0),
        joinedAtMs: Number(p.joinedAtMs || 0)
      };
    });
    players.sort((a, b) => b.score - a.score || b.correct - a.correct || a.joinedAtMs - b.joinedAtMs);
  }

  return {
    code,
    status: room.status,
    seed: room.seed,
    config: room.config,
    playerCount: Number(room.playerCount || players.length || 0),
    maxPlayers: MAX_PLAYERS,
    startsAtMs: room.startsAtMs || null,
    endsAtMs: room.endsAtMs || null,
    players: isHost ? players : [],
    leaderboard: canShowLeaderboard ? players.slice(0, 30) : []
  };
}

async function submitLive(payload) {
  const { ref, room } = await getRoomOrFail(payload.code);
  const playerId = String(payload.playerId || "").slice(0, 80);
  if (!playerId) fail("player_invalid", "Spielerkennung fehlt.");
  const playerRef = ref.collection("players").doc(playerId);
  const playerSnap = await playerRef.get();
  if (!playerSnap.exists) fail("player_not_found", "Teilnahme wurde nicht gefunden.", 404);
  const player = playerSnap.data();
  if (hashToken(payload.playerToken) !== player.tokenHash) fail("player_forbidden", "Spielerzugriff ungültig.", 403);
  const now = Date.now();
  if (!["running", "finished"].includes(room.status)) fail("room_not_running", "Die Runde läuft noch nicht.", 409);
  if (Number(room.startsAtMs || 0) && now < Number(room.startsAtMs) - 2000) fail("room_not_started", "Die Runde wurde noch nicht gestartet.", 409);
  if (Number(room.endsAtMs || 0) && now > Number(room.endsAtMs) + 45000) fail("room_closed", "Die Runde ist bereits abgeschlossen.", 410);
  const summary = cleanSummary(payload.summary);
  const finished = Boolean(payload.finished) || now >= Number(room.endsAtMs || Number.MAX_SAFE_INTEGER);
  await playerRef.update({
    ...summary,
    status: finished ? "finished" : "running",
    finishedAtMs: finished ? now : null,
    updatedAt: FieldValue.serverTimestamp()
  });
  return { saved: true, status: finished ? "finished" : "running" };
}

async function createHighscoreAttempt(payload) {
  const name = cleanName(payload.name);
  const playerKey = cleanPlayerKey(payload.playerKey);
  const { boardId, config } = officialHighscoreConfig(payload.domain, payload.level);
  const attemptId = randomUUID();
  const attemptToken = newToken();
  const seed = randomBytes(4).readUInt32BE(0);
  const startsAtMs = Date.now();
  const endsAtMs = startsAtMs + config.durationSec * 1000;
  await db.collection("fastQuizHighscoreAttempts").doc(attemptId).create({
    version: 4,
    attemptId,
    tokenHash: hashToken(attemptToken),
    playerKey,
    name,
    boardId,
    config,
    seed,
    status: "running",
    startsAtMs,
    endsAtMs,
    expiresAtMs: endsAtMs + 15 * 60 * 1000,
    createdAt: FieldValue.serverTimestamp()
  });
  return { attemptId, attemptToken, boardId, config, seed, startsAtMs, endsAtMs, leaderboard: await leaderboard(boardId, 20) };
}

async function finishHighscoreAttempt(payload) {
  const attemptId = String(payload.attemptId || "").slice(0, 80);
  const ref = db.collection("fastQuizHighscoreAttempts").doc(attemptId);
  const snap = await ref.get();
  if (!snap.exists) fail("attempt_not_found", "Highscore-Versuch wurde nicht gefunden.", 404);
  const attempt = snap.data();
  if (hashToken(payload.attemptToken) !== attempt.tokenHash) fail("attempt_forbidden", "Highscore-Versuch ungültig.", 403);
  if (attempt.status !== "running") fail("attempt_finished", "Dieser Versuch wurde bereits gespeichert.", 409);
  const now = Date.now();
  if (now < Number(attempt.endsAtMs) - 5000) fail("attempt_too_early", "Der Highscore-Versuch ist noch nicht beendet.", 409);
  if (now > Number(attempt.endsAtMs) + 60000) fail("attempt_expired", "Der Highscore-Versuch ist abgelaufen.", 410);
  const summary = cleanSummary(payload.summary);
  const scoreRef = db.collection("fastQuizBoards").doc(attempt.boardId).collection("scores").doc(attempt.playerKey);
  let personalBest = summary.score;
  let improved = false;
  await db.runTransaction(async tx => {
    const old = await tx.get(scoreRef);
    const oldScore = old.exists ? Number(old.data().score || 0) : Number.NEGATIVE_INFINITY;
    personalBest = Math.max(oldScore, summary.score);
    if (summary.score > oldScore) {
      improved = true;
      tx.set(scoreRef, {
        playerKey: attempt.playerKey,
        name: attempt.name,
        ...summary,
        boardId: attempt.boardId,
        updatedAtMs: now,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    tx.update(ref, { status: "finished", summary, finishedAtMs: now, updatedAt: FieldValue.serverTimestamp() });
  });
  return { saved: true, improved, personalBest, leaderboard: await leaderboard(attempt.boardId, 20) };
}

async function getHighscoreBoard(payload) {
  const { boardId, config } = officialHighscoreConfig(payload.domain, payload.level);
  return { boardId, config, leaderboard: await leaderboard(boardId, 20) };
}

async function dispatch(action, payload) {
  switch (action) {
    case "ping": return { service: "gradecrew-fast-quiz", version: 4, maxPlayers: MAX_PLAYERS };
    case "createRoom": return createRoom(payload);
    case "joinRoom": return joinRoom(payload);
    case "roomState": return roomState(payload);
    case "startRoom": return startRoom(payload);
    case "submitLive": return submitLive(payload);
    case "createHighscoreAttempt": return createHighscoreAttempt(payload);
    case "finishHighscoreAttempt": return finishHighscoreAttempt(payload);
    case "highscoreBoard": return getHighscoreBoard(payload);
    default: fail("action_unknown", "Unbekannte Fast-Quiz-Aktion.", 404);
  }
}

exports.fastQuizApi = onRequest({ region: REGION, cors: true, timeoutSeconds: 30, memory: "256MiB", maxInstances: 20 }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: { code: "method_not_allowed", message: "Nur POST ist erlaubt." } });
    return;
  }
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const data = await dispatch(String(body.action || ""), body.payload && typeof body.payload === "object" ? body.payload : {});
    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("Fast Quiz API error", { code: err.apiCode || err.code, message: err.message });
    res.status(Number(err.httpStatus || 500)).json({
      ok: false,
      error: {
        code: String(err.apiCode || "internal"),
        message: err.httpStatus ? String(err.message) : "Fast Quiz konnte die Anfrage nicht verarbeiten."
      }
    });
  }
});

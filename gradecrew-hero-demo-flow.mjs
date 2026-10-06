export function createDemoFlow({ onChange, reducedMotion = false, schedule = setTimeout, cancel = clearTimeout }) {
  const crew = ['remy', 'emmi', 'wilma'];
  let state = null;
  let timer = null;
  function clear() { if (timer !== null) cancel(timer); timer = null; }
  function emit() { onChange({ ...state }); }
  function advance() {
    clear();
    if (!state?.running || state.paused) return;
    if (state.phase < 2) {
      timer = schedule(() => { timer = null; nextPhase(); }, 1800);
    }
  }
  function nextPhase() {
    if (!state || state.phase >= 2) return false;
    clear();
    state.phase += 1;
    state.running = state.phase < 2;
    emit();
    advance();
    return true;
  }
  function start(name, tutorial = false) {
    if (!crew.includes(name)) return;
    clear();
    state = { name, tutorial, index: crew.indexOf(name), phase: reducedMotion ? 2 : 0, running: !reducedMotion, paused: false };
    emit(); advance();
  }
  return {
    start,
    replay() { if (state) start(state.name, state.tutorial); },
    nextPhase,
    togglePause() {
      if (!state?.running) return;
      state.paused = !state.paused;
      if (state.paused) clear(); else advance();
      emit();
    },
    next() {
      if (!state?.tutorial) return false;
      clear();
      if (state.index === crew.length - 1) { state.running = false; emit(); return false; }
      start(crew[state.index + 1], true); return true;
    },
    stop() { clear(); state = null; }
  };
}

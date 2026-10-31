/* ============================================================
   Learning Jeopardy! — NES-style clone, multiple-choice edition
   Round 1 (Jeopardy!) -> Round 2 (Double Jeopardy!) -> Final
   Jeopardy!, with Daily Doubles and classic scoring rules.
   Every clue offers a choice: pick one of four answers for
   points, or click the Host for help (he tells you the answer,
   in text, and you score nothing).
   ============================================================ */

const BEST_KEY = 'learningJeopardyNES.best';
const ROUND1_VALUES = [100, 200, 300, 400, 500];
const ROUND2_VALUES = [200, 400, 600, 800, 1000];

// Question level (1-3) used for each board row, top to bottom.
const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    blurb: 'Mostly level-1 fundamentals. Great for learning the basics.',
    r1: [1, 1, 1, 1, 2],
    r2: [1, 1, 2, 2, 2],
    final: [1, 2],
  },
  normal: {
    label: 'Normal',
    blurb: 'A classic climb from fundamentals to tough math.',
    r1: [1, 1, 2, 2, 3],
    r2: [1, 2, 2, 3, 3],
    final: [2, 3],
  },
  hard: {
    label: 'Hard',
    blurb: 'Advanced questions from the very first clue.',
    r1: [2, 2, 2, 3, 3],
    r2: [2, 3, 3, 3, 3],
    final: [3],
  },
};

// Round 1 favors broader/history/fundamentals categories; Round 2
// (Double Jeopardy) leans into the deep technical math categories.
// Ports & Protocols has a big enough pool (96) to appear in both
// rounds without repeating a question in the same game.
const ROUND1_CATEGORY_IDS = ['networkingCore', 'portsProtocols', 'internetPlumbing', 'hackerHistory', 'securityIncidents'];
const ROUND2_CATEGORY_IDS = ['portMath', 'hexBinaryAscii', 'subnetMath', 'toolsCulture', 'portsProtocols'];

const state = {
  difficulty: 'normal',
  players: [],
  currentPicker: 0,
  round: 1,
  board: null,
  usedIds: new Set(),
  activeCell: null,
  final: null,
};

/* ---------------- Utilities ---------------- */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getCategoryMeta(catId) {
  return CATEGORIES.find((c) => c.id === catId);
}

// Prefer the exact level, then the nearest level (easier first), so
// categories missing a level degrade gracefully instead of jumping
// to the opposite end of the difficulty range.
function nearestUnusedCandidates(pool, desiredLevel) {
  for (let d = 0; d <= 2; d++) {
    const levels = d === 0 ? [desiredLevel] : [desiredLevel - d, desiredLevel + d];
    for (const lvl of levels) {
      const c = pool.filter((q) => q.level === lvl && !state.usedIds.has(q.id));
      if (c.length) return c;
    }
  }
  return null;
}

function pickQuestionForCategory(catId, desiredLevel) {
  const pool = QUESTIONS_BY_CATEGORY[catId];
  let candidates = nearestUnusedCandidates(pool, desiredLevel);
  if (!candidates) {
    // Whole category exhausted this game — remix just this category's pool.
    pool.forEach((q) => state.usedIds.delete(q.id));
    candidates = nearestUnusedCandidates(pool, desiredLevel);
  }
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  state.usedIds.add(chosen.id);
  return chosen;
}

function answerLine(q) {
  return `The correct response is "${q.answer}." ${q.explanation} Memory aid: ${q.memory}`;
}

/* ---------------- Title screen ---------------- */

const titleEls = {
  diffBtns: document.querySelectorAll('.diff-btn'),
  diffBlurb: document.getElementById('difficultyBlurb'),
  countBtns: document.querySelectorAll('.count-btn'),
  nameInputs: document.getElementById('playerNameInputs'),
  beginBtn: document.getElementById('beginBtn'),
  bestRecord: document.getElementById('bestRecord'),
};

function bestKey() {
  return `${BEST_KEY}.${state.difficulty}`;
}

function renderBestRecord() {
  titleEls.bestRecord.hidden = true;
  try {
    const raw = localStorage.getItem(bestKey());
    if (!raw) return;
    const best = JSON.parse(raw);
    titleEls.bestRecord.hidden = false;
    titleEls.bestRecord.textContent = `\u{1F3C6} Best score on ${DIFFICULTIES[state.difficulty].label}: $${best.score}`;
  } catch (e) { /* localStorage unavailable */ }
}

function saveBestRecord(score) {
  try {
    const raw = localStorage.getItem(bestKey());
    const best = raw ? JSON.parse(raw) : { score: -Infinity };
    if (score > best.score) localStorage.setItem(bestKey(), JSON.stringify({ score }));
  } catch (e) { /* localStorage unavailable */ }
}

function selectDifficulty(diff) {
  state.difficulty = diff;
  titleEls.diffBtns.forEach((b) => b.classList.toggle('selected', b.dataset.diff === diff));
  titleEls.diffBlurb.textContent = DIFFICULTIES[diff].blurb;
  renderBestRecord();
}

titleEls.diffBtns.forEach((btn) => {
  btn.addEventListener('click', () => selectDifficulty(btn.dataset.diff));
});

function renderNameInputs(count) {
  titleEls.nameInputs.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pixel-input';
    input.placeholder = count === 1 ? 'Your name (optional)' : `Player ${i + 1} name`;
    input.dataset.slot = String(i);
    titleEls.nameInputs.appendChild(input);
  }
  titleEls.beginBtn.hidden = false;
}

titleEls.countBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    titleEls.countBtns.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    renderNameInputs(parseInt(btn.dataset.count, 10));
  });
});

function startNewBoardGame() {
  state.currentPicker = 0;
  state.usedIds = new Set();
  state.round = 1;
  state.final = null;
  state.board = buildBoard(1);
  showScreen('screen-board');
  renderBoard();
  updateScoreboard();
  updateTurnBanner();
}

titleEls.beginBtn.addEventListener('click', () => {
  const inputs = titleEls.nameInputs.querySelectorAll('input');
  const players = [];
  inputs.forEach((input, i) => {
    const name = input.value.trim() || (inputs.length === 1 ? 'You' : `Player ${i + 1}`);
    players.push({ name, score: 0 });
  });
  if (players.length === 0) players.push({ name: 'You', score: 0 });
  state.players = players;
  startNewBoardGame();
});

/* ---------------- Board building & rendering ---------------- */

function buildBoard(round) {
  const diff = DIFFICULTIES[state.difficulty];
  const values = round === 1 ? ROUND1_VALUES : ROUND2_VALUES;
  const levels = round === 1 ? diff.r1 : diff.r2;
  const catIds = round === 1 ? ROUND1_CATEGORY_IDS : ROUND2_CATEGORY_IDS;

  const cells = catIds.map((catId, colIndex) => {
    const meta = getCategoryMeta(catId);
    return levels.map((lvl, row) => ({
      catIndex: colIndex,
      catId,
      catName: meta.name,
      catIcon: meta.icon,
      row,
      value: values[row],
      used: false,
      isDailyDouble: false,
      wagerAmount: null,
      question: pickQuestionForCategory(catId, lvl),
    }));
  });

  const flat = [];
  cells.forEach((col) => col.forEach((c) => flat.push(c)));
  const ddCount = round === 1 ? 1 : 2;
  shuffle(flat).slice(0, ddCount).forEach((c) => { c.isDailyDouble = true; });

  return { round, values, cells };
}

const boardEls = {
  categoryRow: document.getElementById('categoryRow'),
  cellGrid: document.getElementById('cellGrid'),
  roundBanner: document.getElementById('roundBanner'),
  scoreboard: document.getElementById('scoreboard'),
  turnBanner: document.getElementById('turnBanner'),
};

function renderBoard() {
  const roundName = state.round === 1 ? 'Jeopardy!' : 'Double Jeopardy!';
  boardEls.roundBanner.textContent = `${roundName} · ${DIFFICULTIES[state.difficulty].label}`;

  boardEls.categoryRow.innerHTML = '';
  state.board.cells.forEach((col) => {
    const meta = col[0];
    const div = document.createElement('div');
    div.className = 'category-cell';
    div.innerHTML = `<span class="cat-icon">${meta.catIcon}</span><span>${escapeHtml(meta.catName)}</span>`;
    boardEls.categoryRow.appendChild(div);
  });

  boardEls.cellGrid.innerHTML = '';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = state.board.cells[col][row];
      const div = document.createElement('div');
      div.className = 'value-cell' + (cell.used ? ' used' : ' clickable');
      div.textContent = cell.used ? '' : `$${cell.value}`;
      if (!cell.used) div.addEventListener('click', () => selectCell(cell));
      boardEls.cellGrid.appendChild(div);
    }
  }
}

function updateScoreboard() {
  boardEls.scoreboard.innerHTML = '';
  state.players.forEach((p, i) => {
    const pill = document.createElement('div');
    pill.className = 'score-pill' + (i === state.currentPicker ? ' active-turn' : '');
    pill.innerHTML = `<span>${escapeHtml(p.name)}</span><span class="score-amt${p.score < 0 ? ' negative' : ''}">$${p.score}</span>`;
    boardEls.scoreboard.appendChild(pill);
  });
}

function updateTurnBanner() {
  boardEls.turnBanner.textContent = state.players.length > 1
    ? `${state.players[state.currentPicker].name}'s turn — pick a clue from the board`
    : 'Pick a clue from the board';
}

function boardComplete() {
  return state.board.cells.every((col) => col.every((c) => c.used));
}

/* ---------------- Clue flow ---------------- */

const clueStage = document.getElementById('clueStage');
const clueHostDock = document.getElementById('clueHostDock');

function selectCell(cell) {
  cell.used = true;
  state.activeCell = cell;
  SFX.select();
  showScreen('screen-clue');
  Host.mount(clueHostDock);
  if (cell.isDailyDouble) renderDailyDoubleWager(cell);
  else renderClueScreen(cell, cell.value, { forceAnswer: false });
}

function renderDailyDoubleWager(cell) {
  SFX.dailyDouble();
  const picker = state.players[state.currentPicker];
  const roundMax = state.round === 1 ? 500 : 1000;
  const maxWager = Math.max(picker.score, roundMax);
  const suggested = Math.min(Math.max(picker.score, 100), maxWager);

  clueStage.innerHTML = `
    <div class="daily-double-banner">DAILY DOUBLE!</div>
    <p class="wager-info">${escapeHtml(picker.name)}, wager between $0 and $${maxWager}</p>
    <div class="answer-input-row">
      <input type="number" id="wagerInput" class="pixel-input" min="0" max="${maxWager}" value="${suggested}" />
    </div>
    <div class="action-row">
      <button type="button" id="btnLockWager" class="nes-btn good">Lock In Wager</button>
      <button type="button" id="btnPassDD" class="nes-btn secondary">Pass — Ask the Host (no points)</button>
    </div>
  `;

  Host.say(`It's a Daily Double in ${cell.catName}! How much will you wager, ${picker.name}?`, 'happy');
  Host.setCaption('');
  Host.onAsk(() => Host.say('Lock in a wager first — or pass, and I’ll just tell you the answer.', 'talk'));

  document.getElementById('btnLockWager').addEventListener('click', () => {
    const input = document.getElementById('wagerInput');
    let val = parseInt(input.value, 10);
    if (Number.isNaN(val)) val = 0;
    val = Math.min(Math.max(val, 0), maxWager);
    cell.wagerAmount = val;
    renderClueScreen(cell, val, { forceAnswer: true });
  });

  document.getElementById('btnPassDD').addEventListener('click', () => {
    const options = renderClueScreen(cell, 0, { forceAnswer: false, label: 'No points' });
    askHostForHelp(cell, options);
  });
}

// Renders the clue with 4 shuffled options and returns the option order.
function renderClueScreen(cell, value, { forceAnswer, label }) {
  const options = shuffle([cell.question.answer, ...cell.question.wrong]);
  const picker = state.players[state.currentPicker];

  clueStage.innerHTML = `
    <div class="clue-meta-row"><span>${cell.catIcon} ${escapeHtml(cell.catName)}</span><span>${label || `$${value}`}</span></div>
    <div class="clue-text">${escapeHtml(cell.question.question)}</div>
    <div class="mc-grid">
      ${options.map((opt, i) => `<button type="button" class="mc-option" data-idx="${i}">${escapeHtml(opt)}</button>`).join('')}
    </div>
    ${forceAnswer ? '' : '<button type="button" id="btnAskHost" class="nes-btn secondary teach-link">\u{1F399}️ Ask the Host for Help (no points)</button>'}
    <div id="clueResult"></div>
  `;

  clueStage.querySelectorAll('.mc-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      gradeMultipleChoice(cell, value, options, options[idx]);
    });
  });

  if (forceAnswer) {
    Host.say(`$${value} on the line, ${picker.name}. No help on a Daily Double — good luck!`, 'talk');
    Host.setCaption('');
    Host.onAsk(() => Host.say('You’ve already wagered, so you’re on your own! Pick an answer.', 'talk'));
  } else {
    const ask = () => askHostForHelp(cell, options);
    document.getElementById('btnAskHost').addEventListener('click', ask);
    Host.say(`${cell.catName} for $${value}. Stuck? Click me and I'll tell you the answer — but you won't score.`, 'talk');
    Host.setCaption('Click me for help!');
    Host.onAsk(ask);
  }

  return options;
}

function lockOptions(options, answer, chosen) {
  clueStage.querySelectorAll('.mc-option').forEach((btn, i) => {
    btn.disabled = true;
    if (options[i] === answer) btn.classList.add('correct');
    else if (options[i] === chosen) btn.classList.add('chosen-wrong');
  });
  const askBtn = document.getElementById('btnAskHost');
  if (askBtn) askBtn.remove();
  Host.setCaption('');
  Host.onAsk(() => Host.finish());
}

function showClueResult(noteHtml, noteClass, onContinue) {
  document.getElementById('clueResult').innerHTML = `
    <p class="result-note ${noteClass}">${noteHtml}</p>
    <div class="action-row"><button type="button" id="btnContinue" class="nes-btn big">Continue</button></div>
  `;
  document.getElementById('btnContinue').addEventListener('click', onContinue);
}

function askHostForHelp(cell, options) {
  lockOptions(options, cell.question.answer, null);
  Host.say(`Happy to help! ${answerLine(cell.question)}`, 'talk');
  showClueResult('No points this time — but now you know!', 'neutral', () => {
    advanceTurn();
    returnToBoard();
  });
}

function gradeMultipleChoice(cell, value, options, chosen) {
  const q = cell.question;
  const correct = chosen === q.answer;
  const picker = state.players[state.currentPicker];

  lockOptions(options, q.answer, chosen);

  if (correct) {
    picker.score += value;
    SFX.correct();
    Host.say(`Correct! ${q.explanation} Memory aid: ${q.memory}`, 'happy');
    showClueResult(`${escapeHtml(picker.name)} earns $${value}.`, 'good', returnToBoard);
  } else {
    picker.score -= value;
    SFX.wrong();
    Host.say(`Sorry, ${picker.name}. ${answerLine(q)}`, 'sad');
    showClueResult(`${escapeHtml(picker.name)} loses $${value}.`, 'bad', () => {
      advanceTurn();
      returnToBoard();
    });
  }
}

function advanceTurn() {
  if (state.players.length > 1) {
    state.currentPicker = (state.currentPicker + 1) % state.players.length;
  }
}

function returnToBoard() {
  Host.finish();
  if (boardComplete()) {
    triggerRoundEnd();
    return;
  }
  showScreen('screen-board');
  renderBoard();
  updateScoreboard();
  updateTurnBanner();
}

/* ---------------- Round transitions ---------------- */

const transitionEls = {
  title: document.getElementById('transitionTitle'),
  body: document.getElementById('transitionBody'),
  btn: document.getElementById('transitionBtn'),
};

function renderScoreList() {
  return state.players.map((p) => `<div class="result-row"><span>${escapeHtml(p.name)}</span><span>$${p.score}</span></div>`).join('');
}

function triggerRoundEnd() {
  SFX.roundFanfare();
  if (state.round === 1) {
    transitionEls.title.textContent = 'Round 1 Complete!';
    transitionEls.body.innerHTML = renderScoreList();
    transitionEls.btn.textContent = 'Continue to Double Jeopardy!';
    transitionEls.btn.onclick = () => {
      // Trailing player picks first in Double Jeopardy, like the real show.
      let lowest = 0;
      state.players.forEach((p, i) => { if (p.score < state.players[lowest].score) lowest = i; });
      state.currentPicker = lowest;
      state.round = 2;
      state.board = buildBoard(2);
      showScreen('screen-board');
      renderBoard();
      updateScoreboard();
      updateTurnBanner();
    };
  } else {
    transitionEls.title.textContent = 'Round 2 Complete!';
    transitionEls.body.innerHTML = renderScoreList();
    transitionEls.btn.textContent = 'Continue to Final Jeopardy!';
    transitionEls.btn.onclick = () => startFinalJeopardy();
  }
  showScreen('screen-transition');
}

/* ---------------- Final Jeopardy ---------------- */

const finalStage = document.getElementById('finalStage');
const finalHostDock = document.getElementById('finalHostDock');
let finalTimerHandle = null;

function startFinalJeopardy() {
  const levels = DIFFICULTIES[state.difficulty].final;
  const matching = QUESTION_BANK.filter((q) => levels.includes(q.level) && !state.usedIds.has(q.id));
  const pool = matching.length ? matching : QUESTION_BANK;
  const q = pool[Math.floor(Math.random() * pool.length)];
  state.usedIds.add(q.id);
  state.final = {
    questionObj: q,
    categoryName: getCategoryMeta(q.catId).name,
    options: shuffle([q.answer, ...q.wrong]),
    wagers: state.players.map(() => 0),
    choices: state.players.map(() => null),
    stage: 'category',
    activePlayerIndex: 0,
  };
  showScreen('screen-final');
  Host.mount(finalHostDock);
  Host.setCaption('');
  Host.onAsk(() => Host.say('No lifelines in Final Jeopardy — trust your gut!', 'talk'));
  renderFinalStage();
}

function renderFinalStage() {
  const f = state.final;

  if (f.stage === 'category') {
    finalStage.innerHTML = `
      <div class="clue-meta-row"><span>FINAL JEOPARDY!</span><span></span></div>
      <div class="clue-text">Category:<br/><strong>${escapeHtml(f.categoryName)}</strong></div>
      <div class="action-row"><button type="button" id="btnBeginWager" class="nes-btn big">Begin Wagering</button></div>
    `;
    Host.say(`Today's Final Jeopardy category is ${f.categoryName}. Time to make your wagers!`, 'happy');
    document.getElementById('btnBeginWager').addEventListener('click', () => {
      f.stage = 'wager';
      f.activePlayerIndex = 0;
      renderFinalStage();
    });
    return;
  }

  if (f.stage === 'wager') {
    if (f.activePlayerIndex >= state.players.length) {
      f.stage = 'clue';
      renderFinalStage();
      return;
    }
    const player = state.players[f.activePlayerIndex];
    const maxWager = Math.max(player.score, 0);
    finalStage.innerHTML = `
      <div class="pass-device-card">
        Pass the device to<br/><strong>${escapeHtml(player.name)}</strong><br/>
        Current score: $${player.score}
      </div>
      <div class="wager-info">Wager between $0 and $${maxWager}</div>
      <div class="answer-input-row">
        <input type="number" id="finalWagerInput" class="pixel-input" min="0" max="${maxWager}" value="0" />
      </div>
      <div class="action-row"><button type="button" id="btnLockFinalWager" class="nes-btn good big">Lock In Wager</button></div>
    `;
    Host.say(`${player.name}, you have $${player.score}. How much will you risk?`, 'talk');
    document.getElementById('btnLockFinalWager').addEventListener('click', () => {
      const input = document.getElementById('finalWagerInput');
      let val = parseInt(input.value, 10);
      if (Number.isNaN(val)) val = 0;
      val = Math.min(Math.max(val, 0), maxWager);
      f.wagers[f.activePlayerIndex] = val;
      f.activePlayerIndex++;
      renderFinalStage();
    });
    return;
  }

  if (f.stage === 'clue') {
    renderFinalClueWithTimer();
    return;
  }

  if (f.stage === 'answer') {
    if (f.activePlayerIndex >= state.players.length) {
      // Score every player now, once, before moving into the reveal stage.
      state.players.forEach((p, i) => {
        const correct = f.choices[i] === f.questionObj.answer;
        p.score += correct ? f.wagers[i] : -f.wagers[i];
      });
      f.stage = 'reveal';
      renderFinalStage();
      return;
    }
    const player = state.players[f.activePlayerIndex];
    finalStage.innerHTML = `
      <div class="pass-device-card">Pass the device to<br/><strong>${escapeHtml(player.name)}</strong></div>
      <div class="clue-text" style="font-size:0.85rem;">${escapeHtml(f.questionObj.question)}</div>
      <div class="mc-grid">
        ${f.options.map((opt, i) => `<button type="button" class="mc-option" data-idx="${i}">${escapeHtml(opt)}</button>`).join('')}
      </div>
    `;
    Host.say(`${player.name}, lock in your final answer.`, 'talk');
    finalStage.querySelectorAll('.mc-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        f.choices[f.activePlayerIndex] = f.options[idx];
        f.activePlayerIndex++;
        renderFinalStage();
      });
    });
    return;
  }

  if (f.stage === 'reveal') {
    renderFinalReveal();
  }
}

function renderFinalClueWithTimer() {
  const f = state.final;
  finalStage.innerHTML = `
    <div class="clue-meta-row"><span>${escapeHtml(f.categoryName)}</span><span id="finalTimerLabel">30s</span></div>
    <div class="clue-text">${escapeHtml(f.questionObj.question)}</div>
    <div class="timer-bar-outer"><div class="timer-bar-inner" id="finalTimerBar" style="width:100%"></div></div>
    <div class="action-row"><button type="button" id="btnFinalReady" class="nes-btn big">Everyone's Ready</button></div>
  `;
  Host.say('Here is the clue. You have 30 seconds to think it over.', 'talk');
  const label = document.getElementById('finalTimerLabel');
  const bar = document.getElementById('finalTimerBar');
  let t = 30;
  const finish = () => {
    clearInterval(finalTimerHandle);
    finalTimerHandle = null;
    f.stage = 'answer';
    f.activePlayerIndex = 0;
    renderFinalStage();
  };
  finalTimerHandle = setInterval(() => {
    t--;
    if (label) label.textContent = `${t}s`;
    if (bar) bar.style.width = `${(t / 30) * 100}%`;
    if (t <= 0) finish();
    else SFX.tick();
  }, 1000);
  document.getElementById('btnFinalReady').addEventListener('click', finish);
}

function renderFinalReveal() {
  const f = state.final;
  const rowsHtml = state.players.map((p, i) => {
    const correct = f.choices[i] === f.questionObj.answer;
    return `
      <div class="host-box">
        <div class="host-avatar">${correct ? '✅' : '❌'}</div>
        <div class="host-text" style="flex:1;">
          <span class="host-label">${escapeHtml(p.name)} wagered $${f.wagers[i]} and chose "${escapeHtml(f.choices[i] || '(no answer)')}"</span>
          ${correct ? `Correct! +$${f.wagers[i]}` : `Incorrect — −$${f.wagers[i]}`}
        </div>
      </div>
    `;
  }).join('');

  finalStage.innerHTML = `
    <div class="clue-meta-row"><span>${escapeHtml(f.categoryName)}</span><span></span></div>
    <div class="clue-text" style="font-size:0.85rem;">${escapeHtml(f.questionObj.question)}</div>
    ${rowsHtml}
    <div class="action-row"><button type="button" id="btnSeeResults" class="nes-btn big">See Final Results</button></div>
  `;
  const anyCorrect = f.choices.some((c) => c === f.questionObj.answer);
  Host.say(answerLine(f.questionObj), anyCorrect ? 'happy' : 'sad');
  document.getElementById('btnSeeResults').addEventListener('click', () => {
    Host.finish();
    showResults();
  });
}

/* ---------------- Results ---------------- */

const resultsEls = {
  body: document.getElementById('resultsBody'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  newGameBtn: document.getElementById('newGameBtn'),
};

function showResults() {
  SFX.win();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const topScore = sorted[0].score;
  saveBestRecord(topScore);

  resultsEls.body.innerHTML = `
    <div class="result-row"><span>Difficulty</span><span>${DIFFICULTIES[state.difficulty].label}</span></div>
    ${sorted.map((p) => `
      <div class="result-row${p.score === topScore ? ' winner' : ''}">
        <span>${p.score === topScore ? '\u{1F3C6} ' : ''}${escapeHtml(p.name)}</span>
        <span>$${p.score}</span>
      </div>
    `).join('')}
  `;

  showScreen('screen-results');
}

resultsEls.playAgainBtn.addEventListener('click', () => {
  state.players.forEach((p) => { p.score = 0; });
  startNewBoardGame();
});

resultsEls.newGameBtn.addEventListener('click', () => {
  state.players = [];
  state.board = null;
  state.final = null;

  titleEls.countBtns.forEach((b) => b.classList.remove('selected'));
  titleEls.nameInputs.innerHTML = '';
  titleEls.beginBtn.hidden = true;
  selectDifficulty(state.difficulty);
  showScreen('screen-title');
});

/* ---------------- Boot ---------------- */

selectDifficulty(state.difficulty);
showScreen('screen-title');

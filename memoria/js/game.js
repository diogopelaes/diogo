import { fetchAnimalDeck } from './api.js';
import { sound } from './sound.js';

const TOTAL_PAIRS = 18;
const NAMES_STORAGE_KEY = 'safari_memory_player_names';

const els = {
  board: document.getElementById('game-board'),
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingText: document.getElementById('loading-text'),
  progressFill: document.getElementById('progress-fill'),
  errorOverlay: document.getElementById('error-overlay'),
  errorText: document.getElementById('error-text'),
  retryBtn: document.getElementById('retry-btn'),
  themeSelect: document.getElementById('theme-select'),
  playersBtn: document.getElementById('players-btn'),
  soundBtn: document.getElementById('sound-btn'),
  restartBtn: document.getElementById('restart-btn'),
  playersModal: document.getElementById('players-modal'),
  playersForm: document.getElementById('players-form'),
  setupP1Name: document.getElementById('setup-p1-name'),
  setupP2Name: document.getElementById('setup-p2-name'),
  p1Card: document.getElementById('p1-card'),
  p2Card: document.getElementById('p2-card'),
  p1Name: document.getElementById('p1-name'),
  p2Name: document.getElementById('p2-name'),
  p1Score: document.getElementById('p1-score'),
  p2Score: document.getElementById('p2-score'),
  p1Moves: document.getElementById('p1-moves'),
  p2Moves: document.getElementById('p2-moves'),
  p1Streak: document.getElementById('p1-streak'),
  p2Streak: document.getElementById('p2-streak'),
  pairsValue: document.getElementById('pairs-value'),
  timerValue: document.getElementById('timer-value'),
  discoveryBanner: document.getElementById('discovery-banner'),
  discoveryText: document.getElementById('discovery-text'),
  victoryModal: document.getElementById('victory-modal'),
  victoryTrophy: document.getElementById('victory-trophy'),
  victoryTitle: document.getElementById('victory-title'),
  victorySubtitle: document.getElementById('victory-subtitle'),
  finalP1Box: document.getElementById('final-p1-box'),
  finalP2Box: document.getElementById('final-p2-box'),
  finalP1Name: document.getElementById('final-p1-name'),
  finalP2Name: document.getElementById('final-p2-name'),
  finalP1Score: document.getElementById('final-p1-score'),
  finalP2Score: document.getElementById('final-p2-score'),
  finalP1Moves: document.getElementById('final-p1-moves'),
  finalP2Moves: document.getElementById('final-p2-moves'),
  finalTime: document.getElementById('final-time'),
  playAgainBtn: document.getElementById('play-again-btn'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

const state = {
  theme: 'wildlife',
  currentPlayer: 1,
  players: {
    1: { score: 0, moves: 0, streak: 0 },
    2: { score: 0, moves: 0, streak: 0 }
  },
  flippedCards: [],
  matchedPairs: 0,
  isLocked: false,
  seconds: 0,
  timerId: null,
  hasStarted: false
};

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function getPlayerName(playerNum) {
  const input = playerNum === 1 ? els.p1Name : els.p2Name;
  const cleaned = input.value.trim();
  return cleaned || `Jogador ${playerNum}`;
}

function loadSavedNames() {
  try {
    const raw = localStorage.getItem(NAMES_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.p1) {
      els.p1Name.value = saved.p1;
      els.setupP1Name.value = saved.p1;
    }
    if (saved.p2) {
      els.p2Name.value = saved.p2;
      els.setupP2Name.value = saved.p2;
    }
  } catch {
    // ignore storage errors
  }
}

function openPlayersModal() {
  els.setupP1Name.value = els.p1Name.value;
  els.setupP2Name.value = els.p2Name.value;
  const radio = els.playersForm.querySelector(
    `input[name="setup-theme"][value="${state.theme}"]`
  );
  if (radio) radio.checked = true;
  els.playersModal.classList.remove('hidden');
  els.setupP1Name.focus();
  els.setupP1Name.select();
}

function applyPlayerNames(p1Raw, p2Raw) {
  const p1 = p1Raw.trim() || 'Jogador 1';
  const p2 = p2Raw.trim() || 'Jogador 2';
  els.p1Name.value = p1;
  els.p2Name.value = p2;
  savePlayerNames();
  const pill = els.discoveryBanner.querySelector('.discovery-pill');
  if (pill && !state.hasStarted) {
    pill.textContent = `Vez de ${getPlayerName(state.currentPlayer)}`;
  }
}

function savePlayerNames() {
  try {
    localStorage.setItem(
      NAMES_STORAGE_KEY,
      JSON.stringify({
        p1: els.p1Name.value.trim() || 'Jogador 1',
        p2: els.p2Name.value.trim() || 'Jogador 2'
      })
    );
  } catch {
    // ignore storage errors
  }
}

function updateSoundButton() {
  const muted = sound.isMuted();
  els.soundBtn.textContent = muted ? '🔇' : '🔊';
  els.soundBtn.title = muted ? 'Som desativado' : 'Som ativado';
  els.soundBtn.setAttribute('aria-pressed', String(!muted));
}

function updateHud() {
  const p1 = state.players[1];
  const p2 = state.players[2];

  els.p1Score.textContent = String(p1.score);
  els.p1Moves.textContent = String(p1.moves);
  els.p1Streak.textContent = `${p1.streak}🔥`;

  els.p2Score.textContent = String(p2.score);
  els.p2Moves.textContent = String(p2.moves);
  els.p2Streak.textContent = `${p2.streak}🔥`;

  els.p1Card.classList.toggle('is-active', state.currentPlayer === 1);
  els.p2Card.classList.toggle('is-active', state.currentPlayer === 2);

  els.pairsValue.textContent = `${state.matchedPairs} / ${TOTAL_PAIRS}`;
  els.timerValue.textContent = formatTime(state.seconds);
}

function setBanner(pillText, message, highlight = false) {
  const pill = els.discoveryBanner.querySelector('.discovery-pill');
  if (pill) pill.textContent = pillText;
  els.discoveryText.textContent = message;
  els.discoveryBanner.classList.toggle('is-highlight', highlight);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  if (state.hasStarted) return;
  state.hasStarted = true;
  state.timerId = setInterval(() => {
    state.seconds += 1;
    els.timerValue.textContent = formatTime(state.seconds);
  }, 1000);
}

function resetState() {
  stopTimer();
  state.currentPlayer = 1;
  state.players = {
    1: { score: 0, moves: 0, streak: 0 },
    2: { score: 0, moves: 0, streak: 0 }
  };
  state.flippedCards = [];
  state.matchedPairs = 0;
  state.isLocked = false;
  state.seconds = 0;
  state.hasStarted = false;

  updateHud();
  els.victoryModal.classList.add('hidden');
  setBanner(
    `Vez de ${getPlayerName(1)}`,
    'Vire duas cartas! Quem acertar o par continua jogando.',
    false
  );
}

function createCardElement(animal, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card';
  button.dataset.id = animal.id;
  button.dataset.name = animal.name;
  button.dataset.detail = animal.detail;
  button.style.setProperty('--deal-delay', `${index * 15}ms`);
  button.setAttribute('aria-label', `Carta ${index + 1}, virada para baixo`);

  const frontClass = animal.isArtwork ? 'card-face card-front card-front--artwork' : 'card-face card-front';

  button.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <span class="card-back-emblem" aria-hidden="true">🐾</span>
      </div>
      <div class="${frontClass}">
        <img src="${animal.image}" alt="${animal.name}" loading="eager" />
        <span class="card-label">${animal.name}</span>
      </div>
    </div>
  `;

  button.addEventListener('click', () => handleCardClick(button));
  return button;
}

function handleCardClick(cardEl) {
  if (
    state.isLocked ||
    cardEl.classList.contains('is-flipped') ||
    cardEl.classList.contains('is-matched')
  ) {
    return;
  }

  startTimer();
  sound.playFlip();
  cardEl.classList.add('is-flipped');
  cardEl.setAttribute('aria-label', `${cardEl.dataset.name}, revelada`);
  state.flippedCards.push(cardEl);

  if (state.flippedCards.length < 2) return;

  state.players[state.currentPlayer].moves += 1;
  state.isLocked = true;
  checkForMatch();
}

function checkForMatch() {
  const [first, second] = state.flippedCards;
  const isMatch = first.dataset.id === second.dataset.id;
  const activePlayer = state.players[state.currentPlayer];
  const activeName = getPlayerName(state.currentPlayer);

  if (isMatch) {
    state.matchedPairs += 1;
    activePlayer.score += 1;
    activePlayer.streak += 1;

    const ownerClass = state.currentPlayer === 1 ? 'is-matched-p1' : 'is-matched-p2';
    first.classList.add('is-matched', ownerClass);
    second.classList.add('is-matched', ownerClass);
    first.setAttribute('aria-label', `${first.dataset.name}, par de ${activeName}`);
    second.setAttribute('aria-label', `${second.dataset.name}, par de ${activeName}`);

    sound.playMatch();
    setBanner(
      `${activeName} acertou!`,
      `${first.dataset.name} (${first.dataset.detail}) · Continua jogando!`,
      true
    );

    state.flippedCards = [];
    state.isLocked = false;
    updateHud();

    if (state.matchedPairs === TOTAL_PAIRS) {
      handleVictory();
    }
    return;
  }

  activePlayer.streak = 0;
  sound.playMismatch();

  setTimeout(() => {
    first.classList.add('is-mismatch');
    second.classList.add('is-mismatch');
  }, 240);

  setTimeout(() => {
    first.classList.remove('is-flipped', 'is-mismatch');
    second.classList.remove('is-flipped', 'is-mismatch');
    first.setAttribute('aria-label', 'Carta virada para baixo');
    second.setAttribute('aria-label', 'Carta virada para baixo');

    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    state.flippedCards = [];
    state.isLocked = false;
    updateHud();
    setBanner(
      `Vez de ${getPlayerName(state.currentPlayer)}`,
      'Errou! O turno passou para o outro jogador.',
      false
    );
  }, 860);
}

function handleVictory() {
  stopTimer();
  sound.playVictory();

  const p1 = state.players[1];
  const p2 = state.players[2];
  const p1Name = getPlayerName(1);
  const p2Name = getPlayerName(2);

  els.finalP1Name.textContent = p1Name;
  els.finalP2Name.textContent = p2Name;
  els.finalP1Score.textContent = `${p1.score} ${p1.score === 1 ? 'par' : 'pares'}`;
  els.finalP2Score.textContent = `${p2.score} ${p2.score === 1 ? 'par' : 'pares'}`;
  els.finalP1Moves.textContent = `${p1.moves} jogadas`;
  els.finalP2Moves.textContent = `${p2.moves} jogadas`;
  els.finalTime.textContent = formatTime(state.seconds);

  els.finalP1Box.classList.remove('is-winner');
  els.finalP2Box.classList.remove('is-winner');

  if (p1.score > p2.score) {
    els.victoryTrophy.textContent = '🏆';
    els.victoryTitle.textContent = `${p1Name} venceu!`;
    els.victorySubtitle.textContent = `Vitória por ${p1.score} a ${p2.score} pares.`;
    els.finalP1Box.classList.add('is-winner');
  } else if (p2.score > p1.score) {
    els.victoryTrophy.textContent = '🏆';
    els.victoryTitle.textContent = `${p2Name} venceu!`;
    els.victorySubtitle.textContent = `Vitória por ${p2.score} a ${p1.score} pares.`;
    els.finalP2Box.classList.add('is-winner');
  } else {
    els.victoryTrophy.textContent = '🤝';
    els.victoryTitle.textContent = 'Empate!';
    els.victorySubtitle.textContent = `Duelo equilibrado: ${p1.score} a ${p2.score} pares.`;
  }

  setTimeout(() => {
    els.victoryModal.classList.remove('hidden');
    launchConfetti();
  }, 450);
}

function launchConfetti() {
  const canvas = els.confettiCanvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f4b942', '#38bdf8', '#34d399', '#fb7185', '#fde047'];
  const particles = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 4.5,
    vy: 2.5 + Math.random() * 4.5,
    rot: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.rot += p.vRot;

      if (p.y < canvas.height + 30) {
        active += 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    frame += 1;
    if (active > 0 && frame < 260) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(tick);
}

async function initGame() {
  resetState();
  els.board.innerHTML = '';
  els.errorOverlay.classList.add('hidden');
  els.loadingOverlay.classList.remove('hidden');
  els.progressFill.style.width = '8%';
  els.loadingText.textContent = 'Buscando 18 animais na API...';

  try {
    const animals = await fetchAnimalDeck(state.theme, (loaded, total) => {
      const pct = Math.round((loaded / total) * 100);
      els.progressFill.style.width = `${pct}%`;
      els.loadingText.textContent = `Carregando imagens (${loaded}/${total})...`;
    });

    const deck = shuffleArray([...animals, ...animals]);
    const fragment = document.createDocumentFragment();
    deck.forEach((animal, index) => {
      fragment.appendChild(createCardElement(animal, index));
    });

    els.board.appendChild(fragment);
    els.loadingOverlay.classList.add('hidden');
  } catch (error) {
    console.error(error);
    els.loadingOverlay.classList.add('hidden');
    els.errorText.textContent =
      error?.message || 'Não foi possível carregar as imagens da API.';
    els.errorOverlay.classList.remove('hidden');
  }
}

els.themeSelect.addEventListener('change', (e) => {
  state.theme = e.target.value;
  initGame();
});

els.soundBtn.addEventListener('click', () => {
  sound.toggleMute();
  updateSoundButton();
});

els.playersBtn.addEventListener('click', openPlayersModal);

els.playersForm.addEventListener('submit', (e) => {
  e.preventDefault();
  applyPlayerNames(els.setupP1Name.value, els.setupP2Name.value);

  const selectedThemeInput = els.playersForm.querySelector(
    'input[name="setup-theme"]:checked'
  );
  const chosenTheme = selectedThemeInput ? selectedThemeInput.value : state.theme;
  els.playersModal.classList.add('hidden');

  if (chosenTheme !== state.theme) {
    state.theme = chosenTheme;
    els.themeSelect.value = chosenTheme;
    initGame();
  }
});

els.p1Name.addEventListener('input', () => {
  savePlayerNames();
  if (!state.hasStarted && state.currentPlayer === 1) {
    const pill = els.discoveryBanner.querySelector('.discovery-pill');
    if (pill) pill.textContent = `Vez de ${getPlayerName(1)}`;
  }
});

els.p2Name.addEventListener('input', () => {
  savePlayerNames();
  if (!state.hasStarted && state.currentPlayer === 2) {
    const pill = els.discoveryBanner.querySelector('.discovery-pill');
    if (pill) pill.textContent = `Vez de ${getPlayerName(2)}`;
  }
});

els.restartBtn.addEventListener('click', initGame);
els.retryBtn.addEventListener('click', initGame);
els.playAgainBtn.addEventListener('click', initGame);

loadSavedNames();
updateSoundButton();
initGame();

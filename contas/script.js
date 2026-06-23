// ──────────────────────────────────────────────
//  CEMEP Contas — Math Quiz with Pokémon Buddy
// ──────────────────────────────────────────────

const MESSAGES = {
  correct: [
    "Incrível! Você é fera! 🔥",
    "Perfeito! Continua assim! ⚡",
    "Mandou bem! Que inteligente! 🌟",
    "Arrasou! Tô orgulhoso de você! 💪",
    "Uau! Resposta certa! Bora mais! 🚀",
    "Sim! Isso aí! Genial! 🧠",
    "Que resposta! Impressionante! ✨",
  ],
  wrong: [
    "Quase! Tente de novo na próxima! 💙",
    "Não foi dessa vez, mas você consegue! 🤗",
    "Errou, mas não desanima! Você é capaz! 💪",
    "Continue tentando! Fica mais fácil! 😊",
    "Não tem problema! Aprender faz parte! 🌈",
  ],
  intro_mult: [
    "Ei! Vamos treinar multiplicação juntos?",
    "Hora de multiplicar! Você consegue!",
    "Boa sorte! Confio em você! ⭐",
  ],
  intro_div: [
    "Agora divisão! Bora lá! 💡",
    "Você já provou que é incrível! Divisão aqui!",
    "Metade do caminho feito! Arrasou! 🎯",
  ],
};

// ── Difficulty levels ──────────────────────────
// Each level: { label, gen() → { a, b, op, answer, display } }
const DIFFICULTY_LEVELS = [
  {
    label: "⭐ Fácil",
    genMult() {
      const a = rand(2, 9), b = rand(2, 9);
      return { a, b, op: "×", answer: a * b, display: `${a} × ${b}` };
    },
    genDiv() {
      const b = rand(2, 9), answer = rand(2, 9);
      const a = b * answer;
      return { a, b, op: "÷", answer, display: `${a} ÷ ${b}` };
    },
  },
  {
    label: "⭐⭐ Médio",
    genMult() {
      const a = rand(10, 25), b = rand(2, 9);
      return { a, b, op: "×", answer: a * b, display: `${a} × ${b}` };
    },
    genDiv() {
      const b = rand(2, 9), answer = rand(10, 25);
      const a = b * answer;
      return { a, b, op: "÷", answer, display: `${a} ÷ ${b}` };
    },
  },
  {
    label: "⭐⭐⭐ Difícil",
    genMult() {
      const a = rand(10, 49), b = rand(10, 25);
      return { a, b, op: "×", answer: a * b, display: `${a} × ${b}` };
    },
    genDiv() {
      const b = rand(10, 25), answer = rand(10, 25);
      const a = b * answer;
      return { a, b, op: "÷", answer, display: `${a} ÷ ${b}` };
    },
  },
  {
    label: "⭐⭐⭐⭐ Expert",
    genMult() {
      const a = rand(50, 99), b = rand(10, 49);
      return { a, b, op: "×", answer: a * b, display: `${a} × ${b}` };
    },
    genDiv() {
      const b = rand(10, 25), answer = rand(50, 99);
      const a = b * answer;
      return { a, b, op: "÷", answer, display: `${a} ÷ ${b}` };
    },
  },
  {
    label: "⭐⭐⭐⭐⭐ Mestre",
    genMult() {
      const a = parseFloat((rand(10, 99) + rand(1, 9) / 10).toFixed(1));
      const b = rand(2, 9);
      const ans = parseFloat((a * b).toFixed(2));
      return { a, b, op: "×", answer: ans, display: `${a} × ${b}` };
    },
    genDiv() {
      const b = rand(2, 9);
      const answer = parseFloat((rand(10, 99) + rand(1, 9) / 10).toFixed(1));
      const a = parseFloat((b * answer).toFixed(2));
      return { a, b, op: "÷", answer, display: `${a} ÷ ${b}` };
    },
  },
];

// ── Helpers ────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}
function roundAnswer(n) {
  return Math.round(n * 100) / 100;
}

// ── Generate 10 questions for a stage ─────────
function generateQuestions(stage) {
  const questions = [];
  // Distribute: 2 per level
  for (let lvl = 0; lvl < DIFFICULTY_LEVELS.length; lvl++) {
    for (let j = 0; j < 2; j++) {
      const d = DIFFICULTY_LEVELS[lvl];
      const q = stage === "mult" ? d.genMult() : d.genDiv();
      q.level = d.label;
      questions.push(q);
    }
  }
  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

// ── State ──────────────────────────────────────
let state = {
  stage: "mult",      // "mult" | "div"
  questions: [],
  current: 0,
  correctCount: 0,
  answeredFlags: [],  // true = correct, false = wrong, null = unanswered
  verified: false,
  pokemon: null,
  totalCorrect: 0,
  totalWrong: 0,
};

// ── DOM refs ───────────────────────────────────
const $ = id => document.getElementById(id);
const elStage1Dot = $("stage-dot-1");
const elStage2Dot = $("stage-dot-2");
const elStageLabel = $("stage-label");
const elPokeImg = $("pokemon-img");
const elPokeName = $("pokemon-name");
const elPokeMsg = $("pokemon-message");
const elPokeHp = $("pokemon-hp-fill");
const elProgressFill = $("progress-fill");
const elProgressText = $("progress-text");
const elScoreCorrect = $("score-correct");
const elScoreWrong = $("score-wrong");
const elDotsRow = $("dots-row");
const elQNumber = $("question-number");
const elDiffBadge = $("difficulty-badge");
const elQText = $("question-text");
const elAnswerInput = $("answer-input");
const elBtnVerify = $("btn-verify");
const elBtnNext = $("btn-next");
const elFeedback = $("feedback");
const elFeedbackIcon = $("feedback-icon");
const elFeedbackText = $("feedback-text");
const elCard = $("question-card");
const elFinalScreen = $("final-screen");
const elGameArea = $("game-area");
const elFinalPoke = $("final-pokemon-img");
const elFinalTitle = $("final-title");
const elFinalMsg = $("final-message");
const elFinalCorrect = $("final-correct");
const elFinalWrong = $("final-wrong");
const elFinalPct = $("final-pct");

// ── Pokémon API ────────────────────────────────
const POKEMON_COUNT = 151; // Gen 1 only — kid-friendly

async function fetchRandomPokemon() {
  const id = rand(1, POKEMON_COUNT);
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    return {
      id,
      name: data.name,
      sprite: data.sprites.other["official-artwork"].front_default ||
              data.sprites.front_default,
      types: data.types.map(t => t.type.name),
    };
  } catch {
    return { id: 25, name: "pikachu", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", types: ["electric"] };
  }
}

function setPokemon(poke) {
  state.pokemon = poke;
  elPokeImg.src = poke.sprite;
  elPokeName.textContent = poke.name;
  elFinalPoke.src = poke.sprite;
}

function pokeBounce() {
  elPokeImg.classList.remove("bounce");
  void elPokeImg.offsetWidth; // reflow
  elPokeImg.classList.add("bounce");
  setTimeout(() => elPokeImg.classList.remove("bounce"), 700);
}

function setPokeMessage(msg) {
  elPokeMsg.textContent = msg;
}

function updateHpBar() {
  const total = state.questions.length;
  const answered = state.current;
  const correct = state.correctCount;
  const pct = total > 0 ? Math.round((correct / Math.max(answered, 1)) * 100) : 100;
  elPokeHp.style.width = pct + "%";
  if (pct >= 70) {
    elPokeHp.style.background = "linear-gradient(90deg, #22c55e, #86efac)";
  } else if (pct >= 40) {
    elPokeHp.style.background = "linear-gradient(90deg, #f59e0b, #fcd34d)";
  } else {
    elPokeHp.style.background = "linear-gradient(90deg, #ef4444, #fca5a5)";
  }
}

// ── Click pokemon to change it ─────────────────
$("pokemon-section").addEventListener("click", async () => {
  const poke = await fetchRandomPokemon();
  setPokemon(poke);
  pokeBounce();
  setPokeMessage("Olá! Sou " + poke.name + "! Vamos nessa! 💪");
});

// ── Build dots ─────────────────────────────────
function buildDots() {
  elDotsRow.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement("div");
    dot.className = "q-dot" + (i === 0 ? " current" : "");
    dot.id = `q-dot-${i}`;
    elDotsRow.appendChild(dot);
  }
}

function updateDots() {
  for (let i = 0; i < 10; i++) {
    const dot = $(`q-dot-${i}`);
    if (!dot) continue;
    dot.className = "q-dot";
    if (i < state.current) {
      dot.classList.add(state.answeredFlags[i] ? "answered-correct" : "answered-wrong");
    } else if (i === state.current) {
      dot.classList.add("current");
    }
  }
}

// ── Display question ───────────────────────────
function showQuestion() {
  const q = state.questions[state.current];
  const total = state.questions.length;

  elQNumber.textContent = `Questão ${state.current + 1} de ${total}`;
  elDiffBadge.textContent = q.level;
  elQText.innerHTML = q.display.replace(/[×÷]/g, s =>
    `<span class="operation-symbol">${s}</span>`
  ) + ' <span class="operation-symbol">=</span> ?';

  elAnswerInput.value = "";
  elAnswerInput.focus();
  elFeedback.className = "feedback";
  elBtnNext.style.display = "none";
  elCard.className = "question-card";
  state.verified = false;
  elBtnVerify.disabled = false;
  elAnswerInput.disabled = false;

  updateProgress();
  updateDots();
  updateHpBar();

  // Poke message for stage changes
  if (state.current === 0) {
    const msgs = state.stage === "mult" ? MESSAGES.intro_mult : MESSAGES.intro_div;
    setPokeMessage(pick(msgs));
  }
}

function updateProgress() {
  const pct = Math.round((state.current / 10) * 100);
  elProgressFill.style.width = pct + "%";
  elProgressText.textContent = `${state.current}/10`;
  elScoreCorrect.textContent = state.correctCount;
  elScoreWrong.textContent = state.current - state.correctCount;
}

// ── Verify answer ──────────────────────────────
function verify() {
  if (state.verified) return;
  const raw = elAnswerInput.value.trim().replace(",", ".");
  const given = parseFloat(raw);
  if (isNaN(given)) {
    elAnswerInput.focus();
    elAnswerInput.style.borderColor = "var(--warning)";
    setTimeout(() => (elAnswerInput.style.borderColor = ""), 800);
    return;
  }

  const q = state.questions[state.current];
  const correct = Math.abs(roundAnswer(given) - roundAnswer(q.answer)) < 0.011;
  state.verified = true;
  elBtnVerify.disabled = true;
  elAnswerInput.disabled = true;

  if (correct) {
    state.correctCount++;
    state.totalCorrect++;
    state.answeredFlags[state.current] = true;
    elCard.classList.add("correct");
    elFeedback.className = "feedback correct-fb show";
    elFeedbackIcon.textContent = "🎉";
    elFeedbackText.textContent = pick(MESSAGES.correct);
    pokeBounce();
    setPokeMessage(pick(MESSAGES.correct));
  } else {
    state.totalWrong++;
    state.answeredFlags[state.current] = false;
    elCard.classList.add("wrong");
    elFeedback.className = "feedback wrong-fb show";
    elFeedbackIcon.textContent = "💙";
    elFeedbackText.textContent = `${pick(MESSAGES.wrong)} (Era: ${q.answer})`;
    setPokeMessage(pick(MESSAGES.wrong));
  }

  updateDots();
  updateHpBar();
  updateProgress();

  elBtnNext.style.display = "block";
  setTimeout(() => elBtnNext.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  elBtnNext.textContent =
    state.current < 9
      ? (state.stage === "mult" && state.current === 9) ? "Ir para Divisão →" : "Próxima →"
      : state.stage === "mult" ? "🚀 Ir para Divisão!" : "🏆 Ver Resultado!";
}

// ── Next question / stage ──────────────────────
function next() {
  state.current++;

  if (state.current >= 10) {
    if (state.stage === "mult") {
      // Switch to division
      startStage("div");
    } else {
      showFinal();
    }
    return;
  }
  showQuestion();
}

// ── Start a stage ──────────────────────────────
function startStage(stage) {
  state.stage = stage;
  state.current = 0;
  state.correctCount = 0;
  state.answeredFlags = [];
  state.questions = generateQuestions(stage);

  // Update stage indicator
  if (stage === "mult") {
    elStage1Dot.className = "stage-dot active";
    elStage2Dot.className = "stage-dot";
    elStageLabel.innerHTML = `Etapa <span>1 de 2</span> — Multiplicação ×`;
  } else {
    elStage1Dot.className = "stage-dot done";
    elStage2Dot.className = "stage-dot active";
    elStageLabel.innerHTML = `Etapa <span>2 de 2</span> — Divisão ÷`;
  }

  buildDots();
  showQuestion();
}

// ── Final screen ───────────────────────────────
function showFinal() {
  elGameArea.style.display = "none";
  elFinalScreen.className = "show";

  const total = 20;
  const correct = state.totalCorrect;
  const wrong = state.totalWrong;
  const pct = Math.round((correct / total) * 100);

  elFinalCorrect.textContent = correct;
  elFinalWrong.textContent = wrong;
  elFinalPct.textContent = pct + "%";

  if (pct >= 90) {
    elFinalTitle.textContent = "🏆 Campeão Pokémon!";
    elFinalMsg.textContent = `${state.pokemon?.name || "Pikachu"} ficou MUITO orgulhoso de você! Incrível!`;
  } else if (pct >= 70) {
    elFinalTitle.textContent = "⭐ Muito Bem!";
    elFinalMsg.textContent = `Excelente desempenho! Continue praticando e você chegará ao topo!`;
  } else if (pct >= 50) {
    elFinalTitle.textContent = "💪 Bom Esforço!";
    elFinalMsg.textContent = `Você está no caminho certo! Pratique mais e vai melhorar!`;
  } else {
    elFinalTitle.textContent = "📚 Continue Praticando!";
    elFinalMsg.textContent = `Cada erro é uma lição. Tente novamente e você vai melhorar!`;
  }

  // Confetti!
  launchConfetti(pct);

  // Pokémon celebration bounce
  pokeBounce();
}

// ── Confetti via canvas-confetti CDN ──────────
function launchConfetti(pct) {
  if (typeof confetti === "undefined") return;

  const count = Math.round(50 + pct * 2);

  // Burst from both sides
  const fire = (particleRatio, opts) => {
    confetti({
      ...opts,
      origin: { y: 0.6 },
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#6366f1", "#a855f7"] });
  fire(0.2, { spread: 60, colors: ["#ec4899", "#f59e0b"] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#22c55e", "#3b82f6"] });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });

  if (pct >= 90) {
    // Extra celebration for champions!
    setTimeout(() => {
      confetti({ angle: 60, spread: 55, particleCount: 60, origin: { x: 0 } });
      confetti({ angle: 120, spread: 55, particleCount: 60, origin: { x: 1 } });
    }, 500);
  }
}

// ── Restart ────────────────────────────────────
function restart() {
  state.totalCorrect = 0;
  state.totalWrong = 0;
  elFinalScreen.className = "";
  elGameArea.style.display = "";
  startStage("mult");
}

// ── Event listeners ────────────────────────────
elBtnVerify.addEventListener("click", verify);
elBtnNext.addEventListener("click", next);
$("btn-restart").addEventListener("click", restart);

elAnswerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (!state.verified) verify();
    else next();
  }
});

// ── Init ───────────────────────────────────────
async function init() {
  const poke = await fetchRandomPokemon();
  setPokemon(poke);

  // Hide preloader
  const preloader = $("preloader");
  preloader.classList.add("fade-out");
  setTimeout(() => preloader.remove(), 700);

  startStage("mult");
}

init();

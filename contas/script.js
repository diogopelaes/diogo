// ══════════════════════════════════════════════════
//  Contas — Unified Multi-Page Game Script
// ══════════════════════════════════════════════════

// ── Shared: Helper Functions ───────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function addEvent(target, event, handler, options) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (el) {
    el.addEventListener(event, handler, options);
  }
}

// ── Shared: Web Audio Synth Sounds ─────────────
let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
  initAudio();
  if (!audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.32);
  } else if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.09);
  } else if (type === 'victory') {
    osc.type = 'triangle';
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
    });
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    osc.start(now);
    osc.stop(now + 0.6);
  }
}

// ── Shared: Pokémon API ────────────────────────
const POKEMON_COUNT = 151;

async function fetchRandomPokemon(excludeIds = []) {
  let id;
  let attempts = 0;
  do {
    id = rand(1, POKEMON_COUNT);
    attempts++;
  } while (excludeIds.includes(id) && attempts < 100);

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

async function prepareQuestionPokemon(q, questions) {
  if (!q.pokemon) {
    const usedIds = questions.map(item => item && item.pokemon ? item.pokemon.id : null).filter(Boolean);
    q.pokemon = await fetchRandomPokemon(usedIds);
  }
  return q.pokemon;
}

function preloadAllQuestionsPokemon(questions) {
  questions.forEach(async (q) => {
    if (!q.pokemon) {
      const usedIds = questions.map(item => item && item.pokemon ? item.pokemon.id : null).filter(Boolean);
      q.pokemon = await fetchRandomPokemon(usedIds);
    }
  });
}

// ── Shared: Animation Trigger Helper ───────────
function triggerAnim(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// ── Shared: Confetti helpers ───────────────────
function launchSingleConfetti() {
  if (typeof confetti === "undefined") return;
  confetti({
    particleCount: 55,
    spread: 60,
    origin: { y: 0.65 }
  });
}

function launchConfetti(pct, colors) {
  if (typeof confetti === "undefined") return;
  const count = Math.round(50 + pct * 2);
  const c1 = colors || ["#6366f1", "#a855f7"];
  const c2 = ["#ec4899", "#f59e0b"];
  const c3 = ["#22c55e", "#3b82f6"];

  const fire = (particleRatio, opts) => {
    confetti({
      ...opts,
      origin: { y: 0.6 },
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55, colors: c1 });
  fire(0.2, { spread: 60, colors: c2 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: c3 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });

  if (pct >= 90) {
    setTimeout(() => {
      confetti({ angle: 60, spread: 55, particleCount: 60, origin: { x: 0 } });
      confetti({ angle: 120, spread: 55, particleCount: 60, origin: { x: 1 } });
    }, 500);
  }
}

// ── Shared: Audio unlock ───────────────────────
addEvent(document, "click", initAudio, { once: true });
addEvent(document, "keydown", initAudio, { once: true });

// ── Page Detection Helper ──────────────────────
function detectPage() {
  const pageAttr = document.body ? document.body.dataset.page : null;
  if (pageAttr) return pageAttr;

  if (document.getElementById("card-mult")) return "hub";
  if (document.getElementById("answer-buttons")) return "comparafracao";
  if (document.getElementById("answer-input")) return "multiplicacao";

  const path = window.location.pathname;
  if (path.includes("comparafracao")) return "comparafracao";
  if (path.includes("divisao")) return "divisao";
  if (path.includes("multiplicacao")) return "multiplicacao";
  return "hub";
}

// ── Main Controller ────────────────────────────
function main() {
  const PAGE = detectPage();

  // ══════════════════════════════════════════════════
  //  HUB PAGE
  // ══════════════════════════════════════════════════
  if (PAGE === "hub") {
    (async function initHub() {
      const heroImg = document.getElementById("hero-pokemon");
      if (!heroImg) return;
      const poke = await fetchRandomPokemon();
      heroImg.src = poke.sprite;
    })();
    return;
  }

  // ══════════════════════════════════════════════════
  //  MULTIPLICAÇÃO PAGE
  // ══════════════════════════════════════════════════
  if (PAGE === "multiplicacao") {
    (function initMultiplicacao() {

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

      function formatBR(num) {
        if (num === undefined || num === null) return "";
        return num.toString().replace(".", ",");
      }

      function roundAnswer(n) {
        return Math.round(n * 100) / 100;
      }

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
            const a = rand(100, 999), b = rand(10, 99);
            return { a, b, op: "×", answer: a * b, display: `${a} × ${b}` };
          },
          genDiv() {
            const b = rand(10, 99), answer = rand(100, 999);
            const a = b * answer;
            return { a, b, op: "÷", answer, display: `${a} ÷ ${b}` };
          },
        },
      ];

      function generateQuestions(stage) {
        const questions = [];
        for (let lvl = 0; lvl < DIFFICULTY_LEVELS.length; lvl++) {
          for (let j = 0; j < 2; j++) {
            const d = DIFFICULTY_LEVELS[lvl];
            const q = stage === "mult" ? d.genMult() : d.genDiv();
            q.level = d.label;
            questions.push(q);
          }
        }
        for (let i = questions.length - 1; i > 0; i--) {
          const j = rand(0, i);
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
      }

      let state = {
        stage: "mult",
        questions: [],
        current: 0,
        correctCount: 0,
        answeredFlags: [],
        verified: false,
        pokemon: null,
        totalCorrect: 0,
        totalWrong: 0,
      };

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
      const elSpeechBubble = $("pokemon-speech-bubble");
      const elCard = $("question-card");
      const elFinalScreen = $("final-screen");
      const elGameArea = $("game-area");
      const elFinalPoke = $("final-pokemon-img");
      const elFinalTitle = $("final-title");
      const elFinalMsg = $("final-message");
      const elFinalCorrect = $("final-correct");
      const elFinalWrong = $("final-wrong");
      const elFinalPct = $("final-pct");

      function setPokemon(poke) {
        state.pokemon = poke;
        if (elPokeImg) elPokeImg.src = poke.sprite;
        if (elPokeName) elPokeName.textContent = poke.name;
        if (elFinalPoke) elFinalPoke.src = poke.sprite;
      }

      function pokeBounce() {
        if (!elPokeImg) return;
        elPokeImg.classList.remove("bounce");
        void elPokeImg.offsetWidth;
        elPokeImg.classList.add("bounce");
        setTimeout(() => elPokeImg.classList.remove("bounce"), 700);
      }

      function setPokeMessage(msg) {
        if (elPokeMsg) elPokeMsg.textContent = msg;
      }

      function updateHpBar() {
        if (!elPokeHp) return;
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

      addEvent("pokemon-section", "click", async () => {
        playSound('click');
        const usedIds = state.questions.map(q => q && q.pokemon ? q.pokemon.id : null).filter(Boolean);
        const poke = await fetchRandomPokemon(usedIds);
        const currentQ = state.questions[state.current];
        currentQ.pokemon = poke;
        setPokemon(poke);
        pokeBounce();

        if (!state.verified) {
          const levelIndex = DIFFICULTY_LEVELS.findIndex(d => d.label === currentQ.level);
          const d = DIFFICULTY_LEVELS[levelIndex >= 0 ? levelIndex : 0];
          const newQ = d.genMult();
          newQ.level = d.label;
          newQ.pokemon = poke;
          state.questions[state.current] = newQ;

          const greeting = `Olá! Sou ${poke.name}! Preparei uma nova conta para você! ⚡`;
          showQuestion(greeting);
        } else {
          setPokeMessage(`Olá! Sou ${poke.name}! Vamos para a próxima! 🚀`);
        }
      });

      function buildDots() {
        if (!elDotsRow) return;
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

      async function showQuestion(customMsg) {
        const q = state.questions[state.current];
        const total = state.questions.length;

        await prepareQuestionPokemon(q, state.questions);
        setPokemon(q.pokemon);
        preloadAllQuestionsPokemon(state.questions);

        if (elQNumber) elQNumber.textContent = `Questão ${state.current + 1} de ${total}`;
        if (elDiffBadge) elDiffBadge.textContent = q.level;
        if (elQText) {
          elQText.innerHTML = q.display.replace(/[×÷]/g, s =>
            `<span class="operation-symbol">${s}</span>`
          ) + ' <span class="operation-symbol">=</span> ?';
          triggerAnim(elQText, "slide-in-anim");
        }

        if (elAnswerInput) {
          elAnswerInput.disabled = false;
          elAnswerInput.value = "";
          setTimeout(() => elAnswerInput.focus(), 10);
        }

        if (elSpeechBubble) {
          elSpeechBubble.className = "pokemon-speech-bubble";
          triggerAnim(elSpeechBubble, "slide-in-anim");
        }

        if (elBtnVerify) {
          elBtnVerify.style.display = "block";
          elBtnVerify.disabled = false;
        }
        if (elBtnNext) elBtnNext.style.display = "none";
        if (elCard) elCard.className = "question-card";
        state.verified = false;

        updateProgress();
        updateDots();
        updateHpBar();

        if (customMsg) {
          setPokeMessage(customMsg);
        } else if (state.current === 0) {
          setPokeMessage(pick(MESSAGES.intro_mult));
        } else {
          setPokeMessage("Vamos responder essa! Você consegue! 💪");
        }
      }

      function updateProgress() {
        const pct = Math.round((state.current / 10) * 100);
        if (elProgressFill) elProgressFill.style.width = pct + "%";
        if (elProgressText) elProgressText.textContent = `${state.current}/10`;
        if (elScoreCorrect) elScoreCorrect.textContent = state.correctCount;
        if (elScoreWrong) elScoreWrong.textContent = state.current - state.correctCount;
      }

      function verify() {
        if (state.verified || !elAnswerInput) return;
        const raw = elAnswerInput.value.trim().replace(",", ".");
        const given = parseFloat(raw);
        if (isNaN(given)) {
          elAnswerInput.focus();
          elAnswerInput.style.borderColor = "var(--warning)";
          setTimeout(() => (elAnswerInput.style.borderColor = ""), 800);
          playSound('wrong');
          return;
        }

        const q = state.questions[state.current];
        const correct = Math.abs(roundAnswer(given) - roundAnswer(q.answer)) < 0.011;
        state.verified = true;
        if (elBtnVerify) elBtnVerify.style.display = "none";
        elAnswerInput.disabled = true;

        if (correct) {
          state.correctCount++;
          state.totalCorrect++;
          state.answeredFlags[state.current] = true;
          if (elCard) elCard.classList.add("correct");
          if (elSpeechBubble) {
            elSpeechBubble.classList.add("bubble-correct");
            triggerAnim(elSpeechBubble, "slide-in-anim");
          }
          pokeBounce();
          setPokeMessage(pick(MESSAGES.correct));
          playSound('success');
          launchSingleConfetti();
          if (elScoreCorrect) triggerAnim(elScoreCorrect, "pulse-anim");
          // [POKEDEX] Captura Pokémon ao acertar (passa o Pokémon da questão)
          if (window.Pokedex) Pokedex.catchPokemon(q.pokemon);
        } else {
          state.totalWrong++;
          state.answeredFlags[state.current] = false;
          if (elCard) elCard.classList.add("wrong");
          if (elSpeechBubble) {
            elSpeechBubble.classList.add("bubble-wrong");
            triggerAnim(elSpeechBubble, "slide-in-anim");
          }
          const wrongMsg = `${pick(MESSAGES.wrong)} (Era: ${formatBR(q.answer)})`;
          setPokeMessage(wrongMsg);
          playSound('wrong');
          if (elScoreWrong) triggerAnim(elScoreWrong, "pulse-anim");
        }

        updateDots();
        updateHpBar();
        updateProgress();

        if (elBtnNext) {
          elBtnNext.style.display = "block";
          elBtnNext.textContent =
            state.current < 9 ? "Próxima →" : "🏆 Ver Resultado!";
        }
      }

      function next() {
        playSound('click');
        state.current++;

        if (state.current >= 10) {
          showFinal();
          return;
        }
        showQuestion();
      }

      function startStage(stage = "mult") {
        state.stage = "mult";
        state.current = 0;
        state.correctCount = 0;
        state.answeredFlags = [];
        state.questions = generateQuestions("mult");

        buildDots();
        showQuestion();
      }

      function showFinal() {
        if (elGameArea) elGameArea.style.display = "none";
        if (elFinalScreen) elFinalScreen.className = "show";
        playSound('victory');

        const total = 10;
        const correct = state.totalCorrect;
        const wrong = state.totalWrong;
        const pct = Math.round((correct / total) * 100);

        if (elFinalCorrect) elFinalCorrect.textContent = correct;
        if (elFinalWrong) elFinalWrong.textContent = wrong;
        if (elFinalPct) elFinalPct.textContent = pct + "%";

        if (pct >= 90) {
          if (elFinalTitle) elFinalTitle.textContent = "🏆 Campeão Pokémon!";
          if (elFinalMsg) elFinalMsg.textContent = `${state.pokemon?.name || "Pikachu"} ficou MUITO orgulhoso de você! Incrível!`;
        } else if (pct >= 70) {
          if (elFinalTitle) elFinalTitle.textContent = "⭐ Muito Bem!";
          if (elFinalMsg) elFinalMsg.textContent = `Excelente desempenho! Continue praticando e você chegará ao topo!`;
        } else if (pct >= 50) {
          if (elFinalTitle) elFinalTitle.textContent = "💪 Bom Esforço!";
          if (elFinalMsg) elFinalMsg.textContent = `Você está no caminho certo! Pratique mais e vai melhorar!`;
        } else {
          if (elFinalTitle) elFinalTitle.textContent = "📚 Continue Praticando!";
          if (elFinalMsg) elFinalMsg.textContent = `Cada erro é uma lição. Tente novamente e você vai melhorar!`;
        }

        launchConfetti(pct, ["#6366f1", "#a855f7"]);
        pokeBounce();
      }

      function restart() {
        playSound('click');
        state.totalCorrect = 0;
        state.totalWrong = 0;
        if (elFinalScreen) elFinalScreen.className = "";
        if (elGameArea) elGameArea.style.display = "";
        // [POKEDEX] Zera Pokédex ao reiniciar
        if (window.Pokedex) Pokedex.reset();
        startStage("mult");
      }

      addEvent("btn-verify", "click", () => {
        playSound('click');
        verify();
      });
      addEvent("btn-next", "click", next);
      addEvent("btn-restart", "click", restart);

      addEvent("answer-input", "keydown", e => {
        if (e.key === "Enter") {
          if (!state.verified) {
            playSound('click');
            verify();
          }
        }
      });

      addEvent(document, "keydown", e => {
        if (e.key === "Enter" && state.verified) {
          if (elFinalScreen && elFinalScreen.classList.contains("show")) {
            restart();
          } else {
            next();
          }
          return;
        }

        if (!state.verified && elAnswerInput && document.activeElement !== elAnswerInput) {
          if (/^[0-9.,-]$/.test(e.key)) {
            e.preventDefault();
            elAnswerInput.focus();
            elAnswerInput.value += e.key;
          }
        }
      });

      async function init() {
        const poke = await fetchRandomPokemon();
        setPokemon(poke);

        const preloader = $("preloader");
        if (preloader) {
          preloader.classList.add("fade-out");
          setTimeout(() => preloader.remove(), 700);
        }

        startStage("mult");
      }

      init();

    })();
    return;
  }

  // ══════════════════════════════════════════════════
  //  DIVISÃO PAGE
  // ══════════════════════════════════════════════════
  if (PAGE === "divisao") {
    (function initDivisao() {

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
        intro: [
          "Ei! Vamos treinar divisão juntos? ➗",
          "Hora de dividir! Você consegue!",
          "Boa sorte! Confio em você! ⭐",
        ],
      };

      // Gera divisão exata: escolhe quociente e divisor, calcula dividendo
      // Garante resto zero por construção: dividendo = divisor × quociente
      const DIFFICULTY_LEVELS = [
        {
          label: "⭐ Fácil",
          gen() {
            const b = rand(2, 9), answer = rand(2, 9);
            return { a: b * answer, b, op: "÷", answer, display: `${b * answer} ÷ ${b}` };
          },
        },
        {
          label: "⭐⭐ Médio",
          gen() {
            const b = rand(2, 9), answer = rand(10, 25);
            return { a: b * answer, b, op: "÷", answer, display: `${b * answer} ÷ ${b}` };
          },
        },
        {
          label: "⭐⭐⭐ Difícil",
          gen() {
            const b = rand(10, 25), answer = rand(10, 25);
            return { a: b * answer, b, op: "÷", answer, display: `${b * answer} ÷ ${b}` };
          },
        },
        {
          label: "⭐⭐⭐⭐ Expert",
          gen() {
            const b = rand(10, 25), answer = rand(50, 99);
            return { a: b * answer, b, op: "÷", answer, display: `${b * answer} ÷ ${b}` };
          },
        },
        {
          label: "⭐⭐⭐⭐⭐ Mestre",
          gen() {
            const b = rand(10, 99), answer = rand(100, 999);
            return { a: b * answer, b, op: "÷", answer, display: `${b * answer} ÷ ${b}` };
          },
        },
      ];

      function generateQuestions() {
        const questions = [];
        for (let lvl = 0; lvl < DIFFICULTY_LEVELS.length; lvl++) {
          for (let j = 0; j < 2; j++) {
            const d = DIFFICULTY_LEVELS[lvl];
            const q = d.gen();
            q.level = d.label;
            questions.push(q);
          }
        }
        for (let i = questions.length - 1; i > 0; i--) {
          const j = rand(0, i);
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
      }

      let state = {
        questions: [],
        current: 0,
        correctCount: 0,
        answeredFlags: [],
        verified: false,
        pokemon: null,
        totalCorrect: 0,
        totalWrong: 0,
      };

      const $ = id => document.getElementById(id);
      const elPokeImg    = $("pokemon-img");
      const elPokeName   = $("pokemon-name");
      const elPokeMsg    = $("pokemon-message");
      const elPokeHp     = $("pokemon-hp-fill");
      const elProgressFill = $("progress-fill");
      const elProgressText = $("progress-text");
      const elScoreCorrect = $("score-correct");
      const elScoreWrong   = $("score-wrong");
      const elDotsRow    = $("dots-row");
      const elQNumber    = $("question-number");
      const elDiffBadge  = $("difficulty-badge");
      const elQText      = $("question-text");
      const elAnswerInput = $("answer-input");
      const elBtnVerify  = $("btn-verify");
      const elBtnNext    = $("btn-next");
      const elSpeechBubble = $("pokemon-speech-bubble");
      const elCard       = $("question-card");
      const elFinalScreen = $("final-screen");
      const elGameArea   = $("game-area");
      const elFinalPoke  = $("final-pokemon-img");
      const elFinalTitle = $("final-title");
      const elFinalMsg   = $("final-message");
      const elFinalCorrect = $("final-correct");
      const elFinalWrong   = $("final-wrong");
      const elFinalPct     = $("final-pct");

      function setPokemon(poke) {
        state.pokemon = poke;
        if (elPokeImg) elPokeImg.src = poke.sprite;
        if (elPokeName) elPokeName.textContent = poke.name;
        if (elFinalPoke) elFinalPoke.src = poke.sprite;
      }

      function pokeBounce() {
        if (!elPokeImg) return;
        elPokeImg.classList.remove("bounce");
        void elPokeImg.offsetWidth;
        elPokeImg.classList.add("bounce");
        setTimeout(() => elPokeImg.classList.remove("bounce"), 700);
      }

      function setPokeMessage(msg) {
        if (elPokeMsg) elPokeMsg.textContent = msg;
      }

      function updateHpBar() {
        if (!elPokeHp) return;
        const answered = state.current;
        const correct = state.correctCount;
        const pct = answered > 0 ? Math.round((correct / answered) * 100) : 100;
        elPokeHp.style.width = pct + "%";
        if (pct >= 70) {
          elPokeHp.style.background = "linear-gradient(90deg, #22c55e, #86efac)";
        } else if (pct >= 40) {
          elPokeHp.style.background = "linear-gradient(90deg, #f59e0b, #fcd34d)";
        } else {
          elPokeHp.style.background = "linear-gradient(90deg, #ef4444, #fca5a5)";
        }
      }

      addEvent("pokemon-section", "click", async () => {
        playSound('click');
        const usedIds = state.questions.map(q => q && q.pokemon ? q.pokemon.id : null).filter(Boolean);
        const poke = await fetchRandomPokemon(usedIds);
        const currentQ = state.questions[state.current];
        currentQ.pokemon = poke;
        setPokemon(poke);
        pokeBounce();

        if (!state.verified) {
          const levelIndex = DIFFICULTY_LEVELS.findIndex(d => d.label === currentQ.level);
          const d = DIFFICULTY_LEVELS[levelIndex >= 0 ? levelIndex : 0];
          const newQ = d.gen();
          newQ.level = d.label;
          newQ.pokemon = poke;
          state.questions[state.current] = newQ;

          const greeting = `Olá! Sou ${poke.name}! Preparei uma nova conta para você! ⚡`;
          showQuestion(greeting);
        } else {
          setPokeMessage(`Olá! Sou ${poke.name}! Vamos para a próxima! 🚀`);
        }
      });

      function buildDots() {
        if (!elDotsRow) return;
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

      async function showQuestion(customMsg) {
        const q = state.questions[state.current];
        const total = state.questions.length;

        await prepareQuestionPokemon(q, state.questions);
        setPokemon(q.pokemon);
        preloadAllQuestionsPokemon(state.questions);

        if (elQNumber) elQNumber.textContent = `Questão ${state.current + 1} de ${total}`;
        if (elDiffBadge) elDiffBadge.textContent = q.level;
        if (elQText) {
          elQText.innerHTML = q.display.replace(/[×÷]/g, s =>
            `<span class="operation-symbol">${s}</span>`
          ) + ' <span class="operation-symbol">=</span> ?';
          triggerAnim(elQText, "slide-in-anim");
        }

        if (elAnswerInput) {
          elAnswerInput.disabled = false;
          elAnswerInput.value = "";
          setTimeout(() => elAnswerInput.focus(), 10);
        }

        if (elSpeechBubble) {
          elSpeechBubble.className = "pokemon-speech-bubble";
          triggerAnim(elSpeechBubble, "slide-in-anim");
        }

        if (elBtnVerify) {
          elBtnVerify.style.display = "block";
          elBtnVerify.disabled = false;
        }
        if (elBtnNext) elBtnNext.style.display = "none";
        if (elCard) elCard.className = "question-card";
        state.verified = false;

        updateProgress();
        updateDots();
        updateHpBar();

        if (customMsg) {
          setPokeMessage(customMsg);
        } else if (state.current === 0) {
          setPokeMessage(pick(MESSAGES.intro));
        } else {
          setPokeMessage("Vamos responder essa! Você consegue! 💪");
        }
      }

      function updateProgress() {
        const pct = Math.round((state.current / 10) * 100);
        if (elProgressFill) elProgressFill.style.width = pct + "%";
        if (elProgressText) elProgressText.textContent = `${state.current}/10`;
        if (elScoreCorrect) elScoreCorrect.textContent = state.correctCount;
        if (elScoreWrong) elScoreWrong.textContent = state.current - state.correctCount;
      }

      function verify() {
        if (state.verified || !elAnswerInput) return;
        const raw = elAnswerInput.value.trim().replace(",", ".");
        const given = parseInt(raw, 10);
        if (isNaN(given)) {
          elAnswerInput.focus();
          elAnswerInput.style.borderColor = "var(--warning)";
          setTimeout(() => (elAnswerInput.style.borderColor = ""), 800);
          playSound('wrong');
          return;
        }

        const q = state.questions[state.current];
        const correct = given === q.answer;
        state.verified = true;
        if (elBtnVerify) elBtnVerify.style.display = "none";
        elAnswerInput.disabled = true;

        if (correct) {
          state.correctCount++;
          state.totalCorrect++;
          state.answeredFlags[state.current] = true;
          if (elCard) elCard.classList.add("correct");
          if (elSpeechBubble) {
            elSpeechBubble.classList.add("bubble-correct");
            triggerAnim(elSpeechBubble, "slide-in-anim");
          }
          pokeBounce();
          setPokeMessage(pick(MESSAGES.correct));
          playSound('success');
          launchSingleConfetti();
          if (elScoreCorrect) triggerAnim(elScoreCorrect, "pulse-anim");
          // [POKEDEX] Captura Pokémon ao acertar (passa o Pokémon da questão)
          if (window.Pokedex) Pokedex.catchPokemon(q.pokemon);
        } else {
          state.totalWrong++;
          state.answeredFlags[state.current] = false;
          if (elCard) elCard.classList.add("wrong");
          if (elSpeechBubble) {
            elSpeechBubble.classList.add("bubble-wrong");
            triggerAnim(elSpeechBubble, "slide-in-anim");
          }
          setPokeMessage(`${pick(MESSAGES.wrong)} (Era: ${q.answer})`);
          playSound('wrong');
          if (elScoreWrong) triggerAnim(elScoreWrong, "pulse-anim");
        }

        updateDots();
        updateHpBar();
        updateProgress();

        if (elBtnNext) {
          elBtnNext.style.display = "block";
          elBtnNext.textContent =
            state.current < 9 ? "Próxima →" : "🏆 Ver Resultado!";
        }
      }

      function next() {
        playSound('click');
        state.current++;
        if (state.current >= 10) {
          showFinal();
          return;
        }
        showQuestion();
      }

      function showFinal() {
        if (elGameArea) elGameArea.style.display = "none";
        if (elFinalScreen) elFinalScreen.className = "show";
        playSound('victory');

        const total = 10;
        const correct = state.totalCorrect;
        const wrong = state.totalWrong;
        const pct = Math.round((correct / total) * 100);

        if (elFinalCorrect) elFinalCorrect.textContent = correct;
        if (elFinalWrong) elFinalWrong.textContent = wrong;
        if (elFinalPct) elFinalPct.textContent = pct + "%";

        if (pct >= 90) {
          if (elFinalTitle) elFinalTitle.textContent = "🏆 Campeão Pokémon!";
          if (elFinalMsg) elFinalMsg.textContent = `${state.pokemon?.name || "Pikachu"} ficou MUITO orgulhoso de você! Incrível!`;
        } else if (pct >= 70) {
          if (elFinalTitle) elFinalTitle.textContent = "⭐ Muito Bem!";
          if (elFinalMsg) elFinalMsg.textContent = `Excelente desempenho! Continue praticando e você chegará ao topo!`;
        } else if (pct >= 50) {
          if (elFinalTitle) elFinalTitle.textContent = "💪 Bom Esforço!";
          if (elFinalMsg) elFinalMsg.textContent = `Você está no caminho certo! Pratique mais e vai melhorar!`;
        } else {
          if (elFinalTitle) elFinalTitle.textContent = "📚 Continue Praticando!";
          if (elFinalMsg) elFinalMsg.textContent = `Cada erro é uma lição. Tente novamente e você vai melhorar!`;
        }

        launchConfetti(pct, ["#06b6d4", "#22c55e"]);
        pokeBounce();
      }

      function restart() {
        playSound('click');
        state.totalCorrect = 0;
        state.totalWrong = 0;
        state.current = 0;
        state.correctCount = 0;
        state.answeredFlags = [];
        if (elFinalScreen) elFinalScreen.className = "";
        if (elGameArea) elGameArea.style.display = "";
        // [POKEDEX] Zera Pokédex ao reiniciar
        if (window.Pokedex) Pokedex.reset();
        state.questions = generateQuestions();
        buildDots();
        showQuestion();
      }

      addEvent("btn-verify", "click", () => {
        playSound('click');
        verify();
      });
      addEvent("btn-next", "click", next);
      addEvent("btn-restart", "click", restart);

      addEvent("answer-input", "keydown", e => {
        if (e.key === "Enter") {
          if (!state.verified) {
            playSound('click');
            verify();
          }
        }
      });

      addEvent(document, "keydown", e => {
        if (e.key === "Enter" && state.verified) {
          if (elFinalScreen && elFinalScreen.classList.contains("show")) {
            restart();
          } else {
            next();
          }
          return;
        }
        if (!state.verified && elAnswerInput && document.activeElement !== elAnswerInput) {
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            elAnswerInput.focus();
            elAnswerInput.value += e.key;
          }
        }
      });

      async function init() {
        const poke = await fetchRandomPokemon();
        setPokemon(poke);

        const preloader = $("preloader");
        if (preloader) {
          preloader.classList.add("fade-out");
          setTimeout(() => preloader.remove(), 700);
        }

        state.questions = generateQuestions();
        buildDots();
        showQuestion();
      }

      init();

    })();
    return;
  }

  // ══════════════════════════════════════════════════
  //  COMPARAR FRAÇÕES PAGE
  // ══════════════════════════════════════════════════
  if (PAGE === "comparafracao") {
    (function initComparaFracao() {

      const MESSAGES = {
        correct: [
          "Incrível! Você manda nas frações! 🔥",
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
        intro: [
          "Ei! Vamos comparar frações juntos? ⚖️",
          "Hora de descobrir qual fração é maior! 💡",
          "Boa sorte! Confio em você! ⭐",
          "Bora comparar frações! Você consegue! 🎯",
        ],
      };

      const DIFFICULTY_LEVELS = [
        {
          label: "⭐ Fácil",
          gen() {
            const den = rand(2, 8);
            let numA = rand(1, den - 1);
            let numB = rand(1, den - 1);
            if (Math.random() > 0.2 && numA === numB) {
              numB = numA === 1 ? numA + 1 : numA - 1;
            }
            const valA = numA / den, valB = numB / den;
            const answer = valA < valB ? "<" : valA > valB ? ">" : "=";
            return { numA, denA: den, numB, denB: den, answer, level: this.label };
          },
        },
        {
          label: "⭐⭐ Médio",
          gen() {
            const denA = rand(2, 6);
            const denB = rand(2, 6);
            const numA = rand(1, Math.max(denA - 1, 1));
            const numB = rand(1, Math.max(denB - 1, 1));
            const valA = numA / denA, valB = numB / denB;
            const answer = Math.abs(valA - valB) < 0.0001 ? "=" : valA < valB ? "<" : ">";
            return { numA, denA, numB, denB, answer, level: this.label };
          },
        },
        {
          label: "⭐⭐⭐ Difícil",
          gen() {
            if (Math.random() < 0.25) {
              const num = rand(1, 5);
              const den = rand(2, 8);
              const mult = rand(2, 4);
              return {
                numA: num, denA: den,
                numB: num * mult, denB: den * mult,
                answer: "=", level: this.label,
              };
            }
            const denA = rand(3, 12);
            const denB = rand(3, 12);
            const numA = rand(1, denA - 1);
            const numB = rand(1, denB - 1);
            const valA = numA / denA, valB = numB / denB;
            const answer = Math.abs(valA - valB) < 0.0001 ? "=" : valA < valB ? "<" : ">";
            return { numA, denA, numB, denB, answer, level: this.label };
          },
        },
        {
          label: "⭐⭐⭐⭐ Expert",
          gen() {
            const denA = rand(3, 12);
            const denB = rand(3, 12);
            const numA = rand(1, denA + 3);
            const numB = rand(1, denB + 3);
            const valA = numA / denA, valB = numB / denB;
            const answer = Math.abs(valA - valB) < 0.0001 ? "=" : valA < valB ? "<" : ">";
            return { numA, denA, numB, denB, answer, level: this.label };
          },
        },
        {
          label: "⭐⭐⭐⭐⭐ Mestre",
          gen() {
            if (Math.random() < 0.3) {
              const num = rand(1, 7);
              const den = rand(num + 1, 10);
              const multA = rand(2, 5);
              const multB = rand(2, 5);
              return {
                numA: num * multA, denA: den * multA,
                numB: num * multB, denB: den * multB,
                answer: "=", level: this.label,
              };
            }
            const denA = rand(5, 15);
            const denB = rand(5, 15);
            const numA = rand(1, denA + 5);
            const numB = rand(1, denB + 5);
            const valA = numA / denA, valB = numB / denB;
            const answer = Math.abs(valA - valB) < 0.0001 ? "=" : valA < valB ? "<" : ">";
            return { numA, denA, numB, denB, answer, level: this.label };
          },
        },
      ];

      function generateQuestions() {
        const questions = [];
        for (let lvl = 0; lvl < DIFFICULTY_LEVELS.length; lvl++) {
          for (let j = 0; j < 2; j++) {
            questions.push(DIFFICULTY_LEVELS[lvl].gen());
          }
        }
        for (let i = questions.length - 1; i > 0; i--) {
          const j = rand(0, i);
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
      }

      let state = {
        questions: [],
        current: 0,
        correctCount: 0,
        wrongCount: 0,
        answeredFlags: [],
        answered: false,
        pokemon: null,
      };

      const $ = id => document.getElementById(id);
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
      const elSpeechBubble = $("pokemon-speech-bubble");
      const elCard = $("question-card");
      const elFinalScreen = $("final-screen");
      const elGameArea = $("game-area");
      const elFinalPoke = $("final-pokemon-img");
      const elFinalTitle = $("final-title");
      const elFinalMsg = $("final-message");
      const elFinalCorrect = $("final-correct");
      const elFinalWrong = $("final-wrong");
      const elFinalPct = $("final-pct");
      const elBtnNext = $("btn-next");
      const elFracANum = $("frac-a-num");
      const elFracADen = $("frac-a-den");
      const elFracBNum = $("frac-b-num");
      const elFracBDen = $("frac-b-den");
      const elVisualRow = $("fraction-visual-row");
      const elBarFillA = $("bar-fill-a");
      const elBarFillB = $("bar-fill-b");
      const elBarLabelA = $("bar-label-a");
      const elBarLabelB = $("bar-label-b");
      const answerBtns = document.querySelectorAll(".btn-answer");

      function setPokemon(poke) {
        state.pokemon = poke;
        if (elPokeImg) elPokeImg.src = poke.sprite;
        if (elPokeName) elPokeName.textContent = poke.name;
        if (elFinalPoke) elFinalPoke.src = poke.sprite;
      }

      function pokeBounce() {
        if (!elPokeImg) return;
        elPokeImg.classList.remove("bounce");
        void elPokeImg.offsetWidth;
        elPokeImg.classList.add("bounce");
        setTimeout(() => elPokeImg.classList.remove("bounce"), 700);
      }

      function setPokeMessage(msg) {
        if (elPokeMsg) elPokeMsg.textContent = msg;
      }

      function updateHpBar() {
        if (!elPokeHp) return;
        const answered = state.current + (state.answered ? 1 : 0);
        const pct = answered > 0 ? Math.round((state.correctCount / answered) * 100) : 100;
        elPokeHp.style.width = pct + "%";
        if (pct >= 70) {
          elPokeHp.style.background = "linear-gradient(90deg, #22c55e, #86efac)";
        } else if (pct >= 40) {
          elPokeHp.style.background = "linear-gradient(90deg, #f59e0b, #fcd34d)";
        } else {
          elPokeHp.style.background = "linear-gradient(90deg, #ef4444, #fca5a5)";
        }
      }

      addEvent("pokemon-section", "click", async () => {
        playSound('click');
        const usedIds = state.questions.map(q => q && q.pokemon ? q.pokemon.id : null).filter(Boolean);
        const poke = await fetchRandomPokemon(usedIds);
        const currentQ = state.questions[state.current];
        currentQ.pokemon = poke;
        setPokemon(poke);
        pokeBounce();

        if (!state.answered) {
          const levelIndex = DIFFICULTY_LEVELS.findIndex(d => d.label === currentQ.level);
          const d = DIFFICULTY_LEVELS[levelIndex >= 0 ? levelIndex : 0];
          const newQ = d.gen();
          newQ.pokemon = poke;
          state.questions[state.current] = newQ;

          const greeting = `Olá! Sou ${poke.name}! Preparei novas frações para você! ⚖️`;
          showQuestion(greeting);
        } else {
          setPokeMessage(`Olá! Sou ${poke.name}! Vamos para a próxima! 🚀`);
        }
      });

      function buildDots() {
        if (!elDotsRow) return;
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
          if (state.answeredFlags[i] === true) {
            dot.classList.add("answered-correct");
          } else if (state.answeredFlags[i] === false) {
            dot.classList.add("answered-wrong");
          } else if (i === state.current) {
            dot.classList.add("current");
          }
        }
      }

      async function showQuestion(customMsg) {
        const q = state.questions[state.current];
        const total = state.questions.length;

        await prepareQuestionPokemon(q, state.questions);
        setPokemon(q.pokemon);
        preloadAllQuestionsPokemon(state.questions);

        if (elQNumber) elQNumber.textContent = `Questão ${state.current + 1} de ${total}`;
        if (elDiffBadge) elDiffBadge.textContent = q.level;

        if (elFracANum) elFracANum.textContent = q.numA;
        if (elFracADen) elFracADen.textContent = q.denA;
        if (elFracBNum) elFracBNum.textContent = q.numB;
        if (elFracBDen) elFracBDen.textContent = q.denB;

        if (elVisualRow) elVisualRow.style.display = "none";

        triggerAnim($("question-text"), "slide-in-anim");

        answerBtns.forEach(btn => {
          btn.className = "btn-answer";
          btn.disabled = false;
        });

        if (elBtnNext) elBtnNext.style.display = "none";
        if (elCard) elCard.className = "question-card";
        state.answered = false;

        if (elSpeechBubble) {
          elSpeechBubble.className = "pokemon-speech-bubble";
          triggerAnim(elSpeechBubble, "slide-in-anim");
        }

        updateProgress();
        updateDots();
        updateHpBar();

        if (customMsg) {
          setPokeMessage(customMsg);
        } else if (state.current === 0) {
          setPokeMessage(pick(MESSAGES.intro));
        } else {
          setPokeMessage("Qual fração é maior? Vamos lá! ⚖️");
        }
      }

      function updateProgress() {
        const answered = state.correctCount + state.wrongCount;
        const pct = Math.round((answered / 10) * 100);
        if (elProgressFill) elProgressFill.style.width = pct + "%";
        if (elProgressText) elProgressText.textContent = `${answered}/10`;
        if (elScoreCorrect) elScoreCorrect.textContent = state.correctCount;
        if (elScoreWrong) elScoreWrong.textContent = state.wrongCount;
      }

      function handleAnswer(chosen) {
        if (state.answered) return;
        state.answered = true;
        playSound('click');

        const q = state.questions[state.current];
        const correct = chosen === q.answer;

        answerBtns.forEach(btn => {
          if (btn.dataset.answer === chosen && correct) {
            btn.classList.add("selected-correct");
          } else if (btn.dataset.answer === chosen && !correct) {
            btn.classList.add("selected-wrong");
          } else if (btn.dataset.answer === q.answer && !correct) {
            btn.classList.add("highlight-correct");
          } else {
            btn.classList.add("disabled");
          }
          btn.disabled = true;
        });

        if (correct) {
          state.correctCount++;
          state.answeredFlags[state.current] = true;
          if (elCard) elCard.classList.add("correct");
          if (elSpeechBubble) {
            elSpeechBubble.classList.add("bubble-correct");
            triggerAnim(elSpeechBubble, "slide-in-anim");
          }
          pokeBounce();
          setPokeMessage(pick(MESSAGES.correct));
          playSound('success');
          launchSingleConfetti();
          if (elScoreCorrect) triggerAnim(elScoreCorrect, "pulse-anim");
          // [POKEDEX] Captura Pokémon ao acertar (passa o Pokémon da questão)
          if (window.Pokedex) Pokedex.catchPokemon(q.pokemon);
        } else {
          state.wrongCount++;
          state.answeredFlags[state.current] = false;
          if (elCard) elCard.classList.add("wrong");
          if (elSpeechBubble) {
            elSpeechBubble.classList.add("bubble-wrong");
            triggerAnim(elSpeechBubble, "slide-in-anim");
          }
          const symbolMap = { "<": "menor (<)", "=": "igual (=)", ">": "maior (>)" };
          const wrongMsg = `${pick(MESSAGES.wrong)} (Era: ${symbolMap[q.answer]})`;
          setPokeMessage(wrongMsg);
          playSound('wrong');
          if (elScoreWrong) triggerAnim(elScoreWrong, "pulse-anim");
        }

        showVisualBars(q);
        updateDots();
        updateHpBar();
        updateProgress();

        if (elBtnNext) {
          elBtnNext.style.display = "block";
          elBtnNext.textContent = state.current < 9 ? "Próxima →" : "🏆 Ver Resultado!";
        }
      }

      function showVisualBars(q) {
        if (!elVisualRow) return;
        const valA = q.numA / q.denA;
        const valB = q.numB / q.denB;
        const maxVal = Math.max(valA, valB, 1);
        const pctA = Math.round((valA / maxVal) * 100);
        const pctB = Math.round((valB / maxVal) * 100);

        if (elBarFillA) elBarFillA.style.width = pctA + "%";
        if (elBarFillB) elBarFillB.style.width = pctB + "%";
        if (elBarLabelA) elBarLabelA.textContent = `${q.numA}/${q.denA} = ${valA.toFixed(2)}`;
        if (elBarLabelB) elBarLabelB.textContent = `${q.numB}/${q.denB} = ${valB.toFixed(2)}`;
        elVisualRow.style.display = "flex";
      }

      function next() {
        playSound('click');
        state.current++;

        if (state.current >= 10) {
          showFinal();
          return;
        }
        showQuestion();
      }

      function showFinal() {
        if (elGameArea) elGameArea.style.display = "none";
        if (elFinalScreen) elFinalScreen.className = "show";
        playSound('victory');

        const total = 10;
        const correct = state.correctCount;
        const wrong = state.wrongCount;
        const pct = Math.round((correct / total) * 100);

        if (elFinalCorrect) elFinalCorrect.textContent = correct;
        if (elFinalWrong) elFinalWrong.textContent = wrong;
        if (elFinalPct) elFinalPct.textContent = pct + "%";

        if (pct >= 90) {
          if (elFinalTitle) elFinalTitle.textContent = "🏆 Campeão das Frações!";
          if (elFinalMsg) elFinalMsg.textContent = `${state.pokemon?.name || "Pikachu"} ficou MUITO orgulhoso de você! Incrível!`;
        } else if (pct >= 70) {
          if (elFinalTitle) elFinalTitle.textContent = "⭐ Muito Bem!";
          if (elFinalMsg) elFinalMsg.textContent = `Excelente desempenho! Continue praticando frações!`;
        } else if (pct >= 50) {
          if (elFinalTitle) elFinalTitle.textContent = "💪 Bom Esforço!";
          if (elFinalMsg) elFinalMsg.textContent = `Você está no caminho certo! Pratique mais e vai melhorar!`;
        } else {
          if (elFinalTitle) elFinalTitle.textContent = "📚 Continue Praticando!";
          if (elFinalMsg) elFinalMsg.textContent = `Cada erro é uma lição. Tente novamente e você vai melhorar!`;
        }

        launchConfetti(pct, ["#ec4899", "#f97316"]);
        pokeBounce();
      }

      function restart() {
        playSound('click');
        state.correctCount = 0;
        state.wrongCount = 0;
        state.current = 0;
        state.answeredFlags = [];
        state.questions = generateQuestions();
        if (elFinalScreen) elFinalScreen.className = "";
        if (elGameArea) elGameArea.style.display = "";
        // [POKEDEX] Zera Pokédex ao reiniciar
        if (window.Pokedex) Pokedex.reset();
        buildDots();
        showQuestion();
      }

      answerBtns.forEach(btn => {
        if (btn) btn.addEventListener("click", () => handleAnswer(btn.dataset.answer));
      });

      addEvent("btn-next", "click", next);
      addEvent("btn-restart", "click", restart);

      addEvent(document, "keydown", e => {
        if (!state.answered) {
          if (e.key === "1" || e.key === ",") { handleAnswer("<"); return; }
          if (e.key === "2" || e.key === "=") { handleAnswer("="); return; }
          if (e.key === "3" || e.key === ".") { handleAnswer(">"); return; }
        }

        if (e.key === "Enter" && state.answered) {
          if (elFinalScreen && elFinalScreen.classList.contains("show")) {
            restart();
          } else {
            next();
          }
        }
      });

      async function init() {
        const poke = await fetchRandomPokemon();
        setPokemon(poke);

        const preloader = $("preloader");
        if (preloader) {
          preloader.classList.add("fade-out");
          setTimeout(() => preloader.remove(), 700);
        }

        state.questions = generateQuestions();
        buildDots();
        showQuestion();
      }

      init();

    })();
    return;
  }
}

// Ensure main runs after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

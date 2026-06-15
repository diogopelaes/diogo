/**
 * pokemon-arena.js - Motor de Animação de Arena Pokémon com Física de Arremesso e Sintetizador de Som
 */

const POKEMON_POOL = [
  { id: 25, name: "Pikachu" },
  { id: 6, name: "Charizard" },
  { id: 1, name: "Bulbasaur" },
  { id: 7, name: "Squirtle" },
  { id: 133, name: "Eevee" },
  { id: 150, name: "Mewtwo" },
  { id: 94, name: "Gengar" },
  { id: 143, name: "Snorlax" },
  { id: 448, name: "Lucario" },
  { id: 131, name: "Lapras" },
  { id: 149, name: "Dragonite" },
  { id: 282, name: "Gardevoir" }
];

const spriteUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// --- Sintetizador de Som Nativo (Web Audio API) ---
const SorteioSound = (() => {
  let audioCtx = null;
  let cyclingInterval = null;
  let cyclingTick = 0;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, duration, type = "sine", gain = 0.12, when = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
    g.gain.setValueAtTime(gain, ctx.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + duration + 0.05);
  }

  function noiseBurst(duration = 0.08, gain = 0.06) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
  }

  function playShake() {
    noiseBurst(0.05, 0.04);
  }

  function playThrow() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.07, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  }

  function playCapture() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "square", 0.07, i * 0.1));
    setTimeout(() => tone(1318, 0.35, "sine", 0.09, 0), 420);
  }

  function playCyclingTick(tickIndex) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const progress = Math.min(tickIndex / 18, 1);
    const baseFreq = 180 + progress * 320;
    const tickDuration = 0.04 + (1 - progress) * 0.04;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + tickDuration);
    g.gain.setValueAtTime(0.055 + progress * 0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tickDuration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + tickDuration + 0.02);
    noiseBurst(0.025 + progress * 0.015, 0.018 + progress * 0.012);
  }

  function startCyclingSound() {
    stopCyclingSound();
    cyclingTick = 0;
    function scheduleNext() {
      const progress = Math.min(cyclingTick / 18, 1);
      const interval = Math.round(145 - progress * 80);
      playCyclingTick(cyclingTick);
      cyclingTick++;
      cyclingInterval = setTimeout(scheduleNext, interval);
    }
    scheduleNext();
  }

  function stopCyclingSound() {
    if (cyclingInterval) {
      clearTimeout(cyclingInterval);
      cyclingInterval = null;
    }
    cyclingTick = 0;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.28);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    noiseBurst(0.12, 0.07);
  }

  return {
    ensureAudio,
    playShake,
    playThrow,
    playCapture,
    startCyclingSound,
    stopCyclingSound
  };
})();

// --- Motor da Arena Pokémon ---
class PokemonArena {
  constructor(config) {
    this.config = config;

    // Elementos DOM
    this.arenaResult = document.getElementById(config.arenaResultId);
    this.pokemonSlots = document.getElementById(config.slotsId);
    this.throwField = document.getElementById(config.throwFieldId);
    this.pokeballEl = document.getElementById(config.pokeballId);
    this.revealEl = document.getElementById(config.revealId);

    // Seleciona as subdivisões internas da arena
    this.shakeMeterFill = document.getElementById("shake-meter-fill");
    this.pokeballHint = document.getElementById("pokeball-hint");
    this.arenaTargets = document.getElementById("arena-targets");
    this.throwTarget = document.getElementById("throw-target");
    
    // Elementos do Capture Reveal
    this.capturePokemonImg = document.getElementById("capture-pokemon-img");
    this.capturePokemonName = document.getElementById("capture-pokemon-name");
    this.captureTrainerName = document.getElementById("capture-trainer-name");
    this.captureDatetime = document.getElementById("capture-datetime");
    this.btnDismissReveal = document.getElementById("btn-dismiss-reveal");

    this.slots = [...this.pokemonSlots.querySelectorAll(".slot")];

    // Constantes e Estados de Animação
    this.SHAKE_REQUIRED = 100;
    this.SHAKE_DECAY_MS = 1200;
    this.CYCLE_INTERVAL_MS = 90;
    this.BALL_SIZE = 92;
    this.THROW_MIN_UP = 50;
    this.THROW_MIN_SPEED = 0.65;

    this.isBusy = false;
    this.shakeEnergy = 0;
    this.shakeDecayTimer = null;
    this.cycleTimer = null;
    this.pointerId = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.dragStart = { x: 0, y: 0 };
    this.lastPointer = { x: 0, y: 0, t: 0 };
    this.releaseVelocity = { x: 0, y: 0 };
    this.ballX = 0;
    this.ballY = 0;
    this.lastShakeSound = 0;

    this.bindEvents();
    this.resetBallPosition();
    this.initSlotSprites();
  }

  bindEvents() {
    // Desbloqueio do áudio na primeira interação
    const unlock = () => {
      SorteioSound.ensureAudio();
    };
    document.body.addEventListener("pointerdown", unlock, { passive: true });

    // Drag-and-drop da Pokébola
    this.pokeballEl.addEventListener("pointerdown", (e) => this.startDrag(e));

    // Clicar no campo posiciona a Pokébola e inicia o drag
    this.throwField.addEventListener("pointerdown", (e) => {
      if (e.target === this.pokeballEl || this.pokeballEl.contains(e.target)) return;
      if (this.pokeballEl.classList.contains("disabled") || this.isBusy) return;
      const fieldRect = this.throwField.getBoundingClientRect();
      const size = this.getBallSize();
      this.ballX = e.clientX - fieldRect.left - size / 2;
      this.ballY = e.clientY - fieldRect.top - size / 2;
      this.clampBallPosition(this.ballX, this.ballY);
      this.applyBallPosition();
      this.startDrag(e);
    });

    window.addEventListener("pointermove", (e) => {
      if (this.pointerId !== e.pointerId || !this.isDragging || this.isBusy) return;
      this.moveBallToPointer(e.clientX, e.clientY);
      this.trackPointerMotion(e);
    });

    window.addEventListener("pointerup", (e) => this.endDrag(e));
    window.addEventListener("pointercancel", (e) => {
      if (this.pointerId !== e.pointerId) return;
      this.releasePointer();
    });

    // Redimensionamento da janela reposiciona a Pokébola
    window.addEventListener("resize", () => {
      if (!this.isBusy && !this.isDragging) this.resetBallPosition();
    });

    // Dismiss do overlay de captura
    this.btnDismissReveal.addEventListener("click", () => this.closeReveal());

    // Suporte para Acelerômetro de celular (Chacoalhar)
    if (window.DeviceMotionEvent) {
      let lastAccel = { x: 0, y: 0, z: 0 };
      window.addEventListener(
        "devicemotion",
        (e) => {
          if (this.isBusy) return;
          const data = this.config.onGetRaffleData();
          if (!data || data.candidates.length === 0) return;

          const a = e.accelerationIncludingGravity;
          if (!a) return;
          const delta =
            Math.abs(a.x - lastAccel.x) +
            Math.abs(a.y - lastAccel.y) +
            Math.abs(a.z - lastAccel.z);
          lastAccel = { x: a.x, y: a.y, z: a.z };
          if (delta > 12) {
            this.addShake(delta * 0.35);
            this.throwField.classList.add("field-shaking");
            this.pokeballEl.classList.add("shaking");
            clearTimeout(window._deviceShakeT);
            window._deviceShakeT = setTimeout(() => {
              this.throwField.classList.remove("field-shaking");
              if (!this.isDragging) this.pokeballEl.classList.remove("shaking");
            }, 180);
          }
        },
        { passive: true }
      );
    }
  }

  getBallSize() {
    return this.pokeballEl.offsetWidth || this.BALL_SIZE;
  }

  clampBallPosition(x, y) {
    const rect = this.throwField.getBoundingClientRect();
    const size = this.getBallSize();
    const maxX = rect.width - size;
    const maxY = rect.height - size;
    this.ballX = Math.max(0, Math.min(maxX, x));
    this.ballY = Math.max(0, Math.min(maxY, y));
  }

  applyBallPosition() {
    this.pokeballEl.style.left = `${this.ballX}px`;
    this.pokeballEl.style.top = `${this.ballY}px`;
    this.pokeballEl.style.marginLeft = "0";
    this.pokeballEl.style.marginTop = "0";
  }

  resetBallPosition() {
    const rect = this.throwField.getBoundingClientRect();
    const size = this.getBallSize();
    this.ballX = (rect.width - size) / 2;
    this.ballY = rect.height * 0.62 - size / 2;
    this.clampBallPosition(this.ballX, this.ballY);
    this.applyBallPosition();
  }

  updateShakeMeter() {
    const pct = Math.min(100, (this.shakeEnergy / this.SHAKE_REQUIRED) * 100);
    this.shakeMeterFill.style.width = `${pct}%`;
    const ready = this.shakeEnergy >= this.SHAKE_REQUIRED;
    this.pokeballEl.classList.toggle("ready", ready);
    this.throwField.classList.toggle("field-ready", ready);
    this.arenaTargets.classList.toggle("target-ready", ready);

    if (this.isBusy) return;

    const raffleData = this.config.onGetRaffleData();
    if (!raffleData || raffleData.candidates.length === 0) {
      this.pokeballHint.textContent = "Nenhum estudante disponível!";
      this.pokeballHint.classList.remove("ready");
      this.pokeballEl.classList.add("disabled");
      return;
    }
    this.pokeballEl.classList.remove("disabled");

    if (ready) {
      this.pokeballHint.textContent = "Pronto! Arremesse para os Pokémon!";
      this.pokeballHint.classList.add("ready");
      this.throwTarget.textContent = "Arremesse aqui! ↑";
    } else {
      this.pokeballHint.textContent = `Chacoalhe no campo (${Math.floor(pct)}%)`;
      this.pokeballHint.classList.remove("ready");
      this.throwTarget.textContent = "Zona dos Pokémon";
      this.throwField.classList.remove("field-shaking");
    }
  }

  addShake(amount) {
    if (this.isBusy) return;
    const raffleData = this.config.onGetRaffleData();
    if (!raffleData || raffleData.candidates.length === 0) return;

    const prev = this.shakeEnergy;
    this.shakeEnergy = Math.min(this.SHAKE_REQUIRED + 20, this.shakeEnergy + amount);
    const now = Date.now();
    if (now - this.lastShakeSound > 110) {
      this.lastShakeSound = now;
      SorteioSound.playShake();
    }

    this.updateShakeMeter();
    clearTimeout(this.shakeDecayTimer);
    this.shakeDecayTimer = setTimeout(() => {
      if (!this.isBusy && this.shakeEnergy < this.SHAKE_REQUIRED) {
        this.shakeEnergy = Math.max(0, this.shakeEnergy - 25);
        this.updateShakeMeter();
      }
    }, this.SHAKE_DECAY_MS);
  }

  initSlotSprites() {
    const picks = [];
    while (picks.length < 3) {
      const p = POKEMON_POOL[Math.floor(Math.random() * POKEMON_POOL.length)];
      if (!picks.find((x) => x.id === p.id)) picks.push(p);
    }
    this.slots.forEach((slot, i) => {
      const img = slot.querySelector(".slot-sprite");
      img.src = spriteUrl(picks[i].id);
      img.alt = picks[i].name;
    });
  }

  startSlotCycling(candidates) {
    this.slots.forEach((s) => s.classList.add("cycling"));
    const allNames = candidates.map(c => c.nome);

    SorteioSound.startCyclingSound();

    this.cycleTimer = setInterval(() => {
      this.slots.forEach((slot) => {
        const nameEl = slot.querySelector(".slot-name");
        const img = slot.querySelector(".slot-sprite");
        const poolName = allNames[Math.floor(Math.random() * allNames.length)] || "—";
        const poolMon = POKEMON_POOL[Math.floor(Math.random() * POKEMON_POOL.length)];
        nameEl.textContent = poolName;
        img.src = spriteUrl(poolMon.id);
        img.alt = poolMon.name;
        slot.dataset.pokemonId = String(poolMon.id);
      });
    }, this.CYCLE_INTERVAL_MS);
  }

  stopSlotCycling() {
    clearInterval(this.cycleTimer);
    this.slots.forEach((s) => s.classList.remove("cycling"));
    SorteioSound.stopCyclingSound();
  }

  setSlotsFinal(winnerName, pokemon) {
    this.slots.forEach((slot, i) => {
      const nameEl = slot.querySelector(".slot-name");
      const img = slot.querySelector(".slot-sprite");
      if (i === 1) { // Slot Central
        nameEl.textContent = winnerName;
        img.src = spriteUrl(pokemon.id);
        img.alt = pokemon.name;
        slot.classList.add("target-hit");
      } else {
        const raffleData = this.config.onGetRaffleData();
        const otherCandidates = raffleData ? raffleData.candidates.filter(c => c.nome !== winnerName) : [];
        const otherName = otherCandidates.length > 0 
          ? otherCandidates[Math.floor(Math.random() * otherCandidates.length)].nome 
          : "—";
        const otherMons = POKEMON_POOL.filter((p) => p.id !== pokemon.id);
        const otherMon = otherMons[Math.floor(Math.random() * otherMons.length)];
        
        nameEl.textContent = otherName;
        img.src = spriteUrl(otherMon.id);
      }
    });
  }

  startDrag(e) {
    if (this.pokeballEl.classList.contains("disabled") || this.isBusy) return;
    this.pointerId = e.pointerId;
    this.isDragging = true;
    const ballRect = this.pokeballEl.getBoundingClientRect();
    this.dragOffset.x = e.clientX - ballRect.left;
    this.dragOffset.y = e.clientY - ballRect.top;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.lastPointer = { x: e.clientX, y: e.clientY, t: performance.now() };
    this.releaseVelocity = { x: 0, y: 0 };
    this.pokeballEl.classList.add("is-dragging");
    this.pokeballEl.setPointerCapture(this.pointerId);
    e.preventDefault();
  }

  moveBallToPointer(clientX, clientY) {
    const fieldRect = this.throwField.getBoundingClientRect();
    const size = this.getBallSize();
    const x = clientX - fieldRect.left - this.dragOffset.x;
    const y = clientY - fieldRect.top - this.dragOffset.y;
    this.clampBallPosition(x, y);
    this.applyBallPosition();
  }

  trackPointerMotion(e) {
    const now = performance.now();
    const dx = e.clientX - this.lastPointer.x;
    const dy = e.clientY - this.lastPointer.y;
    const dt = Math.max(now - this.lastPointer.t, 8);
    const speed = (Math.abs(dx) + Math.abs(dy)) / dt;

    this.releaseVelocity = { x: dx / dt, y: -dy / dt };

    if (speed > 0.5) {
      this.addShake(speed * 3);
      this.pokeballEl.classList.add("shaking");
      this.throwField.classList.add("field-shaking");
    }

    this.lastPointer = { x: e.clientX, y: e.clientY, t: now };
  }

  releasePointer() {
    this.pointerId = null;
    this.isDragging = false;
    this.pokeballEl.classList.remove("is-dragging", "shaking");
    this.throwField.classList.remove("field-shaking");
  }

  canThrow(e) {
    if (this.shakeEnergy < this.SHAKE_REQUIRED) return false;

    const flickUp = this.releaseVelocity.y >= this.THROW_MIN_SPEED || (this.dragStart.y - e.clientY) >= this.THROW_MIN_UP;
    const inUpperZone = this.ballY < this.throwField.getBoundingClientRect().height * 0.35;

    return flickUp || inUpperZone;
  }

  endDrag(e) {
    if (this.pointerId !== e.pointerId) return;
    try { this.pokeballEl.releasePointerCapture(this.pointerId); } catch (err) {}
    this.releasePointer();

    if (this.canThrow(e)) {
      this.throwPokeball(e.clientX);
    }
  }

  throwPokeball(aimClientX) {
    if (this.isBusy || this.shakeEnergy < this.SHAKE_REQUIRED) return;
    
    // Pede dados de sorteio
    const raffleData = this.config.onGetRaffleData();
    if (!raffleData || raffleData.candidates.length === 0) return;

    this.isBusy = true;
    this.config.onDrawStart();

    const winner = raffleData.winner;
    const candidates = raffleData.candidates;
    const pokemon = POKEMON_POOL[Math.floor(Math.random() * POKEMON_POOL.length)];

    SorteioSound.playThrow();

    const rect = this.pokeballEl.getBoundingClientRect();
    
    // Calcula ponto de colisão no slot central
    const targetsRect = this.arenaTargets.getBoundingClientRect();
    const slotsRect = this.pokemonSlots.getBoundingClientRect();
    const targetY = slotsRect.top + slotsRect.height * 0.45;
    
    let targetX = targetsRect.left + targetsRect.width / 2; // Default no meio
    if (aimClientX != null) {
      const targetSlot = this.slots[1]; // Tenta focar no slot do meio
      const r = targetSlot.getBoundingClientRect();
      targetX = r.left + r.width / 2;
    }

    this.pokeballEl.classList.add("hidden-ball");

    // Cria clone voador
    const fly = document.createElement("div");
    fly.className = "flying-ball";
    fly.innerHTML = this.pokeballEl.querySelector(".pokeball").outerHTML;
    document.body.appendChild(fly);

    const size = this.getBallSize();
    const half = size / 2;
    const startX = rect.left + rect.width / 2 - half;
    const startY = rect.top + rect.height / 2 - half;

    fly.style.left = `${startX}px`;
    fly.style.top = `${startY}px`;

    const endX = targetX - half;
    const endY = targetY - half;
    const duration = 620;
    const start = performance.now();
    let lastTrail = 0;

    const spawnTrail = (x, y) => {
      const trail = document.createElement("div");
      trail.className = "ball-trail";
      trail.style.left = `${x - 7}px`;
      trail.style.top = `${y - 7}px`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 450);
    };

    const animateFly = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 2.8);
      const x = startX + (endX - startX) * ease;
      const arc = Math.sin(t * Math.PI) * 90;
      const y = startY + (endY - startY) * ease - arc;
      const rot = t * 900;
      const scale = 1 - t * 0.12;
      
      fly.style.left = `${x}px`;
      fly.style.top = `${y}px`;
      fly.style.transform = `rotate(${rot}deg) scale(${scale})`;

      if (now - lastTrail > 45) {
        lastTrail = now;
        spawnTrail(x + half, y + half);
      }

      if (t < 1) {
        requestAnimationFrame(animateFly);
      } else {
        fly.remove();
        
        // Efeito visual de impacto
        this.slots.forEach((s) => s.classList.add("slot-hit-flash"));
        setTimeout(() => this.slots.forEach((s) => s.classList.remove("slot-hit-flash")), 400);
        
        this.shakeEnergy = 0;
        this.updateShakeMeter();
        
        this.runCaptureSequence(winner, candidates, pokemon);
      }
    };

    requestAnimationFrame(animateFly);
  }

  async runCaptureSequence(winner, candidates, pokemon) {
    this.startSlotCycling(candidates);
    
    // Cicla por 1.8 segundos criando tensão
    await this.delay(1800);
    
    this.stopSlotCycling();
    this.setSlotsFinal(winner.nome, pokemon);
    
    await this.delay(600);

    // Revela overlay de captura
    this.revealEl.classList.remove("hidden");
    
    SorteioSound.playCapture();

    // Preenche dados da revelação
    this.capturePokemonImg.src = spriteUrl(pokemon.id);
    this.capturePokemonImg.alt = pokemon.name;
    this.capturePokemonName.textContent = pokemon.name;
    this.captureTrainerName.textContent = winner.nome;
    
    const now = new Date();
    this.captureDatetime.textContent = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Envia retorno do sorteio para atualizar localStorage e interface
    this.config.onDrawComplete(winner, this.config.onGetRaffleData().group);
  }

  closeReveal() {
    this.revealEl.classList.add("hidden");
    this.slots.forEach((s) => s.classList.remove("target-hit"));
    this.shakeEnergy = 0;
    this.pokeballEl.classList.remove("hidden-ball");
    this.resetBallPosition();
    this.initSlotSprites();
    this.isBusy = false;
    this.updateShakeMeter();
  }

  autoThrow() {
    if (this.isBusy) return;
    
    const raffleData = this.config.onGetRaffleData();
    if (!raffleData || raffleData.candidates.length === 0) {
      alert("Selecione uma turma primeiro!");
      return;
    }

    this.isBusy = true;
    this.config.onDrawStart();

    // Anima a Pokébola carregando energia
    let progress = 0;
    this.pokeballEl.classList.add("shaking");
    this.throwField.classList.add("field-shaking");
    
    const shakeInterval = setInterval(() => {
      progress += 10;
      this.addShake(10);
      
      if (progress >= 100) {
        clearInterval(shakeInterval);
        this.pokeballEl.classList.remove("shaking");
        this.throwField.classList.remove("field-shaking");
        
        // Simula o arremesso automático em direção ao centro do campo
        setTimeout(() => {
          this.isBusy = false; // Desbloqueia temporariamente para permitir o throwPokeball normal
          this.throwPokeball(null);
        }, 150);
      }
    }, 80);
  }

  delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

window.PokemonArenaEngine = PokemonArena;

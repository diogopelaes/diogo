// ══════════════════════════════════════════════════
//  Pokédex da Rodada — Módulo independente
//  Arquivo separado para facilitar rollback.
//  Para remover: delete pokedex.js e remova os
//  <script src="pokedex.js"> dos HTMLs.
//  As chamadas em script.js (Pokedex.*) viram no-op.
// ══════════════════════════════════════════════════

(function () {
  "use strict";

  const POKEMON_COUNT = 151;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ── State ────────────────────────────────────────
  let caughtList = []; // { id, name, sprite }
  let panelEl = null;
  let gridEl = null;
  let countEl = null;
  let emptyEl = null;
  let toggleBtnEl = null;
  let collapsed = false;

  // ── Fetch Pokémon ────────────────────────────────
  async function fetchPokemon() {
    const id = rand(1, POKEMON_COUNT);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      return {
        id,
        name: data.name,
        sprite:
          data.sprites.other["official-artwork"].front_default ||
          data.sprites.front_default,
      };
    } catch {
      return {
        id: 25,
        name: "pikachu",
        sprite:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
      };
    }
  }

  // ── Inject Styles ────────────────────────────────
  function injectStyles() {
    if (document.getElementById("pokedex-styles")) return;
    const style = document.createElement("style");
    style.id = "pokedex-styles";
    style.textContent = `
      /* ── Pokédex Panel ── */
      .pokedex-panel {
        margin-top: 1.25rem;
        background: rgba(30, 41, 59, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 1.25rem;
        padding: 1rem 1.1rem;
        position: relative;
        z-index: 1;
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .pokedex-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.6rem;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }

      .pokedex-title {
        font-family: "Outfit", sans-serif;
        font-size: 1rem;
        font-weight: 800;
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .pokedex-count {
        font-family: "Inter", sans-serif;
        font-size: 0.78rem;
        font-weight: 600;
        color: #94a3b8;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .pokedex-toggle {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.2rem 0.4rem;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
        line-height: 1;
      }

      .pokedex-toggle:hover {
        background: rgba(255,255,255,0.08);
        color: #f1f5f9;
      }

      .pokedex-body {
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.3s ease;
        max-height: 400px;
        opacity: 1;
      }

      .pokedex-body.collapsed {
        max-height: 0;
        opacity: 0;
      }

      .pokedex-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5rem;
      }

      .pokedex-slot {
        background: rgba(255, 255, 255, 0.04);
        border: 1.5px dashed rgba(148, 163, 184, 0.2);
        border-radius: 0.85rem;
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .pokedex-slot.caught {
        border: 1.5px solid rgba(99, 102, 241, 0.35);
        background: rgba(99, 102, 241, 0.08);
        animation: pokedex-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .pokedex-slot.empty-placeholder {
        opacity: 0.35;
      }

      .pokedex-slot img {
        width: 72%;
        height: auto;
        image-rendering: auto;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        transition: transform 0.25s ease;
      }

      .pokedex-slot:hover img {
        transform: scale(1.15);
      }

      .pokedex-slot .poke-slot-name {
        font-size: 0.6rem;
        font-weight: 600;
        color: #cbd5e1;
        text-transform: capitalize;
        margin-top: 2px;
        text-align: center;
        line-height: 1.15;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 2px;
      }

      .pokedex-slot .poke-slot-placeholder {
        font-size: 1.5rem;
        opacity: 0.3;
      }

      .pokedex-slot .poke-slot-number {
        position: absolute;
        top: 3px;
        right: 5px;
        font-size: 0.55rem;
        font-weight: 700;
        color: rgba(148, 163, 184, 0.5);
      }

      .pokedex-empty {
        text-align: center;
        padding: 0.8rem 0 0.4rem;
        color: #64748b;
        font-size: 0.82rem;
        font-weight: 500;
      }

      @keyframes pokedex-pop {
        0%   { transform: scale(0.5); opacity: 0; }
        60%  { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }

      @media (max-width: 440px) {
        .pokedex-grid {
          grid-template-columns: repeat(5, 1fr);
          gap: 0.35rem;
        }
        .pokedex-slot .poke-slot-name {
          font-size: 0.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Build UI ─────────────────────────────────────
  function buildPanel() {
    if (panelEl) return;
    injectStyles();

    panelEl = document.createElement("div");
    panelEl.className = "pokedex-panel";
    panelEl.id = "pokedex-panel";

    // Header
    const header = document.createElement("div");
    header.className = "pokedex-header";
    header.addEventListener("click", togglePanel);

    const title = document.createElement("div");
    title.className = "pokedex-title";
    title.innerHTML = "📋 Pokédex da Rodada";

    countEl = document.createElement("div");
    countEl.className = "pokedex-count";
    updateCountText();

    toggleBtnEl = document.createElement("button");
    toggleBtnEl.className = "pokedex-toggle";
    toggleBtnEl.textContent = "▼";
    toggleBtnEl.title = "Expandir/Recolher";

    header.appendChild(title);
    const rightSide = document.createElement("div");
    rightSide.style.display = "flex";
    rightSide.style.alignItems = "center";
    rightSide.style.gap = "0.5rem";
    rightSide.appendChild(countEl);
    rightSide.appendChild(toggleBtnEl);
    header.appendChild(rightSide);

    // Body
    const body = document.createElement("div");
    body.className = "pokedex-body";
    body.id = "pokedex-body";

    gridEl = document.createElement("div");
    gridEl.className = "pokedex-grid";
    gridEl.id = "pokedex-grid";

    emptyEl = document.createElement("div");
    emptyEl.className = "pokedex-empty";
    emptyEl.textContent = "Acerte questões para capturar Pokémon! 🎯";

    body.appendChild(gridEl);
    body.appendChild(emptyEl);

    panelEl.appendChild(header);
    panelEl.appendChild(body);

    // Insert into the container, after #game-area
    const gameArea = document.getElementById("game-area");
    if (gameArea && gameArea.parentNode) {
      gameArea.parentNode.insertBefore(panelEl, gameArea.nextSibling);
    }

    renderGrid();
  }

  function togglePanel() {
    collapsed = !collapsed;
    const body = document.getElementById("pokedex-body");
    if (body) {
      body.classList.toggle("collapsed", collapsed);
    }
    if (toggleBtnEl) {
      toggleBtnEl.textContent = collapsed ? "▶" : "▼";
    }
  }

  function updateCountText() {
    if (countEl) {
      countEl.textContent = `${caughtList.length}/10 capturados`;
    }
  }

  // ── Render Grid ──────────────────────────────────
  function renderGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = "";

    for (let i = 0; i < 10; i++) {
      const slot = document.createElement("div");
      slot.className = "pokedex-slot";

      const numTag = document.createElement("span");
      numTag.className = "poke-slot-number";
      numTag.textContent = `#${i + 1}`;
      slot.appendChild(numTag);

      if (i < caughtList.length) {
        const poke = caughtList[i];
        slot.classList.add("caught");

        const img = document.createElement("img");
        img.src = poke.sprite;
        img.alt = poke.name;
        img.loading = "lazy";
        slot.appendChild(img);

        const name = document.createElement("span");
        name.className = "poke-slot-name";
        name.textContent = poke.name;
        slot.appendChild(name);
      } else {
        slot.classList.add("empty-placeholder");
        const ph = document.createElement("span");
        ph.className = "poke-slot-placeholder";
        ph.textContent = "?";
        slot.appendChild(ph);
      }

      gridEl.appendChild(slot);
    }

    if (emptyEl) {
      emptyEl.style.display = caughtList.length === 0 ? "block" : "none";
    }

    updateCountText();
  }

  // ── Public API ───────────────────────────────────

  /**
   * Inicializa a Pokédex na página.
   * Chamado automaticamente ao carregar o script.
   */
  function init() {
    // Só mostra nas páginas de jogo, não no hub
    const page = document.body ? document.body.dataset.page : null;
    if (!page || page === "hub") return;
    buildPanel();
  }

  /**
   * Captura o Pokémon passado (da questão) e adiciona à Pokédex da rodada.
   */
  async function catchPokemon(poke) {
    if (!panelEl) return null;
    if (!poke) {
      poke = await fetchPokemon();
    }
    caughtList.push(poke);
    renderGrid();
    return poke;
  }

  /**
   * Reseta a Pokédex (limpa todos os Pokémon capturados).
   */
  function reset() {
    caughtList = [];
    if (gridEl) renderGrid();
  }

  /**
   * Retorna a lista de Pokémon capturados.
   */
  function getCaught() {
    return [...caughtList];
  }

  // ── Expose global ────────────────────────────────
  window.Pokedex = {
    init,
    catchPokemon,
    reset,
    getCaught,
  };

  // Auto-init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

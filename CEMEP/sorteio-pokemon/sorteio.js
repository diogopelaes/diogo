/**
 * sorteio.js - Lógica de Execução do Sorteio CEMEP (Estudante + Questão)
 */

document.addEventListener("DOMContentLoaded", function () {
  const list = document.getElementById("studentList");
  const count = document.getElementById("studentCount");
  const emptyState = document.getElementById("emptyState");
  const raffleResult = document.getElementById("raffleResult");
  const modeBadges = document.getElementById("modeBadges");
  const questionStatusBox = document.getElementById("questionStatusBox");
  const questionCount = document.getElementById("questionCount");
  const questionPills = document.getElementById("questionPills");

  // Elementos do sorteio de questão no Reveal
  const questionDrawBox = document.getElementById("question-draw-box");
  const questionNumberDisplay = document.getElementById("question-number-display");
  const questionPoolInfo = document.getElementById("question-pool-info");
  const btnDrawQuestion = document.getElementById("btn-draw-question");
  const btnDismissReveal = document.getElementById("btn-dismiss-reveal");

  // Elementos de seleção de colegas no Reveal
  const captureTrainerName = document.getElementById("capture-trainer-name");
  const partnerPickerBox = document.getElementById("partner-picker-box");
  const partnerSelectedCount = document.getElementById("partner-selected-count");
  const partnerSearch = document.getElementById("partner-search");
  const partnerChipsList = document.getElementById("partner-chips-list");

  // Modal Elements
  const modal = document.getElementById("studentModal");
  const modalName = document.getElementById("modalStudentName");
  const markAsDrawnBtn = document.getElementById("markAsDrawnBtn");
  const resetStudentBtn = document.getElementById("resetStudentBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");

  let currentWinner = null;
  let lastDrawnStudent = null;
  let lastDrawnGroup = null;
  let isDrawingQuestion = false;
  let currentEditingStudent = null;
  let eligiblePartners = [];
  let selectedPartners = new Set();
  let partnersCommitted = false;

  const rawData = localStorage.getItem("sorteioData");
  if (!rawData) {
    window.location.href = "index.html";
    return;
  }

  const data = JSON.parse(rawData);

  // Normaliza opções de repetição (compatibilidade com JSONs antigos)
  if (data.repetir_estudante === undefined) {
    data.repetir_estudante = Boolean(data.com_reposicao);
  }
  if (data.repetir_numero === undefined) {
    data.repetir_numero = false;
  }

  const groups = data.turmas || [];
  let selectedGroupIndex = -1;

  // Atualiza o Título da Página dinamicamente
  if (data.titulo) {
    document.getElementById("raffleHeaderTitle").textContent = data.titulo;
  }

  // Renderiza badges dos modos de repetição
  function renderModeBadges() {
    if (!modeBadges) return;
    const hasAnyQuestions = groups.some(
      (g) => Array.isArray(g.questoes) && g.questoes.length > 0
    );
    const estBadge = data.repetir_estudante
      ? "Estudante: Com repetição"
      : "Estudante: Sem repetição";
    const numBadge = data.repetir_numero
      ? "Questão: Com repetição"
      : "Questão: Sem repetição";

    modeBadges.innerHTML = `
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">${estBadge}</span>
      ${
        hasAnyQuestions
          ? `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">${numBadge}</span>`
          : ""
      }
    `;
  }
  renderModeBadges();

  function getAvailableQuestions(group) {
    const questoes = Array.isArray(group.questoes) ? group.questoes : [];
    if (data.repetir_numero) {
      const bloqueadas = Array.isArray(group.questoes_bloqueadas)
        ? group.questoes_bloqueadas
        : [];
      return questoes.filter((q) => !bloqueadas.includes(q));
    }

    const sorteadas = Array.isArray(group.questoes_sorteadas)
      ? group.questoes_sorteadas
      : [];

    // Remove uma ocorrência para cada item já sorteado
    const remaining = [...questoes];
    sorteadas.forEach((q) => {
      const idx = remaining.indexOf(q);
      if (idx !== -1) remaining.splice(idx, 1);
    });
    return remaining;
  }

  // Pokemon Capture Arena Engine
  const arenaEngine = new PokemonArenaEngine({
    arenaResultId: "raffleResult",
    slotsId: "pokemon-slots",
    throwFieldId: "throw-field",
    pokeballId: "pokeball",
    revealId: "arena-reveal",
    onGetRaffleData: () => {
      if (selectedGroupIndex === -1) return null;
      const group = groups[selectedGroupIndex];
      const candidates = data.repetir_estudante
        ? group.estudantes
        : group.estudantes.filter((e) => e.sorteios_count === 0);

      if (candidates.length === 0) return { candidates: [], winner: null, group };

      if (!currentWinner) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        currentWinner = candidates[randomIndex];
      }

      return { candidates, winner: currentWinner, group };
    },
    onDrawStart: () => {
      isDrawingQuestion = false;
    },
    onDrawComplete: (winner, group) => {
      // 1. Incrementa a contagem global
      data.qtd_sorteios = (data.qtd_sorteios || 0) + 1;

      // 2. Atualiza a posição do estudante (Apenas no modo "Sem Repetição")
      if (!data.repetir_estudante) {
        winner.posicao = data.qtd_sorteios;
      }

      // 3. Registra os dados do sorteio no estudante
      winner.sorteios_count = (winner.sorteios_count || 0) + 1;
      if (!winner.sorteios_datas) winner.sorteios_datas = [];
      if (!winner.questoes_sorteadas) winner.questoes_sorteadas = [];

      const now = new Date();
      const timestamp =
        now.toLocaleDateString("pt-BR") +
        " " +
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      winner.sorteios_datas.unshift(timestamp);

      // Salva o novo estado no localStorage
      localStorage.setItem("sorteioData", JSON.stringify(data));

      // Re-renderiza lista lateral
      renderStudentList(selectedGroupIndex);

      // Prepara etapa 2: escolha opcional de colegas + sorteio da questão
      setupPartnerPicker(winner, group);
      setupQuestionDraw(winner, group);

      currentWinner = null;

      // Efeito de Celebração (Confetes)
      triggerCelebration();
    },
  });

  function updatePartnerHeaderAndCount() {
    const qtd = selectedPartners.size;
    partnerSelectedCount.textContent =
      qtd === 1 ? "1 selecionado" : `${qtd} selecionados`;

    if (lastDrawnStudent) {
      if (qtd === 0) {
        captureTrainerName.textContent = lastDrawnStudent.nome;
      } else {
        const partnerNames = [...selectedPartners]
          .map((p) => p.nome.split(" ")[0])
          .join(", ");
        captureTrainerName.textContent = `${lastDrawnStudent.nome} + ${partnerNames}`;
      }
    }
  }

  function renderPartnerChips(locked = false) {
    const filter = (partnerSearch.value || "").trim().toLowerCase();
    partnerChipsList.innerHTML = "";

    const filtered = eligiblePartners.filter((e) =>
      e.nome.toLowerCase().includes(filter)
    );

    if (filtered.length === 0) {
      const empty = document.createElement("span");
      empty.className = "text-xs text-gray-500 italic";
      empty.textContent = "Nenhum colega encontrado.";
      partnerChipsList.appendChild(empty);
      return;
    }

    filtered.forEach((estudante) => {
      const isSelected = selectedPartners.has(estudante);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `partner-chip ${isSelected ? "selected" : ""}`;
      chip.disabled = locked;
      chip.textContent = isSelected ? `✓ ${estudante.nome}` : estudante.nome;

      chip.addEventListener("click", () => {
        if (partnersCommitted || isDrawingQuestion) return;
        if (selectedPartners.has(estudante)) {
          selectedPartners.delete(estudante);
        } else {
          selectedPartners.add(estudante);
        }
        updatePartnerHeaderAndCount();
        renderPartnerChips(false);
      });

      partnerChipsList.appendChild(chip);
    });
  }

  function setupPartnerPicker(winner, group) {
    lastDrawnStudent = winner;
    lastDrawnGroup = group;
    selectedPartners = new Set();
    partnersCommitted = false;
    partnerSearch.value = "";
    partnerSearch.disabled = false;

    eligiblePartners = group.estudantes.filter(
      (e) => e !== winner && (data.repetir_estudante || e.sorteios_count === 0)
    );

    updatePartnerHeaderAndCount();

    if (eligiblePartners.length === 0) {
      partnerPickerBox.classList.add("hidden");
      return;
    }

    partnerPickerBox.classList.remove("hidden");
    renderPartnerChips(false);
  }

  partnerSearch.addEventListener("input", () => {
    renderPartnerChips(partnersCommitted || isDrawingQuestion);
  });

  function commitPartners(questionNumber = null) {
    if (partnersCommitted) return;
    partnersCommitted = true;
    partnerSearch.disabled = true;
    renderPartnerChips(true);

    if (selectedPartners.size === 0) return;

    const now = new Date();
    const timestamp =
      now.toLocaleDateString("pt-BR") +
      " " +
      now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    selectedPartners.forEach((partner) => {
      data.qtd_sorteios = (data.qtd_sorteios || 0) + 1;
      if (!data.repetir_estudante) {
        partner.posicao = data.qtd_sorteios;
      }
      partner.sorteios_count = (partner.sorteios_count || 0) + 1;
      if (!Array.isArray(partner.sorteios_datas)) partner.sorteios_datas = [];
      partner.sorteios_datas.unshift(timestamp);

      if (!Array.isArray(partner.questoes_sorteadas)) {
        partner.questoes_sorteadas = [];
      }
      if (questionNumber !== null) {
        partner.questoes_sorteadas.push(questionNumber);
      }
    });
  }

  btnDismissReveal.addEventListener("click", () => {
    if (!partnersCommitted && selectedPartners.size > 0) {
      commitPartners(null);
      localStorage.setItem("sorteioData", JSON.stringify(data));
      if (selectedGroupIndex !== -1) renderStudentList(selectedGroupIndex);
    }
  });

  function setupQuestionDraw(winner, group) {
    lastDrawnStudent = winner;
    lastDrawnGroup = group;
    isDrawingQuestion = false;

    const totalQuestoes = Array.isArray(group.questoes) ? group.questoes.length : 0;
    const available = getAvailableQuestions(group);

    if (totalQuestoes === 0) {
      questionDrawBox.classList.add("hidden");
      btnDismissReveal.classList.remove("btn-secondary");
      btnDismissReveal.classList.add("btn-primary");
      return;
    }

    questionDrawBox.classList.remove("hidden");
    questionNumberDisplay.textContent = "?";
    questionNumberDisplay.classList.remove("cycling", "drawn");

    // Restaura botão Continuar como secundário até sortear a questão
    btnDismissReveal.classList.remove("btn-primary");
    btnDismissReveal.classList.add("btn-secondary");

    if (available.length === 0) {
      questionPoolInfo.textContent = "Todas as questões desta turma já foram sorteadas!";
      btnDrawQuestion.classList.add("hidden");
      return;
    }

    questionPoolInfo.textContent = data.repetir_numero
      ? `${totalQuestoes} questões disponíveis (com repetição)`
      : `${available.length} de ${totalQuestoes} questões disponíveis`;

    btnDrawQuestion.classList.remove("hidden");
    btnDrawQuestion.disabled = false;
  }

  btnDrawQuestion.addEventListener("click", async function () {
    if (isDrawingQuestion || !lastDrawnStudent || !lastDrawnGroup) return;

    const available = getAvailableQuestions(lastDrawnGroup);
    if (available.length === 0) return;

    isDrawingQuestion = true;
    btnDrawQuestion.disabled = true;
    partnerSearch.disabled = true;
    renderPartnerChips(true);

    const chosen = available[Math.floor(Math.random() * available.length)];

    questionNumberDisplay.classList.remove("drawn");
    questionNumberDisplay.classList.add("cycling");

    if (window.SorteioSound) window.SorteioSound.startCyclingSound();

    // Roleta rápida pelos números disponíveis
    const cycleInterval = setInterval(() => {
      const rand = available[Math.floor(Math.random() * available.length)];
      questionNumberDisplay.textContent = `Questão ${rand}`;
    }, 75);

    await new Promise((r) => setTimeout(r, 1100));

    clearInterval(cycleInterval);
    if (window.SorteioSound) {
      window.SorteioSound.stopCyclingSound();
      window.SorteioSound.playCapture();
    }

    questionNumberDisplay.classList.remove("cycling");
    questionNumberDisplay.classList.add("drawn");
    questionNumberDisplay.textContent = `Questão ${chosen}`;

    // Persiste a questão sorteada na turma e no estudante
    if (!data.repetir_numero) {
      if (!Array.isArray(lastDrawnGroup.questoes_sorteadas)) {
        lastDrawnGroup.questoes_sorteadas = [];
      }
      lastDrawnGroup.questoes_sorteadas.push(chosen);
    }

    if (!Array.isArray(lastDrawnStudent.questoes_sorteadas)) {
      lastDrawnStudent.questoes_sorteadas = [];
    }
    lastDrawnStudent.questoes_sorteadas.push(chosen);

    // Registra colegas escolhidos como sorteados e com a mesma questão
    commitPartners(chosen);

    localStorage.setItem("sorteioData", JSON.stringify(data));
    renderStudentList(selectedGroupIndex);
    renderQuestionStatus(selectedGroupIndex);

    const remainingAfter = getAvailableQuestions(lastDrawnGroup).length;
    const totalQuestoes = (lastDrawnGroup.questoes || []).length;
    questionPoolInfo.textContent = data.repetir_numero
      ? `${totalQuestoes} questões disponíveis (com repetição)`
      : `${remainingAfter} de ${totalQuestoes} questões restantes`;

    btnDrawQuestion.classList.add("hidden");
    btnDismissReveal.classList.remove("btn-secondary");
    btnDismissReveal.classList.add("btn-primary");

    confetti({
      particleCount: 70,
      spread: 65,
      origin: { y: 0.65 },
      colors: ["#ff6b00", "#fde047", "#ffffff"],
    });

    isDrawingQuestion = false;
  });

  // Prepara opções para o Select
  const options = groups.map((group, index) => ({
    label: `Turma: ${group.turma}`,
    value: index,
  }));

  /**
   * Alterna manualmente se uma questão está disponível ou marcada/retirada do sorteio
   */
  function toggleQuestionAvailability(groupIndex, questionValue, currentlyUsed) {
    const group = groups[groupIndex];
    if (!group) return;

    if (data.repetir_numero) {
      if (!Array.isArray(group.questoes_bloqueadas)) {
        group.questoes_bloqueadas = [];
      }
      if (currentlyUsed) {
        group.questoes_bloqueadas = group.questoes_bloqueadas.filter(
          (q) => q !== questionValue
        );
      } else if (!group.questoes_bloqueadas.includes(questionValue)) {
        group.questoes_bloqueadas.push(questionValue);
      }
    } else {
      if (!Array.isArray(group.questoes_sorteadas)) {
        group.questoes_sorteadas = [];
      }
      if (currentlyUsed) {
        const idx = group.questoes_sorteadas.indexOf(questionValue);
        if (idx !== -1) group.questoes_sorteadas.splice(idx, 1);
      } else {
        group.questoes_sorteadas.push(questionValue);
      }
    }

    localStorage.setItem("sorteioData", JSON.stringify(data));
    renderQuestionStatus(groupIndex);

    // Se o painel de revelação estiver aberto aguardando sortear a questão, atualiza a contagem
    if (lastDrawnGroup === group && !isDrawingQuestion && !questionNumberDisplay.classList.contains("drawn")) {
      setupQuestionDraw(lastDrawnStudent, lastDrawnGroup);
    }
  }

  /**
   * Renderiza o status das questões da turma na Sidebar
   */
  function renderQuestionStatus(groupIndex) {
    const group = groups[groupIndex];
    const questoes = Array.isArray(group.questoes) ? group.questoes : [];

    if (questoes.length === 0) {
      questionStatusBox.classList.add("hidden");
      questionPills.innerHTML = "";
      return;
    }

    const available = getAvailableQuestions(group);

    questionStatusBox.classList.remove("hidden");

    if (data.repetir_numero) {
      questionCount.textContent = `${available.length}/${questoes.length} (repete)`;
    } else {
      questionCount.textContent = `${available.length}/${questoes.length}`;
    }

    // Marca quais já foram sorteadas/retiradas (respeitando múltiplas ocorrências se houver)
    const usedCount = {};
    const sourceList = data.repetir_numero
      ? group.questoes_bloqueadas
      : group.questoes_sorteadas;
    if (Array.isArray(sourceList)) {
      sourceList.forEach((q) => {
        usedCount[q] = (usedCount[q] || 0) + 1;
      });
    }

    questionPills.innerHTML = "";
    questoes.forEach((q) => {
      const pill = document.createElement("button");
      pill.type = "button";
      const isUsed = usedCount[q] > 0;
      if (isUsed) usedCount[q]--;

      pill.className = isUsed
        ? "text-[11px] font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-400/60 line-through border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition"
        : "text-[11px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-200 border border-white/10 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/15 transition";
      pill.textContent = q;
      pill.title = isUsed
        ? "Clique para incluir novamente no sorteio"
        : "Clique para retirar do sorteio";
      pill.addEventListener("click", () => {
        toggleQuestionAvailability(groupIndex, q, isUsed);
      });
      questionPills.appendChild(pill);
    });
  }

  /**
   * Renderiza a Lista de Estudantes na Sidebar
   * @param {number} groupIndex
   */
  function renderStudentList(groupIndex) {
    const group = groups[groupIndex];
    list.innerHTML = "";

    let drawnCount = 0;
    group.estudantes.forEach((estudante) => {
      if (estudante.sorteios_count > 0) drawnCount++;

      const item = document.createElement("div");
      const isDrawn = estudante.sorteios_count > 0;
      item.className = `student-item-sidebar ${isDrawn ? "drawn" : ""}`;

      const ultimaData =
        isDrawn && estudante.sorteios_datas && estudante.sorteios_datas.length > 0
          ? estudante.sorteios_datas[0]
          : null;

      const questoesDoAluno =
        Array.isArray(estudante.questoes_sorteadas) && estudante.questoes_sorteadas.length > 0
          ? estudante.questoes_sorteadas.join(", ")
          : null;

      item.innerHTML = `
        <iconify-icon icon="${isDrawn ? "material-symbols:check-circle" : "material-symbols:radio-button-unchecked"}" class="status-icon"></iconify-icon>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-base font-semibold ${isDrawn ? "text-green-400" : "text-gray-200"} truncate">${estudante.nome}</span>
          <div class="flex flex-wrap items-center gap-2">
            ${
              data.repetir_estudante
                ? `<span class="text-[11px] text-gray-500 uppercase tracking-widest font-medium">
                    Sorteado: ${estudante.sorteios_count}x
                  </span>`
                : ""
            }
            ${
              questoesDoAluno
                ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">
                    Q: ${questoesDoAluno}
                  </span>`
                : ""
            }
            ${
              ultimaData
                ? `<span class="text-[11px] text-gray-400 font-medium">
                    • ${ultimaData}
                  </span>`
                : ""
            }
          </div>
        </div>
      `;

      item.style.cursor = "pointer";
      item.onclick = () => openStudentModal(estudante);

      list.appendChild(item);
    });

    count.textContent = `${drawnCount}/${group.estudantes.length}`;
  }

  // Inicializa o Select Customizado (via style.js)
  CustomUI.initSelect("turmaSelectContainer", options, (index) => {
    selectedGroupIndex = index;
    renderStudentList(index);
    renderQuestionStatus(index);

    emptyState.classList.add("hidden");
    raffleResult.classList.remove("hidden");
    currentWinner = null;
    lastDrawnStudent = null;
    lastDrawnGroup = null;
    arenaEngine.closeReveal();
  });

  /**
   * Dispara um efeito de celebração aleatório e bem distinto
   */
  function triggerCelebration() {
    const effects = [
      () => {
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#ff6b00", "#ffffff"] });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#ff6b00", "#ffffff"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      },
      () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          confetti({
            particleCount: 40,
            startVelocity: 30,
            spread: 360,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ["#ff6b00", "#ff9d00", "#ffffff", "#000000"],
          });
        }, 300);
      },
      () => {
        const defaults = { spread: 360, ticks: 100, gravity: 0, decay: 0.94, startVelocity: 30, colors: ["#ff6b00", "#ffffff", "#ffeb3b"] };
        confetti({ ...defaults, particleCount: 80, scalar: 1.5, shapes: ["star"] });
        confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ["circle"] });
      },
      () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#ff6b00", "#ffffff", "#ff9d00"] });
      },
      () => {
        const duration = 4 * 1000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 2, angle: -90, spread: 360, origin: { x: Math.random(), y: 0 }, colors: ["#ff6b00"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      },
    ];

    const randomIndex = Math.floor(Math.random() * effects.length);
    effects[randomIndex]();
  }

  /**
   * Lógica do Modal
   */
  function openStudentModal(estudante) {
    currentEditingStudent = estudante;
    modalName.textContent = estudante.nome;
    modal.classList.add("active");

    if (estudante.sorteios_count > 0) {
      markAsDrawnBtn.classList.add("hidden");
      resetStudentBtn.classList.remove("hidden");
    } else {
      markAsDrawnBtn.classList.remove("hidden");
      resetStudentBtn.classList.add("hidden");
    }
  }

  function closeModal() {
    modal.classList.remove("active");
    currentEditingStudent = null;
  }

  closeModalBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Resetar Estudante (e devolver suas questões sorteadas se sem repetição)
  resetStudentBtn.onclick = () => {
    if (!currentEditingStudent) return;

    if (!data.repetir_numero && selectedGroupIndex !== -1 && Array.isArray(currentEditingStudent.questoes_sorteadas)) {
      const group = groups[selectedGroupIndex];
      if (Array.isArray(group.questoes_sorteadas)) {
        currentEditingStudent.questoes_sorteadas.forEach((q) => {
          const idx = group.questoes_sorteadas.indexOf(q);
          if (idx !== -1) group.questoes_sorteadas.splice(idx, 1);
        });
      }
    }

    currentEditingStudent.sorteios_count = 0;
    currentEditingStudent.sorteios_datas = [];
    currentEditingStudent.questoes_sorteadas = [];
    currentEditingStudent.posicao = data.repetir_estudante ? null : 0;

    saveAndUpdate();
    closeModal();
  };

  // Marcar como Sorteado Manualmente
  markAsDrawnBtn.onclick = () => {
    if (!currentEditingStudent) return;

    data.qtd_sorteios = (data.qtd_sorteios || 0) + 1;
    currentEditingStudent.sorteios_count = (currentEditingStudent.sorteios_count || 0) + 1;

    const now = new Date();
    const timestamp =
      now.toLocaleDateString("pt-BR") +
      " " +
      now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    if (!data.repetir_estudante) {
      currentEditingStudent.posicao = data.qtd_sorteios;
    }

    if (!currentEditingStudent.sorteios_datas) currentEditingStudent.sorteios_datas = [];
    currentEditingStudent.sorteios_datas.unshift(timestamp);

    saveAndUpdate();
    closeModal();
  };

  function saveAndUpdate() {
    localStorage.setItem("sorteioData", JSON.stringify(data));
    if (selectedGroupIndex !== -1) {
      renderStudentList(selectedGroupIndex);
      renderQuestionStatus(selectedGroupIndex);
    }
  }

  /**
   * Lógica para Salvar/Exportar JSON
   */
  const saveJsonBtn = document.getElementById("saveJsonBtn");
  saveJsonBtn.addEventListener("click", function () {
    if (!data) return;

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    const filename = (data.titulo || "sorteio").toLowerCase().replace(/\s+/g, "_") + ".json";

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});

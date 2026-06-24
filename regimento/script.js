// ============================================================
// Detects which page is loaded and runs the appropriate logic
// ============================================================
const isHomePage = document.getElementById("btn-action-main") !== null;
const isWizardPage = document.getElementById("view-question") !== null;

// ============================================================
// HOME PAGE LOGIC (index.html)
// ============================================================
if (isHomePage) {
  document.addEventListener("DOMContentLoaded", () => {
    loadHomeData();
    document.getElementById("btn-import").addEventListener("change", importFromMarkdown);
  });

  async function loadHomeData() {
    const loadingScreen = document.getElementById("loading-screen");
    const viewHome = document.getElementById("view-home");

    try {
      const response = await fetch("perguntas.json");
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data = await response.json();

      // Render header
      document.getElementById("main-title").textContent = data.titulo;
      if (data.descricao && data.descricao.trim() !== "") {
        document.getElementById("main-subtitle").textContent = data.descricao;
      }
      document.getElementById("outro-text").textContent = data.resultado_esperado;

      // Render orientation info cards
      const infoSection = document.getElementById("info-section");
      infoSection.innerHTML = `
        <div class="info-card deve">
          <h3>
            <span class="material-symbols-outlined" style="vertical-align: middle;">check_circle</span>
            O que o Regimento Escolar DEVE abordar
          </h3>
          <ul>
            ${data.deve_abordar.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div class="info-card nao-deve">
          <h3>
            <span class="material-symbols-outlined" style="vertical-align: middle;">cancel</span>
            O que o Regimento Escolar NÃO DEVE abordar
          </h3>
          <ul>
            ${data.nao_deve_abordar.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `;

      // Update the dynamic action button
      updateActionButton();

      loadingScreen.style.display = "none";
      viewHome.style.display = "block";

      if (window.lucide) window.lucide.createIcons();
    } catch (error) {
      console.error("Falha ao carregar perguntas:", error);
      showHomeError(error);
    }
  }

  function hasProgress() {
    for (let key in localStorage) {
      if (key.startsWith("regimento_choice_q_") || key.startsWith("regimento_free_q_")) {
        return true;
      }
    }
    return false;
  }

  function updateActionButton() {
    const btn = document.getElementById("btn-action-main");
    if (!btn) return;

    if (hasProgress()) {
      btn.innerHTML = `<i data-lucide="play-circle"></i> Continuar respondendo`;
      btn.onclick = () => { window.location.href = "perguntas.html"; };
    } else {
      btn.innerHTML = `<i data-lucide="play"></i> Iniciar Questionário`;
      btn.onclick = () => { window.location.href = "perguntas.html?fresh=true"; };
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Import answers from uploaded resposta.md file
  function importFromMarkdown(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      parseAndLoadMarkdown(text);
    };
    reader.readAsText(file);
  }

  function parseAndLoadMarkdown(markdownText) {
    const lines = markdownText.split(/\r?\n/);
    const parsedAnswers = {};

    let currentNum = null;
    let parsingState = null;
    let freeTextLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const questionMatch = line.match(/^###\s+(\d+)\.\s+(.*)/);

      if (questionMatch) {
        if (currentNum !== null) {
          parsedAnswers[currentNum].freeText = freeTextLines.join("\n").trim();
        }
        currentNum = parseInt(questionMatch[1], 10);
        parsedAnswers[currentNum] = { choice: "", freeText: "" };
        freeTextLines = [];
        parsingState = null;
      } else if (currentNum !== null) {
        if (line.startsWith("## ") || line.startsWith("# ")) {
          parsedAnswers[currentNum].freeText = freeTextLines.join("\n").trim();
          currentNum = null;
          parsingState = null;
        } else {
          const choiceMatch = line.match(/^\*\*Decisão adotada:\*\*\s*(.*)/);
          const freeTextMatch = line.match(/^\*\*Justificativa\/Detalhamento:\*\*\s*(.*)/);

          if (choiceMatch) {
            parsedAnswers[currentNum].choice = choiceMatch[1].trim();
            parsingState = null;
          } else if (freeTextMatch) {
            freeTextLines.push(freeTextMatch[1]);
            parsingState = "freeText";
          } else if (parsingState === "freeText") {
            freeTextLines.push(line);
          }
        }
      }
    }

    if (currentNum !== null) {
      parsedAnswers[currentNum].freeText = freeTextLines.join("\n").trim();
    }

    // Clear all previous answers first
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("regimento_")) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Load parsed answers into localStorage
    let loadedCount = 0;
    Object.entries(parsedAnswers).forEach(([num, parsed]) => {
      const n = parseInt(num, 10);
      if (parsed.choice && parsed.choice !== "*(Não respondida)*" && parsed.choice !== "") {
        localStorage.setItem(`regimento_choice_q_${n}`, parsed.choice);
        loadedCount++;
      }
      if (parsed.freeText && parsed.freeText !== "*(Não respondida)*" && parsed.freeText !== "") {
        localStorage.setItem(`regimento_free_q_${n}`, parsed.freeText);
        loadedCount++;
      }
    });

    // Reset file input
    document.getElementById("btn-import").value = "";

    // Update button and show status
    updateActionButton();

    const statusEl = document.getElementById("import-status");
    if (statusEl) {
      statusEl.style.display = "block";
      if (loadedCount > 0) {
        statusEl.textContent = `✓ Respostas carregadas com sucesso! Clique em "Continuar respondendo" para prosseguir.`;
        statusEl.className = "import-status success";
        showToast("Respostas carregadas com sucesso!", "success", "upload-cloud");
      } else {
        statusEl.textContent = "Nenhuma resposta válida encontrada no arquivo.";
        statusEl.className = "import-status error";
        showToast("Nenhuma resposta válida encontrada.", "error", "alert-circle");
      }
    }
  }

  function showHomeError(error) {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div style="text-align: left; max-width: 600px; padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 1.25rem;">
          <h3 style="color: #f87171; font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined">warning</span>
            Erro de Carregamento (CORS)
          </h3>
          <p style="margin-bottom: 1rem; color: #fca5a5;">
            Não foi possível carregar as perguntas do arquivo <code>perguntas.json</code>.
          </p>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 0.75rem; font-size: 0.9rem;">
            <strong style="color: #fff; display: block; margin-bottom: 0.5rem;">Como resolver:</strong>
            Execute no PowerShell na pasta do projeto:<br>
            <code style="background: #27272a; padding: 0.1rem 0.4rem; border-radius: 4px; display: inline-block; margin: 0.25rem 0;">python -m http.server 8000</code><br>
            e acesse <a href="http://localhost:8000" style="color: #818cf8; text-decoration: underline;">http://localhost:8000</a>.
          </div>
        </div>
      `;
    }
  }
}

// ============================================================
// WIZARD PAGE LOGIC (perguntas.html)
// ============================================================
if (isWizardPage) {
  let questionsData = null;
  let flatQuestions = [];
  let currentQuestionIndex = 0;

  document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();

    document.getElementById("btn-export").addEventListener("click", exportToMarkdown);
    document.getElementById("btn-clear").addEventListener("click", clearAllAnswers);
    document.getElementById("btn-clear-current").addEventListener("click", clearCurrentAnswer);

    // Navbar map toggle — opens/closes the dropdown panel
    const btnToggleMap = document.getElementById("btn-toggle-map");
    const mapPanel = document.getElementById("navbar-map-panel");
    if (btnToggleMap && mapPanel) {
      btnToggleMap.addEventListener("click", () => {
        const isOpen = mapPanel.classList.toggle("open");
        btnToggleMap.classList.toggle("active", isOpen);
      });
      // Close map panel when clicking outside
      document.addEventListener("click", (e) => {
        if (!btnToggleMap.contains(e.target) && !mapPanel.contains(e.target)) {
          mapPanel.classList.remove("open");
          btnToggleMap.classList.remove("active");
        }
      });
    }
  });

  async function loadQuestions() {
    const loadingScreen = document.getElementById("loading-screen");
    const viewQuestion = document.getElementById("view-question");

    try {
      const response = await fetch("perguntas.json");
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      questionsData = await response.json();
      flattenQuestions(questionsData);
      buildNavigationGrid();
      setupWizardEvents();

      loadingScreen.style.display = "none";

      // Check if starting fresh (?fresh=true) or resuming
      const params = new URLSearchParams(window.location.search);
      if (params.get("fresh") === "true") {
        currentQuestionIndex = 0;
        localStorage.removeItem("regimento_current_idx");
      } else {
        const savedIdx = localStorage.getItem("regimento_current_idx");
        if (savedIdx !== null) {
          currentQuestionIndex = parseInt(savedIdx, 10);
        } else {
          // Find first unanswered
          currentQuestionIndex = 0;
          for (let i = 0; i < flatQuestions.length; i++) {
            const q = flatQuestions[i];
            const choice = localStorage.getItem(`regimento_choice_q_${q.num}`);
            const freeText = localStorage.getItem(`regimento_free_q_${q.num}`);
            if (!choice && !freeText) {
              currentQuestionIndex = i;
              break;
            }
          }
        }
      }

      viewQuestion.style.display = "block";
      goToQuestion(currentQuestionIndex);
      updateProgress();

      if (window.lucide) window.lucide.createIcons();
    } catch (error) {
      console.error("Falha ao carregar perguntas:", error);
      showWizardError(error);
    }
  }

  function flattenQuestions(data) {
    flatQuestions = [];
    data.blocos.forEach(bloco => {
      bloco.perguntas.forEach((q, idx) => {
        flatQuestions.push({
          num: q.num,
          texto: q.texto,
          opcoes: q.opcoes,
          blocoId: bloco.id,
          blocoTitulo: bloco.titulo,
          indexInBloco: idx,
          totalInBloco: bloco.perguntas.length
        });
      });
    });
  }

  function buildNavigationGrid() {
    const questionGrid = document.getElementById("question-grid");
    questionGrid.innerHTML = "";

    flatQuestions.forEach((q, index) => {
      const gridDot = document.createElement("button");
      gridDot.className = "grid-dot unanswered";
      gridDot.id = `grid-dot-${index}`;
      gridDot.textContent = q.num;
      gridDot.title = `${q.num}. ${q.texto}`;
      gridDot.addEventListener("click", () => {
        goToQuestion(index);
        // Fecha o painel dropdown do mapa ao navegar para uma questão
        const mapPanel = document.getElementById("navbar-map-panel");
        const btnToggleMap = document.getElementById("btn-toggle-map");
        if (mapPanel) mapPanel.classList.remove("open");
        if (btnToggleMap) btnToggleMap.classList.remove("active");
      });
      questionGrid.appendChild(gridDot);
    });
  }

  function setupWizardEvents() {
    document.getElementById("btn-nav-prev").addEventListener("click", prevQuestion);
    document.getElementById("btn-nav-next").addEventListener("click", nextQuestion);
    document.getElementById("btn-nav-home").addEventListener("click", () => {
      window.location.href = "index.html";
    });

    const textarea = document.getElementById("wizard-textarea");
    textarea.addEventListener("input", (e) => saveTextareaAnswer(e.target.value));
    textarea.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        nextQuestion();
      }
    });
  }

  function goToQuestion(index) {
    if (index < 0 || index >= flatQuestions.length) return;

    currentQuestionIndex = index;
    localStorage.setItem("regimento_current_idx", currentQuestionIndex);

    const q = flatQuestions[currentQuestionIndex];

    document.getElementById("wizard-block-title").textContent = q.blocoTitulo;
    document.getElementById("wizard-block-progress").textContent =
      `Pergunta ${q.indexInBloco + 1} de ${q.totalInBloco}`;
    document.getElementById("wizard-question-text").textContent = `${q.num}. ${q.texto}`;

    const savedChoice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
    const savedFreeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";

    // Render options
    const optionsContainer = document.getElementById("wizard-options-container");
    optionsContainer.innerHTML = "";

    const allOptions = [
      ...(q.opcoes || []),
      "O tema não deve ser abordado no Regimento Escolar",
      "Outra decisão (Descreva no campo abaixo)"
    ];

    allOptions.forEach((optionText) => {
      const isSelected = savedChoice === optionText;
      const label = document.createElement("label");
      label.className = `option-card ${isSelected ? "selected" : ""}`;
      label.innerHTML = `
        <input type="radio" name="wizard-choice-group" value="${optionText}" ${isSelected ? "checked" : ""} />
        <span class="option-indicator"></span>
        <span class="option-text">${optionText}</span>
      `;
      label.addEventListener("click", () => {
        optionsContainer.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
        label.classList.add("selected");
        label.querySelector("input").checked = true;
        saveChoiceAnswer(optionText);
      });
      optionsContainer.appendChild(label);
    });

    // Restore textarea
    const textarea = document.getElementById("wizard-textarea");
    textarea.value = savedFreeText;
    updateTextareaPlaceholder(savedChoice);
    updateQuestionStatusUI();

    // Navigation buttons state
    document.getElementById("btn-nav-prev").disabled = (currentQuestionIndex === 0);
    const btnNext = document.getElementById("btn-nav-next");
    if (currentQuestionIndex === flatQuestions.length - 1) {
      btnNext.innerHTML = `Concluir <i data-lucide="check"></i>`;
    } else {
      btnNext.innerHTML = `Próximo <i data-lucide="arrow-right"></i>`;
    }

    if (window.lucide) window.lucide.createIcons();

    // Update grid dots
    document.querySelectorAll(".grid-dot").forEach((dot, idx) => {
      dot.classList.toggle("current", idx === currentQuestionIndex);
    });

    if (savedChoice.includes("Outra decisão")) textarea.focus();

    document.querySelector(".question-wizard-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function updateTextareaPlaceholder(choiceText) {
    const textarea = document.getElementById("wizard-textarea");
    const textareaTitle = document.getElementById("wizard-textarea-title");

    if (choiceText.includes("Outra decisão")) {
      textarea.placeholder = "Descreva detalhadamente sua decisão personalizada para esta questão...";
      textareaTitle.textContent = "Descreva sua decisão personalizada (Obrigatório):";
    } else if (choiceText !== "") {
      textarea.placeholder = "Digite uma justificativa ou observação complementar... (Opcional)";
      textareaTitle.textContent = "Justificativa ou Observações (Opcional):";
    } else {
      textarea.placeholder = "Digite sua resposta livre ou detalhamento aqui...";
      textareaTitle.textContent = "Justificativa ou Resposta Livre:";
    }
  }

  function saveChoiceAnswer(choiceValue) {
    const q = flatQuestions[currentQuestionIndex];
    localStorage.setItem(`regimento_choice_q_${q.num}`, choiceValue);
    updateTextareaPlaceholder(choiceValue);
    updateQuestionStatusUI();
    updateProgress();
  }

  function saveTextareaAnswer(textValue) {
    const q = flatQuestions[currentQuestionIndex];
    const trimmed = textValue.trim();
    if (trimmed !== "") {
      localStorage.setItem(`regimento_free_q_${q.num}`, trimmed);
    } else {
      localStorage.removeItem(`regimento_free_q_${q.num}`);
    }
    updateQuestionStatusUI();
    updateProgress();
  }

  function updateQuestionStatusUI() {
    const q = flatQuestions[currentQuestionIndex];
    const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
    const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";
    const isAnswered = choice !== "" || freeText.trim() !== "";

    const indicator = document.getElementById("wizard-status-indicator");
    indicator.classList.toggle("filled", isAnswered);
    indicator.querySelector(".status-label").textContent = isAnswered ? "Respondida" : "Não respondida";

    const dot = document.getElementById(`grid-dot-${currentQuestionIndex}`);
    if (dot) {
      dot.classList.toggle("answered", isAnswered);
      dot.classList.toggle("unanswered", !isAnswered);
    }
  }

  function nextQuestion() {
    saveTextareaAnswer(document.getElementById("wizard-textarea").value);
    if (currentQuestionIndex === flatQuestions.length - 1) {
      window.location.href = "index.html";
      showToast("Parabéns! Questionário concluído!", "success", "award");
    } else {
      goToQuestion(currentQuestionIndex + 1);
    }
  }

  function prevQuestion() {
    saveTextareaAnswer(document.getElementById("wizard-textarea").value);
    if (currentQuestionIndex > 0) goToQuestion(currentQuestionIndex - 1);
  }

  function updateProgress() {
    if (!questionsData) return;

    let totalFilledCount = 0;
    const total = flatQuestions.length;

    flatQuestions.forEach((q, index) => {
      const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
      const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";
      const isAnswered = choice !== "" || freeText.trim() !== "";
      if (isAnswered) totalFilledCount++;

      const dot = document.getElementById(`grid-dot-${index}`);
      if (dot && index !== currentQuestionIndex) {
        dot.classList.toggle("answered", isAnswered);
        dot.classList.toggle("unanswered", !isAnswered);
      }
    });

    const percent = total > 0 ? Math.round((totalFilledCount / total) * 100) : 0;
    const progText = document.getElementById("progress-text");
    const progCount = document.getElementById("progress-count");
    const progFill = document.getElementById("progress-bar-fill");
    if (progText) progText.textContent = `${percent}%`;
    if (progCount) progCount.textContent = `${totalFilledCount}/${total}`;
    if (progFill) progFill.style.width = `${percent}%`;
  }

  async function clearAllAnswers() {
    const confirmed = await customConfirm(
      "Limpar todas as respostas",
      "Tem certeza que deseja limpar todas as respostas salvas? Esta ação apagará todo o progresso e não poderá ser desfeita."
    );
    if (!confirmed) return;

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("regimento_")) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    const textarea = document.getElementById("wizard-textarea");
    if (textarea) textarea.value = "";
    const optionsContainer = document.getElementById("wizard-options-container");
    if (optionsContainer) optionsContainer.innerHTML = "";

    updateProgress();
    goToQuestion(0);
    showToast("Todas as respostas foram limpas!", "success", "trash-2");
  }

  async function clearCurrentAnswer() {
    if (!questionsData) return;
    const q = flatQuestions[currentQuestionIndex];
    const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
    const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";
    if (choice === "" && freeText.trim() === "") return;

    const confirmed = await customConfirm(
      "Limpar resposta da pergunta",
      `Tem certeza que deseja limpar a resposta da pergunta ${q.num}?`
    );
    if (!confirmed) return;

    localStorage.removeItem(`regimento_choice_q_${q.num}`);
    localStorage.removeItem(`regimento_free_q_${q.num}`);
    goToQuestion(currentQuestionIndex);
    updateProgress();
    showToast(`Resposta da pergunta ${q.num} limpa!`, "success", "trash");
  }

  function exportToMarkdown() {
    if (!questionsData) return;

    let mdContent = `# Respostas da Matriz de Decisões para Construção do Regimento Escolar do CEMEP\n\n`;
    mdContent += `> Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}\n\n`;
    mdContent += `## SOBRE ESTE DOCUMENTO\n\n`;
    mdContent += `*Este documento serve como instrumento de tomada de decisões da Comissão de Revisão do Regimento Escolar do CEMEP.*\n\n`;

    questionsData.blocos.forEach(bloco => {
      mdContent += `## ${bloco.titulo}\n\n`;
      bloco.perguntas.forEach(q => {
        const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
        const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";

        mdContent += `### ${q.num}. ${q.texto}\n`;
        if (choice !== "" || freeText.trim() !== "") {
          if (choice !== "") mdContent += `**Decisão adotada:** ${choice}\n`;
          if (freeText.trim() !== "") mdContent += `**Justificativa/Detalhamento:** ${freeText.trim()}\n`;
          mdContent += `\n`;
        } else {
          mdContent += `*(Não respondida)*\n\n`;
        }
      });
    });

    mdContent += `## RESULTADO ESPERADO\n\n${questionsData.resultado_esperado}\n`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "resposta.md");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Arquivo resposta.md gerado e baixado!", "success", "download");
  }

  function showWizardError(error) {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div style="text-align: left; max-width: 600px; padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 1.25rem;">
          <h3 style="color: #f87171; font-family: 'Outfit', sans-serif;">⚠ Erro ao carregar</h3>
          <p style="color: #fca5a5;">Não foi possível carregar as perguntas. Certifique-se de acessar via servidor HTTP.</p>
          <a href="index.html" style="color: #818cf8; text-decoration: underline;">← Voltar ao início</a>
        </div>
      `;
    }
  }
}

// ============================================================
// SHARED UTILITIES (available on both pages)
// ============================================================

// Custom Promise-based Confirmation Modal
function customConfirm(title, message, isDanger = true) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-modal");
    if (!modal) { resolve(window.confirm(message)); return; }

    const titleEl = document.getElementById("modal-title");
    const messageEl = document.getElementById("modal-message");
    const btnConfirm = document.getElementById("modal-btn-confirm");
    const btnCancel = document.getElementById("modal-btn-cancel");
    const iconEl = document.getElementById("modal-icon");

    titleEl.textContent = title;
    messageEl.textContent = message;

    if (isDanger) {
      btnConfirm.className = "btn btn-danger";
      iconEl.className = "modal-icon danger";
      iconEl.setAttribute("data-lucide", "alert-triangle");
    } else {
      btnConfirm.className = "btn btn-primary";
      iconEl.className = "modal-icon warning";
      iconEl.setAttribute("data-lucide", "help-circle");
    }
    if (window.lucide) window.lucide.createIcons();

    modal.style.display = "flex";

    function handleConfirm() { cleanup(); resolve(true); }
    function handleCancel() { cleanup(); resolve(false); }
    function cleanup() {
      modal.style.display = "none";
      btnConfirm.removeEventListener("click", handleConfirm);
      btnCancel.removeEventListener("click", handleCancel);
    }

    btnConfirm.addEventListener("click", handleConfirm);
    btnCancel.addEventListener("click", handleCancel);
  });
}

// Toast notification helper
function showToast(message, type = "success", iconName = "check") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.className = `notification-toast show ${type}`;

  if (toastIcon) {
    toastIcon.setAttribute("data-lucide", iconName);
    if (window.lucide) {
      window.lucide.createIcons({ attrs: { style: "width: 20px; height: 20px;" } });
    }
  }

  setTimeout(() => toast.classList.remove("show"), 4000);
}

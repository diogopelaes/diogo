let questionsData = null;
let flatQuestions = [];
let currentQuestionIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();

  // Setup Event Listeners for top control panel
  document.getElementById("btn-export").addEventListener("click", exportToMarkdown);
  document.getElementById("btn-import").addEventListener("change", importFromMarkdown);
  document.getElementById("btn-clear").addEventListener("click", clearAnswers);
  
  // Setup toggle for the question map
  const btnToggleMap = document.getElementById("btn-toggle-map");
  const mapSection = btnToggleMap.closest(".navigation-map-section");
  btnToggleMap.addEventListener("click", () => {
    mapSection.classList.toggle("active");
  });
});

// Load questions from JSON
async function loadQuestions() {
  const loadingScreen = document.getElementById("loading-screen");
  const viewHome = document.getElementById("view-home");

  try {
    const response = await fetch("perguntas.json");
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    questionsData = await response.json();
    flattenQuestions(questionsData);
    renderQuestionnaire(questionsData);
    
    // Hide loading, show home view
    loadingScreen.style.display = "none";
    showHome();
    
    // Initialize icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch (error) {
    console.error("Falha ao carregar perguntas:", error);
    showCersError(error);
  }
}

// Flatten questions for easy linear navigation
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

// Render dynamic content from JSON
function renderQuestionnaire(data) {
  // Update Header
  document.getElementById("main-title").textContent = data.titulo;
  document.getElementById("main-subtitle").textContent = data.descricao;
  document.getElementById("outro-text").textContent = data.resultado_esperado;

  // Render Info section on home view
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

  // Render direct navigation map (181 grid dots)
  const questionGrid = document.getElementById("question-grid");
  questionGrid.innerHTML = ""; // Clear existing

  flatQuestions.forEach((q, index) => {
    const gridDot = document.createElement("button");
    gridDot.className = "grid-dot unanswered";
    gridDot.id = `grid-dot-${index}`;
    gridDot.textContent = q.num;
    gridDot.title = `${q.num}. ${q.texto}`;
    
    gridDot.addEventListener("click", () => {
      goToQuestion(index);
    });

    questionGrid.appendChild(gridDot);
  });

  // Setup home view button actions
  document.getElementById("btn-start-fresh").addEventListener("click", () => {
    startQuestionnaire(false);
  });
  document.getElementById("btn-resume").addEventListener("click", () => {
    startQuestionnaire(true);
  });

  // Setup wizard view navigation actions
  document.getElementById("btn-nav-prev").addEventListener("click", prevQuestion);
  document.getElementById("btn-nav-next").addEventListener("click", nextQuestion);
  document.getElementById("btn-nav-home").addEventListener("click", showHome);

  // Setup wizard text input events
  const textarea = document.getElementById("wizard-textarea");
  textarea.addEventListener("input", (e) => {
    saveTextareaAnswer(e.target.value);
  });

  // Key shortcut Ctrl + Enter to go next
  textarea.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      nextQuestion();
    }
  });

  updateProgress();
}

// Show Home Screen
function showHome() {
  document.getElementById("view-question").style.display = "none";
  document.getElementById("view-home").style.display = "block";

  // Toggle resume button based on progress (any choice or free text saved)
  let hasProgress = false;
  for (let key in localStorage) {
    if (key.startsWith("regimento_choice_q_") || key.startsWith("regimento_free_q_")) {
      hasProgress = true;
      break;
    }
  }

  const btnResume = document.getElementById("btn-resume");
  if (btnResume) {
    btnResume.style.display = hasProgress ? "inline-flex" : "none";
  }
  
  // Reset window scroll
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Start questionnaire wizard
function startQuestionnaire(resume = false) {
  document.getElementById("view-home").style.display = "none";
  document.getElementById("view-question").style.display = "block";

  if (resume) {
    // Resume from saved index, or first unanswered question
    const savedIdx = localStorage.getItem("regimento_current_idx");
    if (savedIdx !== null) {
      currentQuestionIndex = parseInt(savedIdx, 10);
    } else {
      // Find first unanswered index
      let firstUnanswered = 0;
      for (let i = 0; i < flatQuestions.length; i++) {
        const num = flatQuestions[i].num;
        const choice = localStorage.getItem(`regimento_choice_q_${num}`);
        const freeText = localStorage.getItem(`regimento_free_q_${num}`);
        
        const answered = (choice && choice.trim() !== "") || (freeText && freeText.trim() !== "");
        if (!answered) {
          firstUnanswered = i;
          break;
        }
      }
      currentQuestionIndex = firstUnanswered;
    }
  } else {
    // Start fresh from question 1 (index 0)
    currentQuestionIndex = 0;
  }

  goToQuestion(currentQuestionIndex);
}

// Navigate to specific question index
function goToQuestion(index) {
  if (index < 0 || index >= flatQuestions.length) return;
  
  currentQuestionIndex = index;
  localStorage.setItem("regimento_current_idx", currentQuestionIndex);

  const q = flatQuestions[currentQuestionIndex];
  
  // Set question details
  document.getElementById("wizard-block-title").textContent = q.blocoTitulo;
  document.getElementById("wizard-block-progress").textContent = `Pergunta ${q.indexInBloco + 1} de ${q.totalInBloco}`;
  document.getElementById("wizard-question-text").textContent = `${q.num}. ${q.texto}`;

  // Retrieve saved values
  const savedChoice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
  const savedFreeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";

  // Render options container
  const optionsContainer = document.getElementById("wizard-options-container");
  optionsContainer.innerHTML = ""; // Clear existing

  // Combine standard options + default bypass option + custom "Other" option
  const allOptions = [
    ...(q.opcoes || []), 
    "O tema não deve ser abordado no Regimento Escolar", 
    "Outra decisão (Descreva no campo abaixo)"
  ];

  allOptions.forEach((optionText, optIdx) => {
    const isSelected = savedChoice === optionText;

    const label = document.createElement("label");
    label.className = `option-card ${isSelected ? "selected" : ""}`;
    label.innerHTML = `
      <input 
        type="radio" 
        name="wizard-choice-group" 
        value="${optionText}" 
        ${isSelected ? "checked" : ""}
      />
      <span class="option-indicator"></span>
      <span class="option-text">${optionText}</span>
    `;

    // Click handler for custom radio behavior
    label.addEventListener("click", () => {
      // Unselect previous
      optionsContainer.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
      // Select current
      label.classList.add("selected");
      const input = label.querySelector("input");
      input.checked = true;

      // Save choice
      saveChoiceAnswer(optionText);
    });

    optionsContainer.appendChild(label);
  });

  // Set and update textarea
  const textarea = document.getElementById("wizard-textarea");
  textarea.value = savedFreeText;

  // Set appropriate placeholder based on current choice selection
  updateTextareaPlaceholder(savedChoice);

  // Update question status indicator
  updateQuestionStatusUI();

  // Set navigation buttons state
  document.getElementById("btn-nav-prev").disabled = (currentQuestionIndex === 0);
  
  const btnNext = document.getElementById("btn-nav-next");
  if (currentQuestionIndex === flatQuestions.length - 1) {
    btnNext.innerHTML = `Concluir <i data-lucide="check"></i>`;
  } else {
    btnNext.innerHTML = `Próximo <i data-lucide="arrow-right"></i>`;
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Update navigation dots highlighting
  document.querySelectorAll(".grid-dot").forEach((dot, idx) => {
    if (idx === currentQuestionIndex) {
      dot.classList.add("current");
    } else {
      dot.classList.remove("current");
    }
  });

  // Focus textarea if "Other" is chosen, else focus the options or keep it ready
  if (savedChoice.includes("Outra decisão")) {
    textarea.focus();
  }

  // Scroll wizard container into view if needed
  document.querySelector(".question-wizard-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Adjust textarea placeholder contextually
function updateTextareaPlaceholder(choiceText) {
  const textarea = document.getElementById("wizard-textarea");
  const textareaTitle = document.getElementById("wizard-textarea-title");
  
  if (choiceText.includes("Outra decisão")) {
    textarea.placeholder = "Descreva detalhadamente sua decisão personalizada para esta questão...";
    textareaTitle.textContent = "Descreva sua decisão personalizada (Obrigatório):";
  } else if (choiceText !== "") {
    textarea.placeholder = "Digite uma justificativa ou observação complementar para a opção escolhida... (Opcional)";
    textareaTitle.textContent = "Justificativa ou Observações (Opcional):";
  } else {
    textarea.placeholder = "Digite sua resposta livre ou detalhamento aqui...";
    textareaTitle.textContent = "Justificativa ou Resposta Livre:";
  }
}

// Save choice option selection
function saveChoiceAnswer(choiceValue) {
  const q = flatQuestions[currentQuestionIndex];
  localStorage.setItem(`regimento_choice_q_${q.num}`, choiceValue);

  updateTextareaPlaceholder(choiceValue);
  updateQuestionStatusUI();
  updateProgress();
}

// Save text responses
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

// Update local question indicator (Respondida / Não respondida)
function updateQuestionStatusUI() {
  const q = flatQuestions[currentQuestionIndex];
  const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
  const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";

  const isAnswered = (choice !== "") || (freeText.trim() !== "");

  const indicator = document.getElementById("wizard-status-indicator");
  const label = indicator.querySelector(".status-label");
  const dot = document.getElementById(`grid-dot-${currentQuestionIndex}`);

  if (isAnswered) {
    indicator.classList.add("filled");
    label.textContent = "Respondida";
    if (dot) {
      dot.classList.remove("unanswered");
      dot.classList.add("answered");
    }
  } else {
    indicator.classList.remove("filled");
    label.textContent = "Não respondida";
    if (dot) {
      dot.classList.remove("answered");
      dot.classList.add("unanswered");
    }
  }
}

// Navigate next
function nextQuestion() {
  // Save current text area content
  const textVal = document.getElementById("wizard-textarea").value;
  saveTextareaAnswer(textVal);

  if (currentQuestionIndex === flatQuestions.length - 1) {
    // Last question completed! Return home and show toast
    showHome();
    showToast("Parabéns! Você chegou ao final da Matriz de Decisões.", "success", "award");
  } else {
    goToQuestion(currentQuestionIndex + 1);
  }
}

// Navigate previous
function prevQuestion() {
  const textVal = document.getElementById("wizard-textarea").value;
  saveTextareaAnswer(textVal);

  if (currentQuestionIndex > 0) {
    goToQuestion(currentQuestionIndex - 1);
  }
}

// Update badges and progress indicators
function updateProgress() {
  if (!questionsData) return;

  let totalQuestionsCount = flatQuestions.length;
  let totalFilledCount = 0;

  flatQuestions.forEach((q, index) => {
    const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
    const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";
    
    const isAnswered = (choice !== "") || (freeText.trim() !== "");
    const dot = document.getElementById(`grid-dot-${index}`);
    
    if (isAnswered) {
      totalFilledCount++;
      if (dot) {
        dot.classList.add("answered");
        dot.classList.remove("unanswered");
      }
    } else {
      if (dot) {
        dot.classList.add("unanswered");
        dot.classList.remove("answered");
      }
    }
  });

  // Update global progress UI
  const percent = totalQuestionsCount > 0 ? Math.round((totalFilledCount / totalQuestionsCount) * 100) : 0;
  
  const progText = document.getElementById("progress-text");
  const progFill = document.getElementById("progress-bar-fill");
  
  if (progText) {
    progText.textContent = `Progresso Geral: ${percent}% (${totalFilledCount}/${totalQuestionsCount} respondidas)`;
  }
  if (progFill) {
    progFill.style.width = `${percent}%`;
  }
}

// Clear all answers with confirmation
function clearAnswers() {
  const confirmClear = confirm(
    "Tem certeza que deseja limpar todas as respostas salvas? Esta ação apagará o progresso do LocalStorage e não poderá ser desfeita."
  );

  if (confirmClear) {
    // Clear all keys starting with regimento_
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("regimento_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear UI textareas
    const textarea = document.getElementById("wizard-textarea");
    if (textarea) {
      textarea.value = "";
    }

    // Clear active options container selection
    const optionsContainer = document.getElementById("wizard-options-container");
    if (optionsContainer) {
      optionsContainer.innerHTML = "";
    }

    updateProgress();
    showHome();
    showToast("Respostas limpas com sucesso!", "success", "trash-2");
  }
}

// Export answers as resposta.md Markdown file
function exportToMarkdown() {
  if (!questionsData) return;

  let mdContent = `# Respostas da Matriz de Decisões para Construção do Regimento Escolar do CEMEP\n\n`;
  mdContent += `> Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}\n\n`;
  mdContent += `## SOBRE ESTE DOCUMENTO\n\n`;
  mdContent += `*Este documento serve como instrumento de tomada de decisões da Comissão de Revisão do Regimento Escolar do CEMEP. Cada resposta deve resultar diretamente em um ou mais artigos do futuro Regimento Escolar.*\n\n`;

  questionsData.blocos.forEach(bloco => {
    mdContent += `## ${bloco.titulo}\n\n`;
    
    bloco.perguntas.forEach(q => {
      const choice = localStorage.getItem(`regimento_choice_q_${q.num}`) || "";
      const freeText = localStorage.getItem(`regimento_free_q_${q.num}`) || "";
      
      mdContent += `### ${q.num}. ${q.texto}\n`;
      
      const hasChoice = choice !== "";
      const hasFreeText = freeText.trim() !== "";

      if (hasChoice || hasFreeText) {
        if (hasChoice) {
          mdContent += `**Decisão adotada:** ${choice}\n`;
        }
        if (hasFreeText) {
          mdContent += `**Justificativa/Detalhamento:** ${freeText.trim()}\n`;
        }
        mdContent += `\n`;
      } else {
        mdContent += `*(Não respondida)*\n\n`;
      }
    });
  });

  mdContent += `## RESULTADO ESPERADO\n\n`;
  mdContent += `${questionsData.resultado_esperado}\n`;

  // Create Blob and trigger download
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

// Parse markdown file and populate inputs & localStorage
function parseAndLoadMarkdown(markdownText) {
  if (!questionsData) return;

  const lines = markdownText.split(/\r?\n/);
  const parsedAnswers = {};
  
  let currentNum = null;
  let parsingState = null;
  let freeTextLines = [];

  // State machine to parse lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line matches a question header: "### [numero]. [texto]"
    const questionMatch = line.match(/^###\s+(\d+)\.\s+(.*)/);
    
    if (questionMatch) {
      // Save previous question
      if (currentNum !== null) {
        parsedAnswers[currentNum].freeText = freeTextLines.join("\n").trim();
      }
      
      currentNum = parseInt(questionMatch[1], 10);
      parsedAnswers[currentNum] = { choice: "", freeText: "" };
      freeTextLines = [];
      parsingState = null;
    } else if (currentNum !== null) {
      // Check if we hit the next block header or final header to close the current question
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

  // Save the last question processed if any
  if (currentNum !== null) {
    parsedAnswers[currentNum].freeText = freeTextLines.join("\n").trim();
  }

  // Fill in LocalStorage
  let loadedCount = 0;
  flatQuestions.forEach(q => {
    const parsed = parsedAnswers[q.num];
    if (parsed) {
      // Restore choice
      if (parsed.choice && parsed.choice !== "*(Não respondida)*" && parsed.choice !== "") {
        localStorage.setItem(`regimento_choice_q_${q.num}`, parsed.choice);
        loadedCount++;
      } else {
        localStorage.removeItem(`regimento_choice_q_${q.num}`);
      }
      
      // Restore free text
      if (parsed.freeText && parsed.freeText !== "*(Não respondida)*" && parsed.freeText !== "") {
        localStorage.setItem(`regimento_free_q_${q.num}`, parsed.freeText);
        loadedCount++;
      } else {
        localStorage.removeItem(`regimento_free_q_${q.num}`);
      }
    } else {
      localStorage.removeItem(`regimento_choice_q_${q.num}`);
      localStorage.removeItem(`regimento_free_q_${q.num}`);
    }
  });

  updateProgress();
  
  // Refresh current screen question if wizard is open
  if (document.getElementById("view-question").style.display === "block") {
    goToQuestion(currentQuestionIndex);
  } else {
    // If on home screen, refresh resume button visibility
    showHome();
  }
  
  // Reset file input value so same file can be uploaded again
  document.getElementById("btn-import").value = "";
  
  if (loadedCount > 0) {
    showToast(`Respostas carregadas com sucesso do arquivo!`, "success", "upload-cloud");
  } else {
    showToast("Nenhuma resposta válida encontrada no arquivo.", "error", "alert-circle");
  }
}

// Show CORS Error / Fallback UI
function showCersError(error) {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.innerHTML = `
      <div style="text-align: left; max-width: 600px; padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 1.25rem;">
        <h3 style="color: #f87171; font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span class="material-symbols-outlined">warning</span>
          Erro de Carregamento local (CORS)
        </h3>
        <p style="margin-bottom: 1rem; color: #fca5a5;">
          Não foi possível carregar as perguntas do arquivo <code>perguntas.json</code> devido a restrições de segurança do navegador.
        </p>
        <p style="margin-bottom: 1rem; font-size: 0.95rem; line-height: 1.5;">
          Se você abriu o arquivo <code>index.html</code> diretamente do explorador de arquivos (caminho começa com <code>file:///</code>), 
          os navegadores bloqueiam requisições assíncronas por segurança.
        </p>
        <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 0.75rem; font-size: 0.9rem;">
          <strong style="color: #fff; display: block; margin-bottom: 0.5rem;">Como resolver:</strong>
          1. Abra a pasta do projeto no VS Code e clique em <strong>Go Live</strong> (extensão Live Server).<br>
          2. Ou execute no PowerShell na raiz da pasta:<br>
          <code style="background: #27272a; padding: 0.1rem 0.4rem; border-radius: 4px; display: inline-block; margin: 0.25rem 0;">python -m http.server 8000</code><br>
          e acesse <a href="http://localhost:8000" style="color: var(--primary); text-decoration: underline;">http://localhost:8000</a>.
        </div>
      </div>
    `;
  }
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
      window.lucide.createIcons({
        attrs: {
          style: "width: 20px; height: 20px;"
        }
      });
    }
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

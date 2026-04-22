/**
 * sorteio.js - Lógica de Execução do Sorteio CEMEP
 */

document.addEventListener("DOMContentLoaded", function() {
  const list = document.getElementById("studentList");
  const count = document.getElementById("studentCount");
  const drawBtn = document.getElementById("drawBtn");
  const emptyState = document.getElementById("emptyState");
  const raffleResult = document.getElementById("raffleResult");
  const winnerName = document.getElementById("winnerName");
  const winnerTurma = document.getElementById("winnerTurma");
  
  // Modal Elements
  const modal = document.getElementById("studentModal");
  const modalName = document.getElementById("modalStudentName");
  const markAsDrawnBtn = document.getElementById("markAsDrawnBtn");
  const resetStudentBtn = document.getElementById("resetStudentBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  
  let currentEditingStudent = null;
  const rawData = localStorage.getItem("sorteioData");

  if (!rawData) {
    window.location.href = "index.html";
    return;
  }

  const data = JSON.parse(rawData);
  const groups = data.turmas;
  let selectedGroupIndex = -1;

  // Atualiza o Título da Página dinamicamente
  if (data.titulo) {
    document.getElementById("raffleHeaderTitle").textContent = data.titulo;
  }

  // Prepara opções para o Select
  const options = groups.map((group, index) => ({
    label: `Turma: ${group.turma}`,
    value: index
  }));

  /**
   * Renderiza a Lista de Estudantes na Sidebar
   * @param {number} groupIndex 
   */
  function renderStudentList(groupIndex) {
    const group = groups[groupIndex];
    list.innerHTML = "";
    
    let drawnCount = 0;
    group.estudantes.forEach(estudante => {
      if (estudante.sorteios_count > 0) drawnCount++;
      
      const item = document.createElement("div");
      const isDrawn = estudante.sorteios_count > 0;
      item.className = `student-item-sidebar ${isDrawn ? 'drawn' : ''}`;
      
      // Pega a data do sorteio mais recente (primeira da lista decrescente)
      const ultimaData = isDrawn && estudante.sorteios_datas && estudante.sorteios_datas.length > 0 
        ? estudante.sorteios_datas[0] 
        : null;
      
      item.innerHTML = `
        <iconify-icon icon="${isDrawn ? 'material-symbols:check-circle' : 'material-symbols:radio-button-unchecked'}" class="status-icon"></iconify-icon>
        <div class="flex flex-col">
          <span class="text-base font-semibold ${isDrawn ? 'text-green-400' : 'text-gray-200'}">${estudante.nome}</span>
          <div class="flex items-center gap-2">
            ${data.com_reposicao ? `
              <span class="text-[11px] text-gray-500 uppercase tracking-widest font-medium">
                Sorteado: ${estudante.sorteios_count}x
              </span>
            ` : ''}
            ${ultimaData ? `
              <span class="text-[11px] text-orange-500 font-bold">
                • ${ultimaData}
              </span>
            ` : ''}
          </div>
        </div>
      `;
      // Abrir modal ao clicar no card do estudante
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
    
    // Reset do visual central ao trocar de turma
    emptyState.classList.remove("hidden");
    raffleResult.classList.add("hidden");
  });

  /**
   * Lógica Principal do Sorteio
   */
  drawBtn.addEventListener("click", function() {
    if (selectedGroupIndex === -1) {
      alert("Selecione uma turma primeiro!");
      return;
    }

    const group = groups[selectedGroupIndex];
    
    // Filtra candidatos baseado no modo de reposição
    const candidates = data.com_reposicao 
      ? group.estudantes 
      : group.estudantes.filter(e => e.sorteios_count === 0);

    if (candidates.length === 0) {
      alert("Todos os alunos desta turma já foram sorteados!");
      return;
    }

    // Escolha aleatória (Algoritmo de sorteio)
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const winner = candidates[randomIndex];

    // Registra o sorteio com data, hora e posição global
    const now = new Date();
    const timestamp = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // 1. Incrementa a contagem global
    data.qtd_sorteios++;
    
    // 2. Atualiza a posição do estudante (Apenas no modo "Sem Reposição")
    if (data.com_reposicao === false) {
      winner.posicao = data.qtd_sorteios;
    }

    // 3. Registra os dados do sorteio no estudante
    winner.sorteios_count++;
    if (!winner.sorteios_datas) winner.sorteios_datas = [];
    
    // unshift adiciona no INÍCIO da lista (Garante ordem decrescente)
    winner.sorteios_datas.unshift(timestamp);

    // Salva o novo estado no localStorage
    localStorage.setItem("sorteioData", JSON.stringify(data));

    // Feedback Visual do Ganhador
    winnerName.textContent = winner.nome;
    winnerTurma.textContent = `Turma: ${group.turma}`;
    
    emptyState.classList.add("hidden");
    raffleResult.classList.remove("hidden");
    raffleResult.style.animation = "fadeIn 0.5s ease-out";

    // Re-renderiza lista lateral para atualizar ícones e contadores
    renderStudentList(selectedGroupIndex);
  });

  /**
   * Lógica do Modal
   */
  function openStudentModal(estudante) {
    currentEditingStudent = estudante;
    modalName.textContent = estudante.nome;
    modal.classList.add("active");

    // Ajusta visibilidade dos botões baseado no estado
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
  modal.onclick = (e) => { if(e.target === modal) closeModal(); };

  // Resetar Estudante
  resetStudentBtn.onclick = () => {
    if (!currentEditingStudent) return;
    
    currentEditingStudent.sorteios_count = 0;
    currentEditingStudent.sorteios_datas = [];
    currentEditingStudent.posicao = data.com_reposicao ? null : 0;
    
    saveAndUpdate();
    closeModal();
  };

  // Marcar como Sorteado Manualmente
  markAsDrawnBtn.onclick = () => {
    if (!currentEditingStudent) return;
    
    data.qtd_sorteios++;
    currentEditingStudent.sorteios_count++;
    
    const now = new Date();
    const timestamp = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if (data.com_reposicao === false) {
      currentEditingStudent.posicao = data.qtd_sorteios;
    }
    
    if (!currentEditingStudent.sorteios_datas) currentEditingStudent.sorteios_datas = [];
    currentEditingStudent.sorteios_datas.unshift(timestamp);
    
    saveAndUpdate();
    closeModal();
  };

  function saveAndUpdate() {
    localStorage.setItem("sorteioData", JSON.stringify(data));
    renderStudentList(selectedGroupIndex);
  }

  /**
   * Lógica para Salvar/Exportar JSON
   */
  const saveJsonBtn = document.getElementById("saveJsonBtn");
  saveJsonBtn.addEventListener("click", function() {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    const filename = (data.titulo || 'sorteio').toLowerCase().replace(/\s+/g, '_') + '.json';
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});

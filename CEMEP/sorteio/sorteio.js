/**
 * sorteio.js - Lógica de Execução do Sorteio CEMEP
 */

document.addEventListener("DOMContentLoaded", function() {
  const list = document.getElementById("studentList");
  const count = document.getElementById("studentCount");
  const drawBtn = document.getElementById("drawBtn");
  const emptyState = document.getElementById("emptyState");
  const raffleResult = document.getElementById("raffleResult");
  const slotStrip = document.getElementById("slotStrip");
  const raffleStatusText = document.getElementById("raffleStatusText");
  
  // Modal Elements
  const modal = document.getElementById("studentModal");
  const modalName = document.getElementById("modalStudentName");
  const markAsDrawnBtn = document.getElementById("markAsDrawnBtn");
  const resetStudentBtn = document.getElementById("resetStudentBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  
  // Slot Machine Engine
  const slotEngine = new SlotMachineEngine("slotViewport", "slotStrip");
  
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

    // Desabilita o botão durante a animação
    drawBtn.disabled = true;
    drawBtn.classList.add("opacity-50", "cursor-not-allowed");

    // Escolha o ganhador ANTES de começar a animação
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const winner = candidates[randomIndex];

    // Inicia a animação
    runRaffleAnimation(candidates, winner, group, () => {
      // 1. Incrementa a contagem global
      data.qtd_sorteios++;
      
      // 2. Atualiza a posição do estudante (Apenas no modo "Sem Reposição")
      if (data.com_reposicao === false) {
        winner.posicao = data.qtd_sorteios;
      }

      // 3. Registra os dados do sorteio no estudante
      winner.sorteios_count++;
      if (!winner.sorteios_datas) winner.sorteios_datas = [];
      
      const now = new Date();
      const timestamp = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      winner.sorteios_datas.unshift(timestamp);

      // Salva o novo estado no localStorage
      localStorage.setItem("sorteioData", JSON.stringify(data));

      // Re-renderiza lista lateral
      renderStudentList(selectedGroupIndex);

      // Reabilita o botão
      drawBtn.disabled = false;
      drawBtn.classList.remove("opacity-50", "cursor-not-allowed");
    });
  });

  /**
   * Função de Animação Slot Machine (Nova Versão)
   */
  function runRaffleAnimation(candidates, winner, group, onComplete) {
    emptyState.classList.add("hidden");
    raffleResult.classList.remove("hidden");
    
    // Anima o texto de status
    raffleStatusText.textContent = "Sorteando...";
    raffleStatusText.classList.remove("revealed");
    raffleStatusText.classList.add("searching");

    // Limpa destaque anterior
    const highlight = document.querySelector('.slot-highlight');
    if (highlight) highlight.classList.remove('active');

    slotEngine.spin(candidates, winner, () => {
      // Finaliza animação do texto de forma suave
      raffleStatusText.classList.remove("searching");
      
      // Pequeno timeout para resetar o estado visual antes do reveal
      raffleStatusText.style.opacity = "0";
      
      setTimeout(() => {
        raffleStatusText.textContent = "Escolhido!";
        raffleStatusText.classList.add("revealed");
        raffleStatusText.style.opacity = "";
      }, 50);

      // Efeito de Celebração (Confetes)
      triggerCelebration();

      onComplete();
    });
  }

  /**
   * Dispara um efeito de celebração aleatório e bem distinto
   */
  function triggerCelebration() {
    const effects = [
      // 1. Canhões Laterais (School Pride) - Contínuo
      () => {
        console.log("Celebration: School Pride");
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff6b00', '#ffffff'] });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff6b00', '#ffffff'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      },
      // 2. Fogos de Artifício (Fireworks) - Múltiplas explosões
      () => {
        console.log("Celebration: Fireworks");
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          confetti({
            particleCount: 40,
            startVelocity: 30,
            spread: 360,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ['#ff6b00', '#ff9d00', '#ffffff', '#000000']
          });
        }, 300);
      },
      // 3. Chuva de Estrelas - Muito brilho
      () => {
        console.log("Celebration: Stars");
        const defaults = { spread: 360, ticks: 100, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['#ff6b00', '#ffffff', '#ffeb3b'] };
        confetti({ ...defaults, particleCount: 80, scalar: 1.5, shapes: ['star'] });
        confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ['circle'] });
      },
      // 4. Explosão Central "Confetti Cannon" - Realista
      () => {
        console.log("Celebration: Realistic");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff6b00', '#ffffff', '#ff9d00'] });
      },
      // 5. Neve Laranja (Snow) - Caindo do topo
      () => {
        console.log("Celebration: Snow");
        const duration = 4 * 1000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 2, angle: -90, spread: 360, origin: { x: Math.random(), y: 0 }, colors: ['#ff6b00'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      }
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

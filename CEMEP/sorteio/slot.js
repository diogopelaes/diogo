/**
 * SlotMachine - Engine de Animação Premium para Sorteio
 */

class SlotMachine {
  constructor(containerId, stripId) {
    this.container = document.getElementById(containerId);
    this.strip = document.getElementById(stripId);
    this.itemHeight = 180; // Atualizado para nova altura
    this.isSpinning = false;
  }

  /**
   * Executa o sorteio com animação
   * @param {Array} candidates - Lista de todos os alunos possíveis
   * @param {Object} winner - O objeto do aluno sorteado
   * @param {Function} onComplete - Callback ao finalizar
   */
  async spin(candidates, winner, onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Configurações da animação
    const minSpins = 5; // Quantas vezes a lista completa vai rodar
    const duration = 5000; // 5 segundos de tensão
    
    // Prepara a lista para o "strip"
    // Vamos criar um strip longo o suficiente para a duração
    const stripNames = [];
    
    // Adiciona nomes aleatórios para preencher o começo e o meio
    // Precisamos de muitos itens para a animação de alta velocidade
    for (let i = 0; i < 60; i++) {
      const randomIdx = Math.floor(Math.random() * candidates.length);
      stripNames.push(candidates[randomIdx].nome);
    }

    // O ganhador deve estar no final, mas com alguns itens depois dele 
    // para garantir que a gente consiga fazer o efeito de "passar e voltar"
    // ou apenas para centralizar corretamente.
    // Na verdade, o strip vai parar exatamente no índice do ganhador.
    const winnerIndex = stripNames.length;
    stripNames.push(winner.nome);
    
    // Itens extras após o ganhador para preencher o visual
    for (let i = 0; i < 3; i++) {
        const randomIdx = Math.floor(Math.random() * candidates.length);
        stripNames.push(candidates[randomIdx].nome);
    }

    // Renderiza os itens no DOM com ajuste dinâmico de fonte
    this.strip.innerHTML = stripNames.map((name, idx) => {
      // Ajuste dinâmico mais generoso
      let fontSize = '4rem'; 
      if (name.length > 30) fontSize = '2rem';
      else if (name.length > 25) fontSize = '2.4rem';
      else if (name.length > 18) fontSize = '3rem';

      return `<div class="slot-item ${idx === winnerIndex ? 'winner-item' : ''}" style="font-size: ${fontSize}">${name}</div>`;
    }).join('');

    // Reset de posição e estados
    this.strip.style.transition = 'none';
    this.strip.style.transform = 'translateY(0)';
    this.strip.classList.remove('spinning', 'fast-spinning');
    
    // Força reflow
    this.strip.offsetHeight;

    // Fase 1: Início da rotação (Aceleração)
    this.strip.classList.add('fast-spinning');
    
    // Cálculo do alvo
    // Queremos que o ganhador fique centralizado.
    // O container tem 160px, o item tem 160px. 
    // Então o transform deve ser -(index * itemHeight)
    const targetY = -(winnerIndex * this.itemHeight);

    // Aplicar a transição com curva "Back Out" para o efeito vai-e-volta
    // cubic-bezier(0.175, 0.885, 0.32, 1.275) -> Back Out
    // Isso faz com que ele passe um pouco do alvo e volte.
    this.strip.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0, 0.15, 1.15)`;
    this.strip.style.transform = `translateY(${targetY}px)`;

    // Gerenciar o blur dinamicamente (opcional, mas legal)
    setTimeout(() => {
        this.strip.classList.remove('fast-spinning');
        this.strip.classList.add('spinning');
    }, duration * 0.6);

    setTimeout(() => {
        this.strip.classList.remove('spinning');
    }, duration * 0.9);

    // Finalização
    setTimeout(() => {
        const winnerElement = this.strip.querySelector('.winner-item');
        if (winnerElement) {
            winnerElement.classList.add('winner-active');
            
            // Ativa o brilho de fundo
            const highlight = this.container.querySelector('.slot-highlight');
            if (highlight) highlight.classList.add('active');
        }
        
        this.isSpinning = false;
        if (onComplete) onComplete();
    }, duration + 200);
  }
}

// Expõe globalmente
window.SlotMachineEngine = SlotMachine;

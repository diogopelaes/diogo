/**
 * style.js - Componentes de Estilização Customizada para o Sorteio CEMEP
 */

const CustomUI = {
  /**
   * Transforma um container em um Select Customizado e Premium
   * @param {string} id - ID do elemento container
   * @param {Array} options - Lista de { label, value }
   * @param {Function} callback - Função chamada ao selecionar
   */
  initSelect(id, options, callback) {
    const container = document.getElementById(id);
    if (!container) return;

    // Limpa o container
    container.innerHTML = "";
    container.classList.add("custom-select");

    // Gatilho (Trigger)
    const trigger = document.createElement("div");
    trigger.className = "select-trigger";
    trigger.innerHTML = `
      <span class="selected-text">Escolha uma turma...</span>
      <iconify-icon icon="material-symbols:expand-more" class="transition-transform duration-300"></iconify-icon>
    `;

    // Lista de Opções
    const optionsList = document.createElement("div");
    optionsList.className = "select-options";

    options.forEach(opt => {
      const item = document.createElement("div");
      item.className = "select-option";
      item.textContent = opt.label;
      
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Atualiza UI
        trigger.querySelector(".selected-text").textContent = opt.label;
        trigger.querySelector("iconify-icon").classList.remove("rotate-180");
        container.classList.remove("active");
        
        // Marca como selecionado
        optionsList.querySelectorAll(".select-option").forEach(i => i.classList.remove("selected"));
        item.classList.add("selected");

        // Executa callback
        if (callback) callback(opt.value);
      });

      optionsList.appendChild(item);
    });

    // Eventos de Abrir/Fechar
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = container.classList.toggle("active");
      trigger.querySelector("iconify-icon").classList.toggle("rotate-180", isActive);
      
      // Fecha outros selects se houver
      document.querySelectorAll(".custom-select").forEach(s => {
        if (s !== container) s.classList.remove("active");
      });
    });

    // Fechar ao clicar fora
    document.addEventListener("click", () => {
      container.classList.remove("active");
      trigger.querySelector("iconify-icon").classList.remove("rotate-180");
    });

    container.appendChild(trigger);
    container.appendChild(optionsList);
  }
};

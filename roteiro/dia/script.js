function cp(button) {
    const input = button.parentNode.querySelector("input");

    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);

    try {
        document.execCommand("copy");

        const textoOriginal = button.textContent;
        button.textContent = "✅ Copiado";

        setTimeout(() => {
            button.textContent = textoOriginal;
        }, 1500);

    } catch (e) {
        button.textContent = "Selecione e copie";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".checklist input[type='checkbox']").forEach(cb => {

        function atualizar() {

            // Risca o item da checklist
            const label = cb.closest("label");

            if (label) {
                label.classList.toggle("done", cb.checked);
            }

            // Risca o item correspondente no Planejamento do Dia
            const target = cb.dataset.target;

            if (target) {
                const agenda = document.getElementById(target);

                if (agenda) {
                    agenda.classList.toggle("done", cb.checked);
                }
            }
        }

        cb.addEventListener("change", atualizar);

        // Atualiza ao carregar a página
        atualizar();

    });

});

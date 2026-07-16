function cp(btn) {
    const i = btn.parentNode.querySelector("input");

    i.select();
    i.setSelectionRange(0, 99999);

    document.execCommand("copy");

    const t = btn.textContent;
    btn.textContent = "✅ Copiado";

    setTimeout(() => {
        btn.textContent = t;
    }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".checklist input[type='checkbox']").forEach(cb => {

        function atualizar() {

            // Risca o item da checklist
            cb.parentElement.classList.toggle("done", cb.checked);

            // Risca o item correspondente no planejamento
            const id = cb.dataset.target;

            if (id) {
                const item = document.getElementById(id);

                if (item) {
                    item.classList.toggle("done", cb.checked);
                }
            }
        }

        cb.addEventListener("change", atualizar);

        atualizar();
    });

});

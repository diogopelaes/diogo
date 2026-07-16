function cp(button) {
    const input = button.parentNode.querySelector("input");

    input.select();
    input.setSelectionRange(0, 99999); // Compatibilidade com dispositivos móveis

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

// Risca automaticamente o texto da atração quando o checkbox é marcado
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".checklist input[type='checkbox']").forEach(cb => {

        const atualizar = () => {
            const texto = cb.parentElement;

            if (cb.checked) {
                texto.style.textDecoration = "line-through";
                texto.style.opacity = "0.6";
            } else {
                texto.style.textDecoration = "none";
                texto.style.opacity = "1";
            }
        };

        cb.addEventListener("change", atualizar);
        atualizar();
    });
});

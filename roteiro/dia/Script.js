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

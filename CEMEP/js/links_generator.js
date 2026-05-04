document.addEventListener("DOMContentLoaded", () => {
    const category = document.body.dataset.category;
    const seriesContainers = {
        "1serie": document.querySelector("#serie-1 .file-list"),
        "2serie": document.querySelector("#serie-2 .file-list"),
        "3serie": document.querySelector("#serie-3 .file-list")
    };

    // Inicializa Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Configura o efeito de acordeão
    document.querySelectorAll(".series-header").forEach(header => {
        header.addEventListener("click", () => {
            const section = header.parentElement;
            section.classList.toggle("active");
        });
    });

    // Carrega os links do JSON
    fetch("links.json")
        .then(response => response.json())
        .then(data => {
            const filteredFiles = data.filter(file => file.category === category);
            
            // Limpa os containers (remove loaders se houver)
            Object.values(seriesContainers).forEach(c => {
                if (c) c.innerHTML = "";
            });

            filteredFiles.forEach(file => {
                const container = seriesContainers[file.series];
                if (container) {
                    const li = document.createElement("li");
                    const icon = getIconForExt(file.ext);
                    
                    li.innerHTML = `
                        <a href="${file.path}" class="file-item" target="_blank">
                            <i data-lucide="${icon}" class="file-icon"></i>
                            <span>${file.name}</span>
                            <div class="download-status">
                                <span>Visualizar</span>
                                <i data-lucide="external-link" style="width: 14px"></i>
                            </div>
                        </a>
                    `;
                    container.appendChild(li);
                }
            });

            // Recria os ícones do Lucide para os novos elementos
            if (window.lucide) {
                lucide.createIcons();
            }

            // Se uma série estiver vazia, mostra mensagem
            Object.keys(seriesContainers).forEach(s => {
                const c = seriesContainers[s];
                if (c && c.children.length === 0) {
                    c.innerHTML = '<li class="error-msg">Nenhum arquivo disponível para esta série.</li>';
                }
            });
        })
        .catch(error => {
            console.error("Erro ao carregar links:", error);
            Object.values(seriesContainers).forEach(c => {
                if (c) c.innerHTML = '<li class="error-msg">Erro ao carregar arquivos. Tente novamente mais tarde.</li>';
            });
        });
});

function getIconForExt(ext) {
    const e = ext.toLowerCase();
    if (e === ".pdf") return "file-text";
    if (e === ".doc" || e === ".docx") return "file-edit";
    if (e === ".xls" || e === ".xlsx") return "table";
    if (e === ".ppt" || e === ".pptx") return "presentation";
    if (e === ".ipynb") return "code-2";
    if (e === ".zip" || e === ".rar") return "archive";
    return "file";
}

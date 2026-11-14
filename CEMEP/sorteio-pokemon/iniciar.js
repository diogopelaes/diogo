const jsonInput = document.getElementById("jsonInput");
const jsonFileName = document.getElementById("jsonFileName");
const loadJsonBtn = document.getElementById("loadJsonBtn");
const downloadTemplateBtn = document.getElementById("downloadTemplateBtn");
const jsonPreview = document.getElementById("jsonPreview");
const previewTitle = document.getElementById("previewTitle");
const previewMeta = document.getElementById("previewMeta");

let loadedJsonData = null;

/**
 * Normaliza a estrutura do JSON carregado para garantir compatibilidade
 */
function normalizeRaffleData(raw) {
  if (!raw || !Array.isArray(raw.turmas) || raw.turmas.length === 0) {
    throw new Error("O JSON precisa conter uma lista de 'turmas'.");
  }

  const repetirEstudante =
    raw.repetir_estudante !== undefined
      ? Boolean(raw.repetir_estudante)
      : Boolean(raw.com_reposicao);

  const repetirNumero =
    raw.repetir_numero !== undefined ? Boolean(raw.repetir_numero) : false;

  const turmas = raw.turmas.map((t) => {
    const estudantes = Array.isArray(t.estudantes)
      ? t.estudantes.map((e) => ({
          nome: String(e.nome || "").trim(),
          posicao: e.posicao ?? (repetirEstudante ? null : 0),
          sorteios_count: Number(e.sorteios_count || 0),
          sorteios_datas: Array.isArray(e.sorteios_datas) ? e.sorteios_datas : [],
          questoes_sorteadas: Array.isArray(e.questoes_sorteadas)
            ? e.questoes_sorteadas
            : [],
        }))
      : [];

    const questoes = Array.isArray(t.questoes) ? t.questoes : [];
    const questoesSorteadas = Array.isArray(t.questoes_sorteadas)
      ? t.questoes_sorteadas
      : [];

    return {
      turma: String(t.turma || "Turma"),
      questoes,
      questoes_sorteadas: questoesSorteadas,
      estudantes,
    };
  });

  return {
    titulo: raw.titulo || "Sorteio CEMEP",
    data_criacao: raw.data_criacao || new Date().toISOString().split(".")[0],
    repetir_estudante: repetirEstudante,
    repetir_numero: repetirNumero,
    qtd_sorteios: Number(raw.qtd_sorteios || 0),
    turmas,
  };
}

/**
 * Evento: Seleção de JSON
 */
jsonInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) {
    jsonFileName.textContent = "Escolher arquivo JSON";
    loadedJsonData = null;
    jsonPreview.classList.add("hidden");
    return;
  }

  jsonFileName.textContent = file.name;
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      loadedJsonData = normalizeRaffleData(parsed);

      const totalEstudantes = loadedJsonData.turmas.reduce(
        (acc, t) => acc + t.estudantes.length,
        0
      );
      const repEstLabel = loadedJsonData.repetir_estudante
        ? "Estudantes: com repetição"
        : "Estudantes: sem repetição";
      const repNumLabel = loadedJsonData.repetir_numero
        ? "Questões: com repetição"
        : "Questões: sem repetição";

      previewTitle.textContent = loadedJsonData.titulo;
      previewMeta.textContent = `${loadedJsonData.turmas.length} turmas • ${totalEstudantes} estudantes • ${repEstLabel} • ${repNumLabel}`;
      jsonPreview.classList.remove("hidden");
    } catch (err) {
      alert("Arquivo JSON inválido ou com estrutura incorreta!");
      jsonFileName.textContent = "Escolher arquivo JSON";
      loadedJsonData = null;
      jsonPreview.classList.add("hidden");
    }
  };

  reader.readAsText(file);
});

/**
 * Evento: Clique em "Carregar Dados"
 */
loadJsonBtn.addEventListener("click", function () {
  if (!loadedJsonData) {
    alert("Por favor, selecione um arquivo JSON válido primeiro!");
    return;
  }

  localStorage.setItem("sorteioData", JSON.stringify(loadedJsonData));
  window.location.href = "sorteio.html";
});

/**
 * Evento: Download do JSON de modelo
 */
downloadTemplateBtn.addEventListener("click", async function () {
  try {
    const response = await fetch("modelo-sorteio.json");
    if (!response.ok) throw new Error("Falha ao buscar modelo");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-sorteio.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    // Fallback direto via link caso esteja rodando em file://
    const link = document.createElement("a");
    link.href = "modelo-sorteio.json";
    link.download = "modelo-sorteio.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

const input = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const processBtn = document.getElementById("processBtn");

// Elementos para Carregar Sorteio
const jsonInput = document.getElementById("jsonInput");
const jsonFileName = document.getElementById("jsonFileName");
const loadJsonBtn = document.getElementById("loadJsonBtn");

let rawRows = null; // Armazena os dados brutos da planilha antes do processamento final
let loadedJsonData = null; // Armazena o JSON carregado para continuação

// URL da API para buscar o horário oficial de São Paulo
const TIME_API_URL = "https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo";

async function getSaoPauloTime() {
  try {
    const response = await fetch(TIME_API_URL);
    if (!response.ok) throw new Error("Falha na resposta da API");
    const data = await response.json();
    return data.dateTime.split('.')[0]; 
  } catch (error) {
    const now = new Date();
    const offset = -3;
    const spTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (offset * 3600000));
    return spTime.toISOString().split('.')[0].replace('T', ' ');
  }
}

/**
 * Evento: Seleção de Arquivo
 * Apenas lê os dados brutos e prepara para o processamento
 */
input.addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) {
    fileName.textContent = "Escolher arquivo";
    rawRows = null;
    return;
  }

  fileName.textContent = file.name;
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    
    if (rawRows.length === 0) {
      alert("A planilha está vazia.");
      rawRows = null;
    }
  };

  reader.readAsArrayBuffer(file);
});

/**
 * Evento: Seleção de JSON (Para carregar sorteio existente)
 */
jsonInput.addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) {
    jsonFileName.textContent = "Escolher arquivo JSON";
    loadedJsonData = null;
    return;
  }

  jsonFileName.textContent = file.name;
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      loadedJsonData = JSON.parse(e.target.result);
      // Validação básica se o arquivo tem a estrutura correta
      if (!loadedJsonData.turmas) {
        throw new Error("Estrutura inválida");
      }
    } catch (err) {
      alert("Arquivo JSON inválido ou corrompido!");
      jsonFileName.textContent = "Escolher arquivo JSON";
      loadedJsonData = null;
    }
  };

  reader.readAsText(file);
});

/**
 * Evento: Clique em "Carregar Dados"
 */
loadJsonBtn.addEventListener("click", function() {
  if (!loadedJsonData) {
    alert("Por favor, selecione um arquivo JSON válido primeiro!");
    return;
  }

  // Salva o JSON carregado diretamente e redireciona
  localStorage.setItem("sorteioData", JSON.stringify(loadedJsonData));
  window.location.href = "sorteio.html";
});

/**
 * Evento: Clique em "Novo Sorteio"
 * Aqui é onde o JSON final é gerado, garantindo que pegamos as opções ATUAIS da tela
 */
processBtn.addEventListener("click", async function() {
  if (!rawRows) {
    alert("Por favor, selecione um arquivo válido primeiro!");
    return;
  }

  // 1. Limpa QUALQUER dado anterior do localStorage para evitar conflitos
  localStorage.removeItem("sorteioData");

  // 2. Pega os valores ATUAIS dos campos da tela (Título e Modo)
  const raffleTitle = document.getElementById("raffleTitle").value.trim() || "Sorteio CEMEP";
  const comReposicao = document.querySelector('input[name="modo_sorteio"]:checked').value === "com";

  // 3. Busca o horário de criação
  const creationTime = await getSaoPauloTime();

  // 4. Processa os dados brutos com as configurações escolhidas
  const finalData = processStudentsData(rawRows, creationTime, comReposicao, raffleTitle);

  // 5. Salva o novo JSON no localStorage
  localStorage.setItem("sorteioData", JSON.stringify(finalData));
  
  // 6. Redireciona
  window.location.href = "sorteio.html";
});

/**
 * Lógica de Processamento
 */
function processStudentsData(rows, timestamp, comReposicao, titulo) {
  const groups = {};

  rows.forEach(row => {
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      normalizedRow[key.trim().toLowerCase()] = row[key];
    });

    const nome = normalizedRow["nome"] || normalizedRow["estudante"] || normalizedRow["aluno"];
    const turma = normalizedRow["turma"] || normalizedRow["classe"];

    if (nome && turma) {
      if (!groups[turma]) {
        groups[turma] = {
          turma: String(turma),
          estudantes: []
        };
      }
      groups[turma].estudantes.push({
        nome: String(nome).trim(),
        posicao: comReposicao ? null : 0,
        sorteios_count: 0,
        sorteios_datas: []
      });
    }
  });

  const sortedGroups = Object.values(groups).sort((a, b) => 
    String(a.turma).localeCompare(String(b.turma), undefined, { numeric: true, sensitivity: 'base' })
  );

  sortedGroups.forEach(group => {
    group.estudantes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  });

  return {
    titulo: titulo,
    data_criacao: timestamp,
    com_reposicao: comReposicao,
    qtd_sorteios: 0,
    turmas: sortedGroups
  };
}

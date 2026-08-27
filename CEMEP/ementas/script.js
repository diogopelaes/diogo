/**
 * DocsCEMEP - Catálogo Institucional de PDFs
 * Gerenciamento de busca, filtros de categoria e renderização dinâmica.
 */

// Catálogo de PDFs (sincronizado automaticamente pela compilação ou carregado via fetch)
let PDF_CATALOG = [
  {
    "id": "banco_de_dados_1",
    "title": "Banco de Dados — 1ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "banco_de_dados_1.pdf",
    "path": "PDFs/ementas/banco_de_dados_1.pdf",
    "size": "45 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "banco_de_dados_2",
    "title": "Banco de Dados — 2ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "banco_de_dados_2.pdf",
    "path": "PDFs/ementas/banco_de_dados_2.pdf",
    "size": "45 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "banco_de_dados_3",
    "title": "Banco de Dados — 3ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "banco_de_dados_3.pdf",
    "path": "PDFs/ementas/banco_de_dados_3.pdf",
    "size": "44 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "desenvolvimento_mobile",
    "title": "Desenvolvimento Mobile",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "desenvolvimento_mobile.pdf",
    "path": "PDFs/ementas/desenvolvimento_mobile.pdf",
    "size": "44 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "engenharia_de_software",
    "title": "Engenharia de Software",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "engenharia_de_software.pdf",
    "path": "PDFs/ementas/engenharia_de_software.pdf",
    "size": "46 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "filosofia",
    "title": "Filosofia",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "filosofia.pdf",
    "path": "PDFs/ementas/filosofia.pdf",
    "size": "55 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "fundamentos_da_informatica",
    "title": "Fundamentos da Informática",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "fundamentos_da_informatica.pdf",
    "path": "PDFs/ementas/fundamentos_da_informatica.pdf",
    "size": "47 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "iniciacao_cientifica",
    "title": "Iniciação Científica",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "iniciacao_cientifica.pdf",
    "path": "PDFs/ementas/iniciacao_cientifica.pdf",
    "size": "48 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "linguagem_de_programacao_1",
    "title": "Linguagem de Programação — 1ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "linguagem_de_programacao_1.pdf",
    "path": "PDFs/ementas/linguagem_de_programacao_1.pdf",
    "size": "36 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "linguagem_de_programacao_2",
    "title": "Linguagem de Programação — 2ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "linguagem_de_programacao_2.pdf",
    "path": "PDFs/ementas/linguagem_de_programacao_2.pdf",
    "size": "46 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "linguagem_de_programacao_3",
    "title": "Linguagem de Programação — 3ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "linguagem_de_programacao_3.pdf",
    "path": "PDFs/ementas/linguagem_de_programacao_3.pdf",
    "size": "46 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "producao_audiovisual_e_animacao",
    "title": "Produção Audiovisual e Animação",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "producao_audiovisual_e_animacao.pdf",
    "path": "PDFs/ementas/producao_audiovisual_e_animacao.pdf",
    "size": "47 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "programacao_e_desenvolvimento_web_1",
    "title": "Programação e Desenvolvimento Web — 1ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "programacao_e_desenvolvimento_web_1.pdf",
    "path": "PDFs/ementas/programacao_e_desenvolvimento_web_1.pdf",
    "size": "44 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "programacao_e_desenvolvimento_web_2",
    "title": "Programação e Desenvolvimento Web — 2ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "programacao_e_desenvolvimento_web_2.pdf",
    "path": "PDFs/ementas/programacao_e_desenvolvimento_web_2.pdf",
    "size": "46 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "programacao_orientada_a_objetos",
    "title": "Programação Orientada a Objetos",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "programacao_orientada_a_objetos.pdf",
    "path": "PDFs/ementas/programacao_orientada_a_objetos.pdf",
    "size": "46 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "projeto_de_vida_e_carreira",
    "title": "Projeto de Vida e Carreira na Era Tech",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "projeto_de_vida_e_carreira.pdf",
    "path": "PDFs/ementas/projeto_de_vida_e_carreira.pdf",
    "size": "48 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "tecnica_de_programacao_visual_1",
    "title": "Técnicas de Programação Visual — 2ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "tecnica_de_programacao_visual_1.pdf",
    "path": "PDFs/ementas/tecnica_de_programacao_visual_1.pdf",
    "size": "44 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "tecnica_de_programacao_visual_2",
    "title": "Técnicas de Programação Visual — 3ª série",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "tecnica_de_programacao_visual_2.pdf",
    "path": "PDFs/ementas/tecnica_de_programacao_visual_2.pdf",
    "size": "45 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "tecnicas_de_programacao_e_algoritmos",
    "title": "Técnicas de Programação e Algoritmos",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "tecnicas_de_programacao_e_algoritmos.pdf",
    "path": "PDFs/ementas/tecnicas_de_programacao_e_algoritmos.pdf",
    "size": "44 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "tecnologia_e_robotica_aplicada",
    "title": "Tecnologia e Robótica Aplicada",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "tecnologia_e_robotica_aplicada.pdf",
    "path": "PDFs/ementas/tecnologia_e_robotica_aplicada.pdf",
    "size": "47 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "trabalho_de_conclusao_de_curso",
    "title": "Trabalho de Conclusão de Curso",
    "category": "ementa",
    "categoryLabel": "Ementa",
    "filename": "trabalho_de_conclusao_de_curso.pdf",
    "path": "PDFs/ementas/trabalho_de_conclusao_de_curso.pdf",
    "size": "53 KB",
    "updatedAt": "27/08/2026"
  },
  {
    "id": "Matriz Curricular CEMEP - 2027",
    "title": "Matriz curricular cemep 2027",
    "category": "matriz",
    "categoryLabel": "Matriz",
    "filename": "Matriz Curricular CEMEP - 2027.pdf",
    "path": "PDFs/matrizes/Matriz Curricular CEMEP - 2027.pdf",
    "size": "120 KB",
    "updatedAt": "27/08/2026"
  }
];

// Estado da Aplicação
const appState = {
  currentFilter: 'all',
  searchQuery: '',
  items: []
};

// Elementos do DOM
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resetSearchBtn = document.getElementById('resetSearchBtn');
const filterTabs = document.getElementById('filterTabs');
const documentsGrid = document.getElementById('documentsGrid');
const emptyState = document.getElementById('emptyState');
const sectionTitle = document.getElementById('sectionTitle');
const resultsCount = document.getElementById('resultsCount');

// Contadores de estatísticas
const statTotalPdfs = document.getElementById('statTotalPdfs');
const statEmentas = document.getElementById('statEmentas');
const countAll = document.getElementById('countAll');
const countEmentas = document.getElementById('countEmentas');
const countPlanos = document.getElementById('countPlanos');
const countMatrizes = document.getElementById('countMatrizes');

/**
 * Tenta carregar o catálogo de forma assíncrona se disponível via servidor HTTP
 */
async function carregarCatalogoDinamico() {
  try {
    // Tenta carregar o manifesto gerado se estiver rodando via servidor HTTP
    const res = await fetch('PDFs/manifest.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        PDF_CATALOG = data;
      }
    }
  } catch (e) {
    // Modo estático (file://) - utiliza a lista embutida no script
  }
  
  appState.items = [...PDF_CATALOG];
  atualizarContadores();
  renderizarDocumentos();
}

/**
 * Atualiza os contadores de estatísticas e das abas de filtro
 */
function atualizarContadores() {
  const total = PDF_CATALOG.length;
  const ementas = PDF_CATALOG.filter(d => d.category === 'ementa').length;
  const planos = PDF_CATALOG.filter(d => d.category === 'plano_curso').length;
  const matrizes = PDF_CATALOG.filter(d => d.category === 'matriz').length;

  if (statTotalPdfs) statTotalPdfs.textContent = total;
  if (statEmentas) statEmentas.textContent = ementas;

  if (countAll) countAll.textContent = total;
  if (countEmentas) countEmentas.textContent = ementas;
  if (countPlanos) countPlanos.textContent = planos;
  if (countMatrizes) countMatrizes.textContent = matrizes;
}

/**
 * Formata o título da seção de acordo com o filtro selecionado
 */
function obterTituloSecao(filtro) {
  switch (filtro) {
    case 'ementa': return 'Ementas Curriculares';
    case 'plano_curso': return 'Planos de Curso';
    case 'matriz': return 'Matrizes Curriculares';
    default: return 'Todos os Documentos';
  }
}

/**
 * Retorna a classe CSS correspondente para a categoria
 */
function obterClasseCategoria(categoria) {
  switch (categoria) {
    case 'ementa': return 'badge-ementa';
    case 'plano_curso': return 'badge-plano';
    case 'matriz': return 'badge-matriz';
    default: return 'badge-ementa';
  }
}

/**
 * Filtra e renderiza os cards de documentos na tela
 */
function renderizarDocumentos() {
  const { currentFilter, searchQuery } = appState;
  const query = searchQuery.trim().toLowerCase();

  const filtrados = PDF_CATALOG.filter(item => {
    // Filtro por categoria
    if (currentFilter !== 'all' && item.category !== currentFilter) {
      return false;
    }

    // Filtro por busca de texto
    if (query) {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchFile = item.filename.toLowerCase().includes(query);
      const matchCategory = item.categoryLabel.toLowerCase().includes(query);
      return matchTitle || matchFile || matchCategory;
    }

    return true;
  });

  // Atualiza título da seção e contagem de resultados
  if (sectionTitle) sectionTitle.textContent = obterTituloSecao(currentFilter);
  if (resultsCount) {
    resultsCount.textContent = filtrados.length === 1 
      ? '1 documento encontrado' 
      : `${filtrados.length} documentos encontrados`;
  }

  // Estado Vazio
  if (filtrados.length === 0) {
    documentsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // ---- Cards (Mobile) ----
  documentsGrid.innerHTML = filtrados.map(item => {
    const badgeClass = obterClasseCategoria(item.category);
    return `
      <article class="doc-card">
        <div class="doc-header">
          <div class="doc-icon-wrap" aria-hidden="true">
            <span class="material-symbols-outlined">picture_as_pdf</span>
          </div>
          <div class="doc-info">
            <h3 class="doc-title">${escapeHTML(item.title)}</h3>
            <div class="doc-meta-row">
              <span class="category-badge ${badgeClass}">${escapeHTML(item.categoryLabel)}</span>
              ${item.updatedAt ? `<span class="doc-file-info">${escapeHTML(item.updatedAt)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="doc-footer">
          <span class="doc-path" title="${escapeHTML(item.path)}">${escapeHTML(item.filename)}</span>
          <a href="${encodeURI(item.path)}" class="open-pdf-btn-card" target="_blank" rel="noopener noreferrer" title="Abrir ${escapeHTML(item.title)}">
            <span class="material-symbols-outlined icon-inline">open_in_new</span>
            <span>Abrir</span>
          </a>
        </div>
      </article>
    `;
  }).join('');

  // ---- Tabela (Desktop) ----
  const tableWrap = document.getElementById('documentsTableWrap');
  const tableBody = document.getElementById('documentsTableBody');
  if (!tableWrap || !tableBody) return;

  tableBody.innerHTML = filtrados.map(item => {
    const badgeClass = obterClasseCategoria(item.category);
    return `
      <tr class="document-row clickable-row" data-href="${encodeURI(item.path)}" tabindex="0" role="link" title="Abrir ${escapeHTML(item.title)} (PDF)" aria-label="Abrir documento ${escapeHTML(item.title)}">
        <td>
          <div class="td-title">
            <div class="td-doc-icon" aria-hidden="true">
              <span class="material-symbols-outlined">picture_as_pdf</span>
            </div>
            <span class="td-name" title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</span>
          </div>
        </td>
        <td><span class="category-badge ${badgeClass}">${escapeHTML(item.categoryLabel)}</span></td>
        <td class="td-file">${escapeHTML(item.filename)}</td>
        <td class="td-size">${escapeHTML(item.size || '—')}</td>
        <td class="td-date">${escapeHTML(item.updatedAt || '—')}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Prevenção de XSS
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// Event Listeners
// ==========================================================================

// Input de busca
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value;
    const searchBox = searchInput.closest('.search-box');
    if (searchBox) {
      if (e.target.value.trim().length > 0) {
        searchBox.classList.add('has-value');
      } else {
        searchBox.classList.remove('has-value');
      }
    }
    renderizarDocumentos();
  });

  // Atalho de teclado '/' para focar na busca
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

// Botão de limpar busca
if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    appState.searchQuery = '';
    const searchBox = searchInput.closest('.search-box');
    if (searchBox) searchBox.classList.remove('has-value');
    searchInput.focus();
    renderizarDocumentos();
  });
}

// Botão de resetar busca no estado vazio
if (resetSearchBtn) {
  resetSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    appState.searchQuery = '';
    appState.currentFilter = 'all';
    
    // Atualiza classes ativas nas abas
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === 'all');
    });

    const searchBox = searchInput.closest('.search-box');
    if (searchBox) searchBox.classList.remove('has-value');

    renderizarDocumentos();
  });
}

// Abas de Filtro de Categoria
if (filterTabs) {
  filterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;

    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    appState.currentFilter = tab.dataset.filter || 'all';
    renderizarDocumentos();
  });
}

// Clique e Teclado na Linha da Tabela (Abrir PDF)
const documentsTableBody = document.getElementById('documentsTableBody');
if (documentsTableBody) {
  // Clique na linha
  documentsTableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr.clickable-row');
    if (row && row.dataset.href) {
      window.open(row.dataset.href, '_blank', 'noopener,noreferrer');
    }
  });

  // Acessibilidade por teclado (Enter ou Espaço na linha focada)
  documentsTableBody.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('tr.clickable-row');
      if (row && row.dataset.href) {
        e.preventDefault();
        window.open(row.dataset.href, '_blank', 'noopener,noreferrer');
      }
    }
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarCatalogoDinamico();
});


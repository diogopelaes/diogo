// Initialize Lucide icons
lucide.createIcons();

/**
 * Shared Google Drive File Loader
 * @param {string} scriptUrl - The Web App URL from Google Apps Script
 */
async function loadDriveFiles(scriptUrl) {
  if (!scriptUrl || scriptUrl === 'SUA_URL_AQUI') {
    document.querySelectorAll('.file-container').forEach(container => {
      container.innerHTML = '<p class="error-msg">Configure a SCRIPT_URL no arquivo HTML.</p>';
    });
    return;
  }

  try {
    const response = await fetch(scriptUrl);
    const data = await response.json();

    Object.keys(data).forEach(seriesKey => {
      renderFilesToContainer(seriesKey, data[seriesKey]);
    });
  } catch (error) {
    console.error('Erro ao carregar arquivos:', error);
    document.querySelectorAll('.file-container').forEach(container => {
      container.innerHTML = '<p class="error-msg">Erro ao carregar arquivos do Drive.</p>';
    });
  }
}

function renderFilesToContainer(seriesId, files) {
  const container = document.getElementById(`files-${seriesId}`);
  if (!container) return;

  if (!files || files.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted-dark); font-size: 0.9rem;">Nenhum arquivo encontrado.</p>';
    return;
  }

  // Ordenar arquivos de forma inteligente
  files.sort((a, b) => {
    // Função para separar nome da extensão
    const splitName = (filename) => {
      const idx = filename.lastIndexOf('.');
      return idx === -1 ? [filename, ''] : [filename.substring(0, idx), filename.substring(idx)];
    };

    const [baseA, extA] = splitName(a.name.toLowerCase());
    const [baseB, extB] = splitName(b.name.toLowerCase());

    // Primeiro compara o nome base (ex: "lista_1" vs "lista_1_gab")
    const cmp = baseA.localeCompare(baseB, 'pt', { numeric: true, sensitivity: 'base' });
    
    // Se os nomes base forem iguais, compara as extensões
    if (cmp === 0) {
      return extA.localeCompare(extB, 'pt', { sensitivity: 'base' });
    }
    
    return cmp;
  });

  const list = document.createElement('ul');
  list.className = 'file-list';

  files.forEach(file => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = file.url;
    link.target = '_blank';
    link.className = 'file-item';
    
    let icon = 'description';
    if (file.mimeType.includes('pdf')) icon = 'picture_as_pdf';
    else if (file.mimeType.includes('image')) icon = 'image';
    else if (file.mimeType.includes('presentation')) icon = 'slideshow';
    else if (file.mimeType.includes('spreadsheet')) icon = 'table_chart';
    else if (file.mimeType.includes('document')) icon = 'article';

    link.innerHTML = `
      <span class="material-symbols-outlined file-icon">${icon}</span>
      <span>${file.name}</span>
    `;
    
    item.appendChild(link);
    list.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(list);
}

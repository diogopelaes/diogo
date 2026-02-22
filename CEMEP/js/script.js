// Initialize Lucide icons
lucide.createIcons();

// Initialize accordions
function initAccordions() {
  document.querySelectorAll('.series-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.series-section');
      section.classList.toggle('active');
    });
  });
}

initAccordions();

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
  } finally {
    // Esconder o preloader de página inteira
    const preloader = document.getElementById('page-preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
    }
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

  files.forEach((file, index) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    
    // Transformar link do Google Drive para download direto
    let downloadUrl = file.url;
    if (file.url.includes('drive.google.com/file/d/')) {
      const fileId = file.url.split('/d/')[1].split('/')[0];
      downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    }
    
    link.href = downloadUrl;
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
      <span>${index + 1}. ${file.name}</span>
    `;
    
    item.appendChild(link);
    list.appendChild(item);
  });

  const inner = document.createElement('div');
  inner.className = 'file-inner';
  inner.appendChild(list);

  container.innerHTML = '';
  container.appendChild(inner);
}

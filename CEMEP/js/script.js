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
      renderFilesToContainer(seriesKey, data[seriesKey], scriptUrl);
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

function renderFilesToContainer(seriesId, files, scriptUrl) {
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
    
    link.href = '#'; // Usaremos evento de clique
    link.className = 'file-item';
    link.setAttribute('data-id', file.id);
    link.setAttribute('data-name', file.name);
    
    let icon = 'description';
    if (file.mimeType.includes('pdf')) icon = 'picture_as_pdf';
    else if (file.mimeType.includes('image')) icon = 'image';
    else if (file.mimeType.includes('presentation')) icon = 'slideshow';
    else if (file.mimeType.includes('spreadsheet')) icon = 'table_chart';
    else if (file.mimeType.includes('document')) icon = 'article';

    link.innerHTML = `
      <span class="material-symbols-outlined file-icon">${icon}</span>
      <span class="file-name-text">${index + 1}. ${file.name}</span>
      <span class="download-status" style="display:none; margin-left: auto; font-size: 0.7rem; color: var(--accent-light);">Baixando...</span>
    `;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      downloadFileViaProxy(file.id, file.name, scriptUrl, link);
    });
    
    item.appendChild(link);
    list.appendChild(item);
  });

  const inner = document.createElement('div');
  inner.className = 'file-inner';
  inner.appendChild(list);

  container.innerHTML = '';
  container.appendChild(inner);
}

/**
 * Faz o download do arquivo via proxy do Apps Script
 * Isso evita que o navegador tente abrir o app do Google Drive (eliminando o seletor de contas)
 */
async function downloadFileViaProxy(fileId, fileName, scriptUrl, linkElement) {
  const statusEl = linkElement.querySelector('.download-status');
  if (statusEl) statusEl.style.display = 'inline';
  linkElement.style.pointerEvents = 'none';
  linkElement.style.opacity = '0.7';

  try {
    const response = await fetch(`${scriptUrl}?id=${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}. Verifique se a URL do script está correta.`);
    }

    const result = await response.json();

    if (result.error) throw new Error(result.error);
    if (!result.data) {
      throw new Error("O script não retornou os dados do arquivo. Certifique-se de que você atualizou o código no Google e publicou uma 'Nova Versão'.");
    }

    // Converter Base64 para Blob
    const byteCharacters = atob(result.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: result.mimeType });

    // Criar link temporário e baixar
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error('Erro no download via proxy:', error);
    alert('Erro ao baixar o arquivo. Tente novamente ou verifique se o arquivo é público.');
  } finally {
    if (statusEl) statusEl.style.display = 'none';
    linkElement.style.pointerEvents = 'auto';
    linkElement.style.opacity = '1';
  }
}

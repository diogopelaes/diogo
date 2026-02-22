/**
 * Google Apps Script para listar arquivos de LISTAS DE EXERCÍCIOS.
 * 
 * INSTRUÇÕES:
 * 1. Acesse https://script.google.com/
 * 2. Crie um "Novo Projeto".
 * 3. Cole este código no editor (substituindo tudo).
 * 4. Clique em "Implantar" > "Nova implantação".
 * 5. Tipo: "App da Web".
 * 6. Descrição: "Drive API para Listas de Exercícios".
 * 7. Executar como: "Você" (Seu e-mail).
 * 8. Quem tem acesso: "Qualquer pessoa".
 * 9. Clique em "Implantar" e copie a "URL do app da Web".
 */

function doGet(e) {
  // Se houver um parâmetro 'id', funciona como um proxy de download para evitar o seletor de contas do Google
  if (e && e.parameter && e.parameter.id) {
    try {
      const file = DriveApp.getFileById(e.parameter.id);
      const blob = file.getBlob();
      return ContentService.createTextOutput(JSON.stringify({
        name: file.getName(),
        mimeType: file.getMimeType(),
        data: Utilities.base64Encode(blob.getBytes())
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Arquivo não encontrado ou sem permissão.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  const folderIds = {
    '1a': '1ZwnXyPVfNd2gYjeOt4kfMA3J156SHiVk',
    '2a': '1cm5rEX-92Re5cU3HL_DVvwW9pLyX5eVf',
    '3a': '1JgV1RtBdtwDH0jgpq-36D16se5M0GRU5'
  };

  const results = {};

  for (const key in folderIds) {
    results[key] = getFilesFromFolder(folderIds[key]);
  }

  return ContentService.createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFilesFromFolder(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];

    while (files.hasNext()) {
      const file = files.next();
      fileList.push({
        name: file.getName(),
        url: file.getUrl(),
        id: file.getId(),
        mimeType: file.getMimeType()
      });
    }

    return fileList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    return []; // Retorna lista vazia se a pasta não for acessível
  }
}

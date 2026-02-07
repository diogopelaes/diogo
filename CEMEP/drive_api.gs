/**
 * Google Apps Script para listar arquivos de pastas específicas do Google Drive.
 * 
 * INSTRUÇÕES:
 * 1. Acesse https://script.google.com/
 * 2. Crie um "Novo Projeto".
 * 3. Cole este código no editor (substituindo tudo).
 * 4. Clique em "Implantar" > "Nova implantação".
 * 5. Tipo: "App da Web".
 * 6. Descrição: "Drive API para Aulas".
 * 7. Executar como: "Você" (Seu e-mail).
 * 8. Quem tem acesso: "Qualquer pessoa" (Isso é necessário para o site acessar sem login).
 * 9. Clique em "Implantar" e copie a "URL do app da Web".
 */

function doGet() {
  const folderIds = {
    '1a': '1qDeYASXh_yHG41FjC4s2GPAYvurxMFVc',
    '2a': '1LKHdBo008JEjo4A2ySjw8fcc5FgRSABZ',
    '3a': '1Mut66MjoQS9SDhzuKvBVndKZocu8_n5R'
  };

  const results = {};

  for (const key in folderIds) {
    results[key] = getFilesFromFolder(folderIds[key]);
  }

  return ContentService.createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFilesFromFolder(folderId) {
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

  // Ordenar por nome
  return fileList.sort((a, b) => a.name.localeCompare(b.name));
}

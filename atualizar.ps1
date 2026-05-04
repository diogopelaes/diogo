# Script principal para atualizar o projeto CEMEP e fazer o deploy no Git
# Desenvolvido por Antigravity

$currentPath = Get-Location
$syncScript = "C:\Projects\diogo\CEMEP\sync_drive.ps1"

Write-Host ">>> 1. Iniciando sincronização com Google Drive..." -ForegroundColor Cyan
if (Test-Path $syncScript) {
    # Executa o script de sincronização
    powershell.exe -ExecutionPolicy Bypass -File $syncScript
} else {
    Write-Error "Script de sincronização não encontrado em $syncScript"
    exit
}

Write-Host "`n>>> 2. Iniciando processo de Git (Commit e Push)..." -ForegroundColor Yellow

# Garante que estamos na raiz do projeto para o Git
Set-Location "C:\Projects\diogo"

git add .
$commitMsg = "Sincronização automática: Material CEMEP ($(Get-Date -Format 'dd/MM/yyyy HH:mm'))"
git commit -m $commitMsg

Write-Host "Fazendo Push para o repositório remoto..." -ForegroundColor Cyan
git push

# Retorna ao diretório original
Set-Location $currentPath

Write-Host "`n>>> Tudo pronto! Projeto CEMEP atualizado e sincronizado." -ForegroundColor Green

# Script para sincronizar arquivos do Google Drive para o projeto CEMEP
# Desenvolvido por Antigravity

$driveLetter = "G:\"
$meuDrive = Join-Path $driveLetter "Meu Drive"
$myDrive = Join-Path $driveLetter "My Drive"

# Define qual pasta do Google Drive usar
if (Test-Path $meuDrive) {
    $baseSource = $meuDrive
} elseif (Test-Path $myDrive) {
    $baseSource = $myDrive
} else {
    Write-Error "Não foi possível encontrar 'Meu Drive' ou 'My Drive' no disco G:. Verifique se o Google Drive está montado corretamente."
    exit
}

$destBase = "C:\Projects\diogo\CEMEP"

# Função para encontrar pastas de forma resiliente a acentos/caracteres especiais
function Find-Folder {
    param($ParentPath, $Filter)
    if (Test-Path $ParentPath) {
        return Get-ChildItem -Path $ParentPath -Directory -Filter $Filter | Select-Object -ExpandProperty FullName -First 1
    }
    return $null
}

# Localiza a pasta principal do ano
$anoFolder = Find-Folder $baseSource "2026 - Aulas"
if (!$anoFolder) { Write-Error "Pasta '2026 - Aulas' não encontrada."; exit }

# Localiza a pasta da disciplina
$disciplinaFolder = Find-Folder $anoFolder "*Matem*tica CEMEP*"
if (!$disciplinaFolder) { Write-Error "Pasta 'Matemática CEMEP' não encontrada."; exit }

# Subpastas de Aulas e Listas
$aulasPath = Join-Path $disciplinaFolder "Aulas"
$listasPath = Join-Path $disciplinaFolder "Listas"

# Mapeamento (Filtro na origem -> Caminho relativo no destino)
$mappings = @(
    @{ Path = $aulasPath; Filter = "1*"; Dest = "aulas\1serie" },
    @{ Path = $aulasPath; Filter = "2*"; Dest = "aulas\2serie" },
    @{ Path = $aulasPath; Filter = "3*"; Dest = "aulas\3serie" },
    @{ Path = $listasPath; Filter = "1*"; Dest = "listas\1serie" },
    @{ Path = $listasPath; Filter = "2*"; Dest = "listas\2serie" },
    @{ Path = $listasPath; Filter = "3*"; Dest = "listas\3serie" }
)

$allFiles = @()

foreach ($map in $mappings) {
    if (Test-Path $map.Path) {
        $sourceDir = Get-ChildItem -Path $map.Path -Directory -Filter $map.Filter | Select-Object -ExpandProperty FullName -First 1
        $fullDest = Join-Path $destBase $map.Dest

        if ($sourceDir) {
            # Limpa o destino antes de copiar (se a pasta já existir)
            if (Test-Path $fullDest) {
                Write-Host "Limpando pasta: $($map.Dest)" -ForegroundColor Gray
                Remove-Item -Path "$fullDest\*" -Force -Recurse -ErrorAction SilentlyContinue
            } else {
                # Garante que a pasta de destino existe
                New-Item -ItemType Directory -Path $fullDest -Force | Out-Null
                Write-Host "Criada pasta de destino: $($map.Dest)" -ForegroundColor Yellow
            }

            Write-Host "Copiando de: $(Split-Path $sourceDir -Leaf) -> $($map.Dest)"

            # Copia apenas os arquivos da pasta, excluindo arquivos .ini
            Copy-Item -Path "$sourceDir\*" -Destination $fullDest -Force -Recurse -Exclude "*.ini"

            # Remove arquivos .ini que possam ter sido copiados anteriormente
            Get-ChildItem -Path $fullDest -Filter "*.ini" -Recurse | Remove-Item -Force

            # Coleta informações dos arquivos para o links.json
            $category = $map.Dest.Split('\')[0]
            $series = $map.Dest.Split('\')[1]
            $files = Get-ChildItem -Path $fullDest -File -Recurse
            foreach ($f in $files) {
                # Cria o caminho relativo para web (usando /)
                $relPath = "$category/$series/$($f.Name)"
                $allFiles += [PSCustomObject]@{
                    name     = $f.BaseName
                    fullName = $f.Name
                    path     = $relPath
                    category = $category
                    series   = $series
                    ext      = $f.Extension
                }
            }
        } else {
            Write-Warning "Pasta não encontrada com filtro '$($map.Filter)' em $($map.Path)"
        }
    }
}

# Salva o links.json
$jsonPath = Join-Path $destBase "links.json"
$allFiles | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding utf8
Write-Host "Arquivo links.json gerado com sucesso em $jsonPath" -ForegroundColor Green

Write-Host "Sincronização concluída!" -ForegroundColor Green


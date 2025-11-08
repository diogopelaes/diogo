"use strict";

// Atualiza o relógio usando a API WorldTimeAPI para horário de São Paulo
// Retorna uma Promise que resolve quando o relógio estiver sincronizado
function startClock() {
    const clockElement = document.getElementById("clock");
    const dateElement = document.getElementById("date");
    const API_URL = "https://worldtimeapi.org/api/timezone/America/Sao_Paulo";

    // Variável para armazenar a diferença de tempo entre servidor e cliente
    let timeOffset = 0;
    let useLocalTime = false;

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    // Busca o horário correto da API
    async function fetchSaoPauloTime() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Falha na API");
            
            const data = await response.json();
            const serverTime = new Date(data.datetime);
            const localTime = new Date();
            
            // Calcula a diferença entre o horário do servidor e local
            timeOffset = serverTime.getTime() - localTime.getTime();
            useLocalTime = false;
            
            console.log("Horário sincronizado com São Paulo");
        } catch (error) {
            console.warn("Erro ao buscar horário da API, usando horário local:", error);
            useLocalTime = true;
            timeOffset = 0;
        }
    }

    // Renderiza o horário na tela
    function renderTime() {
        const localNow = new Date();
        const now = new Date(localNow.getTime() + timeOffset);
        
        const hours = pad2(now.getHours());
        const minutes = pad2(now.getMinutes());
        const seconds = pad2(now.getSeconds());
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;

        // Data em pt-BR, exemplo: terça-feira, 19 de outubro de 2025
        if (dateElement) {
            const formattedDate = now.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "2-digit",
            });
            dateElement.textContent = formattedDate;
        }
    }

    // Inicializa o relógio e retorna Promise
    return new Promise(async (resolve) => {
        await fetchSaoPauloTime();
        renderTime();
        setInterval(renderTime, 1000);
        
        // Ressincroniza com a API a cada 10 minutos para manter precisão
        setInterval(fetchSaoPauloTime, 600000);
        
        // Resolve a Promise indicando que o relógio está pronto
        resolve();
    });
}

// 1. Descobre automaticamente quantas imagens PNG numeradas existem (01.png, 02.png, etc.)
let IMAGE_LIST = [];

async function discoverImages() {
    const images = [];
    let index = 1;
    
    // Tenta carregar imagens sequencialmente até não encontrar mais
    while (index <= 99) {
        const filename = String(index).padStart(2, "0") + ".png";
        const imgPath = `./img/${filename}`;
        
        try {
            const response = await fetch(imgPath, { method: "HEAD" });
            if (response.ok) {
                images.push(filename);
                index++;
            } else {
                break;
            }
        } catch {
            break;
        }
    }
    
    IMAGE_LIST = images;
    return images;
}

// 2. Seleciona aleatoriamente uma imagem da lista e atualiza no HTML
function selectRandomImage() {
    const imageElement = document.getElementById("randomImage");
    
    if (IMAGE_LIST.length === 0) {
        console.error("Nenhuma imagem encontrada");
        return;
    }
    
    // Fade out
    imageElement.style.opacity = "0";
    
    setTimeout(() => {
        // Seleciona imagem aleatória
        const randomIndex = Math.floor(Math.random() * IMAGE_LIST.length);
        imageElement.src = `./img/${IMAGE_LIST[randomIndex]}`;
        
        // Fade in
        imageElement.style.opacity = "1";
    }, 500);
}

// 3. Aciona a seleção de imagem a cada 3 minutos
function startImageRotation() {
    const imageElement = document.getElementById("randomImage");
    
    // Configura transição suave
    imageElement.style.transition = "opacity 0.5s ease-in-out";
    imageElement.style.opacity = "1";
    
    // Alterna a cada 3 minutos (180000 ms)
    setInterval(selectRandomImage, 180000);
}

// Controle de tela cheia com suporte cross-browser
function setupFullscreen() {
    const toggleBtn = document.getElementById("fullscreenToggle");
    const icon = document.getElementById("fullscreenIcon");

    // Função para entrar em fullscreen com suporte a todos os navegadores
    function enterFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    // Função para sair do fullscreen com suporte a todos os navegadores
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // Verifica se está em fullscreen com suporte a todos os navegadores
    function isFullscreen() {
        return !!(document.fullscreenElement || 
                  document.webkitFullscreenElement || 
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    }

    // Atualiza o ícone
    function updateIcon() {
        icon.textContent = isFullscreen() ? "fullscreen_exit" : "fullscreen";
    }

    // Toggle fullscreen
    toggleBtn.addEventListener("click", () => {
        if (isFullscreen()) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    });

    // Eventos de mudança de fullscreen para todos os navegadores
    document.addEventListener("fullscreenchange", updateIcon);
    document.addEventListener("webkitfullscreenchange", updateIcon);
    document.addEventListener("mozfullscreenchange", updateIcon);
    document.addEventListener("MSFullscreenChange", updateIcon);
    
    updateIcon();
}

// Função para esconder o conteúdo principal durante o carregamento
function hideMainContent() {
    const mainContent = document.querySelector(".clock-page");
    if (mainContent) {
        mainContent.style.opacity = "0";
        mainContent.style.visibility = "hidden";
    }
}

// Função para mostrar o conteúdo principal
function showMainContent() {
    const mainContent = document.querySelector(".clock-page");
    if (mainContent) {
        mainContent.style.transition = "opacity 0.5s ease-in-out";
        mainContent.style.opacity = "1";
        mainContent.style.visibility = "visible";
    }
}

// Função para remover o preloader
function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.classList.add("loaded");
        // Remove o preloader do DOM após a animação
        setTimeout(() => {
            preloader.remove();
        }, 500);
    }
}

// 4. Roda ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    // Esconde o conteúdo principal até tudo carregar
    hideMainContent();
    
    try {
        // Inicia todas as operações necessárias e aguarda todas terminarem
        const clockPromise = startClock(); // Inicia e sincroniza o relógio
        const imagesPromise = discoverImages(); // Descobre imagens disponíveis
        
        // Aguarda relógio e descoberta de imagens
        await Promise.all([clockPromise, imagesPromise]);
        
        // Aguarda o carregamento da primeira imagem
        await new Promise(resolve => {
            const img = document.getElementById("randomImage");
            selectRandomImage(); // Carrega primeira imagem aleatória
            img.onload = resolve; // Espera a primeira imagem carregar
        });
        
        // Configura funcionalidades adicionais
        startImageRotation(); // Inicia rotação a cada 3min
        setupFullscreen();
        setupFontScaling();

        // Mostra o conteúdo e esconde o preloader quando tudo estiver pronto
        showMainContent();
        hidePreloader();
    } catch (error) {
        console.error("Erro ao inicializar a página:", error);
        // Mostra o conteúdo e esconde o preloader mesmo em caso de erro
        showMainContent();
        hidePreloader();
    }
});


// Ajuste de tamanho de fonte - simples e eficiente
function setupFontScaling() {
    const increaseBtn = document.getElementById("fontIncrease");
    const decreaseBtn = document.getElementById("fontDecrease");
    const clockElement = document.getElementById("clock");
    const dateElement = document.getElementById("date");

    // Limites de escala (70% a 150% do tamanho original)
    const MIN_SCALE = 0.7;
    const MAX_SCALE = 1.5;
    const STEP = 0.1;

    // Escala atual (sempre inicia em 1 = 100%)
    let currentScale = 1;

    // Aplica a escala aos elementos
    function applyScale() {
        if (clockElement) {
            clockElement.style.fontSize = `calc(clamp(3.5rem, 9vw, 8rem) * ${currentScale})`;
        }
        if (dateElement) {
            dateElement.style.fontSize = `calc(clamp(1.1rem, 2.8vw, 1.5rem) * ${currentScale})`;
        }
    }

    // Aumentar fonte
    if (increaseBtn) {
        increaseBtn.addEventListener("click", () => {
            if (currentScale < MAX_SCALE) {
                currentScale = Math.min(MAX_SCALE, currentScale + STEP);
                applyScale();
            }
        });
    }

    // Diminuir fonte
    if (decreaseBtn) {
        decreaseBtn.addEventListener("click", () => {
            if (currentScale > MIN_SCALE) {
                currentScale = Math.max(MIN_SCALE, currentScale - STEP);
                applyScale();
            }
        });
    }

    // Aplica escala inicial
    applyScale();
}



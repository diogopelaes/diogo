"use strict";

// Atualiza o relógio no formato HH:MM:SS
function startClock() {
    const clockElement = document.getElementById("clock");
    const dateElement = document.getElementById("date");

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    function renderTime() {
        const now = new Date();
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

    renderTime();
    setInterval(renderTime, 1000);
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

// Controle de tela cheia
function setupFullscreen() {
    const toggleBtn = document.getElementById("fullscreenToggle");
    const icon = document.getElementById("fullscreenIcon");

    function updateIcon() {
        icon.textContent = document.fullscreenElement ? "fullscreen_exit" : "fullscreen";
    }

    toggleBtn.addEventListener("click", async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (err) {
            // Falha ao alternar tela cheia; apenas registra no console para depuração
            console.error("Erro ao alternar tela cheia:", err);
        }
    });

    document.addEventListener("fullscreenchange", updateIcon);
    updateIcon();
}

// 4. Roda ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    startClock();
    await discoverImages(); // Descobre imagens disponíveis
    selectRandomImage(); // Carrega primeira imagem aleatória
    startImageRotation(); // Inicia rotação a cada 3min
    setupFullscreen();
    setupFontScaling();
});


// Ajuste global de fonte (sem persistência - sempre inicia no tamanho padrão)
function setupFontScaling() {
    const increaseBtn = document.getElementById("fontIncrease");
    const decreaseBtn = document.getElementById("fontDecrease");
    const root = document.documentElement;

    const MIN_SCALE = 0.7;
    const MAX_SCALE = 1.5;
    const STEP = 0.05;

    function clamp(value) {
        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
    }

    function applyScale(scale) {
        root.style.setProperty("--ui-scale", String(scale));
        // Aplica escala nos elementos principais
        const clock = document.getElementById("clock");
        const date = document.getElementById("date");
        
        if (clock) clock.style.transform = `scale(${scale})`;
        if (date) date.style.transform = `scale(${scale})`;
    }

    // Sempre inicia com escala 1 (tamanho padrão)
    let scale = 1;

    if (increaseBtn) {
        increaseBtn.addEventListener("click", () => {
            scale = clamp(scale + STEP);
            applyScale(scale);
        });
    }
    if (decreaseBtn) {
        decreaseBtn.addEventListener("click", () => {
            scale = clamp(scale - STEP);
            applyScale(scale);
        });
    }
}



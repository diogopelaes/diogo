
/* ======= Estado Global ======= */
let currentWorkoutData = null;
let activeTimers = {};

/* ======= Navegação e Carregamento ======= */

async function loadWorkout(id) {
    try {
        const response = await fetch(`treino${id}.json`);
        if (!response.ok) throw new Error('Falha ao carregar treino');
        const data = await response.json();
        currentWorkoutData = data;
        renderWorkout(data);

        // UI Transitions
        document.getElementById('menu').style.display = 'none';
        document.getElementById('workout-container').style.display = 'grid';
        document.getElementById('workoutControls').style.display = 'flex';
        document.getElementById('backBtn').style.display = 'inline-block';
        document.getElementById('pageTitle').textContent = data.title;
        document.getElementById('pageSub').textContent = data.subtitle;

        // Load saved checks for this view
        loadChecks();
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar o treino.');
    }
}

function goBack() {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('workout-container').style.display = 'none';
    document.getElementById('workoutControls').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
    document.getElementById('pageTitle').textContent = 'Plano de Treino';
    document.getElementById('pageSub').textContent = 'Selecione o treino do dia';

    // Limpar container para evitar duplicidade ou estado inválido
    document.getElementById('workout-container').innerHTML = '';
    currentWorkoutData = null;
}

/* ======= Renderização ======= */

function renderWorkout(data) {
    const container = document.getElementById('workout-container');

    // Gera diretamente os cards de exercícios (sem wrapper externo)
    const html = data.exercises.map(ex => renderExercise(ex)).join('');

    container.innerHTML = html;
}

function renderExercise(ex) {
    // Gera HTML de cada exercício com accordion para descrição
    const formattedTime = formatTime(ex.restSeconds);
    const exId = ex.name.replace(/[^a-zA-Z0-9]/g, '_'); // ID único para o accordion
    const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise')}`;

    return `
    <div class="ex" data-rest-type="${ex.restType}" data-ex="${ex.name}">
      <div class="left">
        <div class="info">
          <div class="name">${ex.name}</div>
          <a href="#" class="info-link" onclick="toggleAccordion('${exId}'); return false;"><span class="material-symbols-outlined">expand_more</span></a>
          <div class="meta">${ex.meta}</div>
        </div>
      </div>
      
      <!-- Accordion content -->
      <div class="accordion-content" id="acc_${exId}">
        <p class="accordion-text">${ex.description || 'Descrição não disponível.'}</p>
        <a href="${videoUrl}" target="_blank" class="video-link"><span class="material-symbols-outlined">play_circle</span> Ver Vídeo</a>
      </div>
      
      <div class="actions">
        <div class="restTag">Descanso: <strong>${Math.max(ex.restSeconds, 0)}s</strong></div>
        <div class="timerCompact">
          <div class="timerDisplay" data-timer="${ex.restSeconds}">${formattedTime}</div>
          <button class="smallBtn" onclick="startRest(this)">Iniciar</button>
        </div>
        <label class="chk" title="Marcar como feito">
          <input type="checkbox" onchange="saveCheck(this)">
        </label>
      </div>
    </div>
  `;
}

/* ======= Utilitários de Timer ======= */

function formatTime(s) {
    if (isNaN(s)) return "00:00";
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return mm + ':' + ss;
}

function startRest(btn) {
    const ex = btn.closest('.ex');
    const display = ex.querySelector('.timerDisplay');
    const key = ex.getAttribute('data-ex');

    // se timer já ativo, pausa/reset
    if (activeTimers[key] && activeTimers[key].running) {
        // pausar
        clearInterval(activeTimers[key].interval);
        activeTimers[key].running = false;
        btn.textContent = 'Iniciar';
        return;
    }

    // iniciar novo ou continuar
    let seconds = parseInt(display.getAttribute('data-timer'), 10);
    // se timer previamente finalizado, recarregar original do data-timer
    // Mas cuidado: data-timer é estático no HTML gerado, mas activeTimers guarda estado
    if (!activeTimers[key]) activeTimers[key] = { seconds };

    // Se o display já mostra 00:00, resetar para o valor original
    if (activeTimers[key].seconds <= 0) {
        activeTimers[key].seconds = parseInt(display.getAttribute('data-timer'), 10);
    }

    display.textContent = formatTime(activeTimers[key].seconds);

    activeTimers[key].interval = setInterval(() => {
        activeTimers[key].seconds--;
        if (activeTimers[key].seconds <= 0) {
            clearInterval(activeTimers[key].interval);
            activeTimers[key].running = false;
            display.textContent = '00:00';
            btn.textContent = 'Iniciar';
            flash(display);
            playTimerSound(); // 🔔 Tocar som de conclusão
            return;
        }
        display.textContent = formatTime(activeTimers[key].seconds);
    }, 1000);

    activeTimers[key].running = true;
    btn.textContent = 'Pausar';
}

function flash(el) {
    const prev = el.style.background;
    el.style.transition = 'background 0.25s';
    el.style.background = 'linear-gradient(90deg,var(--accent-teal),#2bb6a9)';
    setTimeout(() => el.style.background = prev, 650);
}

// 🔔 Som de conclusão do timer usando Web Audio API
function playTimerSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Criar um som de "ding" agradável (3 notas ascendentes)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - acorde maior

        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = audioContext.currentTime + (i * 0.15);
            const duration = 0.3;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    } catch (e) {
        console.log('Audio não suportado:', e);
    }
}

document.getElementById('resetTimers').addEventListener('click', () => {
    document.querySelectorAll('.timerDisplay').forEach(d => {
        const seconds = parseInt(d.getAttribute('data-timer'), 10);
        d.textContent = formatTime(seconds);
    });
    // limpar intervalos
    for (let k in activeTimers) if (activeTimers[k].interval) clearInterval(activeTimers[k].interval);
    activeTimers = {};
});

/* ======= Accordion Toggle ======= */

function toggleAccordion(exId) {
    const accordion = document.getElementById('acc_' + exId);
    const link = accordion.closest('.ex').querySelector('.info-link');
    const icon = link.querySelector('.material-symbols-outlined');

    if (accordion.classList.contains('open')) {
        accordion.classList.remove('open');
        icon.textContent = 'expand_more';
    } else {
        // Close any other open accordions
        document.querySelectorAll('.accordion-content.open').forEach(acc => {
            acc.classList.remove('open');
            const otherIcon = acc.closest('.ex').querySelector('.info-link .material-symbols-outlined');
            if (otherIcon) otherIcon.textContent = 'expand_more';
        });

        accordion.classList.add('open');
        icon.textContent = 'expand_less';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

/* ======= Persistência (Checks) ======= */

function saveCheck(input) {
    const ex = input.closest('.ex').getAttribute('data-ex');
    const checked = input.checked;

    input.parentElement.classList.toggle('checked', checked);

    const current = JSON.parse(localStorage.getItem('checks') || '{}');
    current[ex] = checked;
    localStorage.setItem('checks', JSON.stringify(current));
}

function loadChecks() {
    const current = JSON.parse(localStorage.getItem('checks') || '{}');
    document.querySelectorAll('#workout-container .ex').forEach(ex => {
        const key = ex.getAttribute('data-ex');
        const chk = ex.querySelector('input[type="checkbox"]');
        if (current[key]) {
            chk.checked = true;
            chk.parentElement.classList.add('checked');
        }
    });
}

document.getElementById('clearAll').addEventListener('click', () => {
    localStorage.removeItem('checks');
    document.querySelectorAll('.ex input[type="checkbox"]').forEach(i => {
        i.checked = false;
        i.parentElement.classList.remove('checked');
    });
});

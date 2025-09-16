// Geração de números aleatórios com N dígitos (sem zeros à esquerda)
function gerarNumeroComDigitos(qtdDigitos) {
	const min = Math.pow(10, Math.max(1, qtdDigitos) - 1);
	const max = Math.pow(10, Math.max(1, qtdDigitos)) - 1;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Gera 10 operações de divisão válidas com quociente e resto
// Retorna um array de objetos: { id, dividendo, divisor, quociente, resto }
function gerarDivisoes(qtdDigitosDividendo, qtdDigitosDivisor) {
	const resultados = [];
	for (let i = 0; i < 10; i++) {
		let dividendo = gerarNumeroComDigitos(qtdDigitosDividendo);
		let divisor = gerarNumeroComDigitos(qtdDigitosDivisor);
		while (divisor === 0 || divisor > dividendo || divisor === dividendo || divisor === 1) {
			divisor = gerarNumeroComDigitos(qtdDigitosDivisor);
		}
		const quociente = Math.floor(dividendo / divisor);
		const resto = dividendo % divisor;
		resultados.push({ id: i + 1, dividendo, divisor, quociente, resto });
	}
	return resultados;
}

// Renderiza as questões no HTML
function renderizarQuestoes(questoes) {
	const container = document.getElementById('listaQuestoes');
	container.innerHTML = '';
	questoes.forEach((q, idx) => {
		const linha = document.createElement('div');
		linha.className = 'flex items-center gap-3 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3';
		linha.innerHTML = `
			<div class="shrink-0 w-6 text-neutral-400"><strong>${idx + 1}.</strong></div>
			<div class="flex-1">
				<div class="text-neutral-200">${q.dividendo} ÷ ${q.divisor}</div>
				<div class="mt-2 flex flex-wrap items-center gap-2">
					<input type="number" inputmode="numeric" placeholder="Quotient" class="quo w-full sm:w-auto rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
					<input type="number" inputmode="numeric" placeholder="Remainder" class="res w-full sm:w-auto rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
					<span class="status-icon material-symbols-outlined text-[20px] text-neutral-600" aria-hidden="true"></span>
				</div>
			</div>
		`;
		container.appendChild(linha);
	});
	// Mostrar a seção
	document.getElementById('questoes').classList.remove('hidden');
}

// Verifica respostas preenchidas pelo usuário e retorna estatísticas
function verificarRespostas(questoes) {
	const linhas = Array.from(document.getElementById('listaQuestoes').children);
	let corretas = 0;
	linhas.forEach((linha, i) => {
		const quoInput = linha.querySelector('input.quo');
		const resInput = linha.querySelector('input.res');
		const quo = parseInt(quoInput.value, 10);
		const res = parseInt(resInput.value, 10);
		const esperado = questoes[i];
		const ok = quo === esperado.quociente && res === esperado.resto;
		// feedback visual
		linha.classList.remove('border-neutral-800', 'border-emerald-700', 'border-rose-700');
		linha.classList.add(ok ? 'border-emerald-700' : 'border-rose-700');
		const icon = linha.querySelector('.status-icon');
		if (icon) {
			icon.textContent = ok ? 'check_circle' : 'cancel';
			icon.classList.remove('text-neutral-600', 'text-emerald-500', 'text-rose-500');
			icon.classList.add(ok ? 'text-emerald-500' : 'text-rose-500');
		}
		if (ok) corretas++;
	});
	return { total: questoes.length, corretas };
}

// Estado na página
let questoesAtuais = [];

// Wire-up de eventos
window.addEventListener('DOMContentLoaded', () => {
	const gerarBtn = document.getElementById('gerarBtn');
	const conferirBtn = document.getElementById('conferirBtn');
	const resultado = document.getElementById('resultado');

	function gerarFluxo() {
		const dDividendo = parseInt(document.getElementById('digitosDividendo').value, 10) || 1;
		const dDivisor = parseInt(document.getElementById('digitosDivisor').value, 10) || 1;
		questoesAtuais = gerarDivisoes(dDividendo, dDivisor);
		renderizarQuestoes(questoesAtuais);
		resultado.textContent = '';
	}

	gerarBtn.addEventListener('click', gerarFluxo);
	conferirBtn.addEventListener('click', () => {
		if (!questoesAtuais.length) return;
		const stats = verificarRespostas(questoesAtuais);
		resultado.textContent = `You got ${stats.corretas} of ${stats.total} correct.`;
	});
});

// Expondo funções para testes manuais no console
window.gerarDivisoes = gerarDivisoes;
window.verificarRespostas = verificarRespostas;

const CONFIG = {
  turmas: ["1W", "1X", "1Y", "2W", "2X", "2Y", "3W", "3X", "3Y"],
  dias: [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ],
  aliases: {
    "Laboratório de Lógica Aplicada I": "LLA I",
    "Laboratório de Lógica Aplicada II": "LLA II",
    "Linguagem de Programação I": "LP I",
    "Linguagem de Programação II": "LP II",
    "Linguagem de Programação III": "LP III",
    "Desenvolvimento de Sites I": "DS I",
    "Desenvolvimento de Sites II": "DS II",
    "Banco de Dados I": "BD I",
    "Banco de Dados II": "BD II",
    "Banco de Dados III": "BD III",
    "Técnicas de Programação Visual I": "TPV I",
    "Técnicas de Programação Visual II": "TPV II",
    "Linguagem de Programação Comercial I": "LPC I",
    "Linguagem de Programação Comercial II": "LPC II",
    "Tecnologia da Informação e Comunicação": "TIC",
    "Normatização e Padronização": "NP",
    "Orientação Profissional em TIC": "OP",
    "Trabalho de Conclusão de Curso": "TCC",
  },
};

let teacherColors = {};
let allData = [];

function generateTeacherColors(data) {
  const teachers = [...new Set(data.map((i) => i["nome do professor"]))].filter(
    (t) => t && t !== "—",
  );

  const notionColors = [
    { r: 107, g: 114, b: 128 }, // Gray
    { r: 154, g: 109, b: 99 }, // Brown
    { r: 217, g: 115, b: 76 }, // Orange
    { r: 202, g: 152, b: 73 }, // Yellow
    { r: 82, g: 158, b: 114 }, // Green
    { r: 94, g: 135, b: 201 }, // Blue
    { r: 157, g: 104, b: 188 }, // Purple
    { r: 173, g: 77, b: 125 }, // Pink
    { r: 223, g: 84, b: 82 }, // Red
  ];

  // Dropdown Customizado
  const wrapper = document.getElementById("teacher-dropdown");
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const triggerText = trigger.querySelector("span");
  const optionsContainer = document.getElementById("teacher-options");

  // Popular o dropdown
  optionsContainer.innerHTML = teachers
    .map(
      (t) => `
    <div class="custom-option" data-value="${t}">${t}</div>
  `,
    )
    .join("");

  // Toggle dropdown
  trigger.onclick = (e) => {
    e.stopPropagation();
    wrapper.classList.toggle("open");
  };

  // Close when clicking outside
  document.onclick = () => wrapper.classList.remove("open");

  // Handle Option Selection
  optionsContainer.querySelectorAll(".custom-option").forEach((opt) => {
    opt.onclick = () => {
      const val = opt.getAttribute("data-value");
      handleCellClick(val);
      wrapper.classList.remove("open");
    };
  });

  teachers.forEach((teacher, index) => {
    const color = notionColors[index % notionColors.length];
    teacherColors[teacher] = {
      base: `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`,
      active: `rgba(${color.r}, ${color.g}, ${color.b}, 0.85)`,
    };
  });
}

function updateInfoCard(teacherName) {
  const infoName = document.getElementById("info-name");
  const infoContent = document.getElementById("info-content");

  if (!teacherName || teacherName === "—") {
    infoName.textContent = "Relatório Geral de Erros";

    // Analisar erros de todos os professores
    const teachers = [
      ...new Set(allData.map((i) => i["nome do professor"])),
    ].filter((t) => t && t !== "—");
    let globalErrorsHtml = "";
    let totalErrorsCount = 0;

    teachers.forEach((teacher) => {
      const teacherData = allData.filter(
        (i) => i["nome do professor"] === teacher,
      );
      const dayLoads = {};
      const track = {};
      const teacherErrors = [];

      teacherData.forEach((aula) => {
        const dia = aula["dia da semana"];
        const key = `${aula.turma}_${dia}`;
        if (!dayLoads[dia]) dayLoads[dia] = 0;
        dayLoads[dia]++;
        if (!track[key]) track[key] = [];
        track[key].push(parseInt(aula["numero da aula"]));
      });

      // Validar Sobrecarga
      Object.entries(dayLoads).forEach(([dia, count]) => {
        if (count > 8) {
          teacherErrors.push({
            type: "critical",
            msg: `SOBRECARGA: ${count} aulas na ${dia}`,
            icon: "🚨",
          });
        }
      });

      // Validar Sequência
      Object.entries(track).forEach(([key, nums]) => {
        if (nums.length <= 1) return;
        const [turma, dia] = key.split("_");
        const sorted = [...nums].sort((a, b) => a - b);
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i + 1] - sorted[i] !== 1) {
            teacherErrors.push({
              type: "warning",
              msg: `Aulas não seguidas: Turma ${turma} (${dia})`,
              icon: "⚠️",
            });
            break;
          }
        }
      });

      if (teacherErrors.length > 0) {
        totalErrorsCount += teacherErrors.length;
        const hasCritical = teacherErrors.some((e) => e.type === "critical");

        globalErrorsHtml += `
          <div class="detail-box" style="margin-bottom: 12px; border-left: 3px solid ${hasCritical ? "oklch(60% 0.15 20)" : "oklch(60% 0.1 200)"}; background: rgba(255,255,255,0.02);">
            <div style="font-weight: 700; color: ${hasCritical ? "oklch(70% 0.15 20)" : "var(--accent-primary)"}; margin-bottom: 4px; cursor:pointer; display: flex; justify-content: space-between; align-items: center;" onclick="handleCellClick('${teacher}')">
              <span>${teacher}</span>
              ${hasCritical ? '<span style="font-size: 0.6rem; color: oklch(70% 0.15 20); border: 1px solid oklch(70% 0.15 20); padding: 1px 4px; border-radius: 4px; font-weight: 800;">AVISO</span>' : ""}
            </div>
            ${teacherErrors.map((err) => `<div style="font-size: 0.8rem; color: var(--text-md); padding-left: 8px;">${err.icon} ${err.msg}</div>`).join("")}
          </div>
        `;
      }
    });

    infoContent.innerHTML = `
      <div class="info-stat-item">
        <div class="info-stat-label">Diagnóstico da Grade</div>
        <div class="info-stat-value" style="color: ${totalErrorsCount > 0 ? "oklch(60% 0.15 20)" : "var(--accent-primary)"}">
          ${totalErrorsCount} ${totalErrorsCount === 1 ? "problema encontrado" : "problemas encontrados"}
        </div>
      </div>
      <div class="detail-container">
        ${totalErrorsCount > 0 ? globalErrorsHtml : '<p style="color: #44ff44; font-size: 0.9rem;">✨ Nenhum erro detectado na grade atual!</p>'}
      </div>
      <p style="font-size: 0.75rem; color: var(--text-md); margin-top: 2rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
        Selecione um professor no menu ou na grade para ver sua carga horária detalhada.
      </p>
    `;
    return;
  }

  const teacherData = allData.filter(
    (i) => i["nome do professor"] === teacherName,
  );

  // Agrupamentos complexos
  const stats = {
    total: teacherData.length,
    turmas: {}, // { "1W": count }
    disciplinas: {}, // { "Matemática": count }
    detalhado: {}, // { "1W": { "Matemática": count } }
    cargaHoraria: {}, // { "Segunda-feira": [aulas] }
    problemas: {}, // { "turma": { "dia": [aula_nums] } }
  };

  // Mapa auxiliar para validar consecutividade
  const track = {}; // { "turma_dia": [nums] }

  teacherData.forEach((aula) => {
    const dia = aula["dia da semana"];
    const turma = aula.turma;
    const num = parseInt(aula["numero da aula"]);

    // Por Turma
    stats.turmas[turma] = (stats.turmas[turma] || 0) + 1;

    // Por Disciplina
    stats.disciplinas[aula.disciplina] =
      (stats.disciplinas[aula.disciplina] || 0) + 1;

    // Detalhado (Disciplina por Turma)
    if (!stats.detalhado[turma]) stats.detalhado[turma] = {};
    stats.detalhado[turma][aula.disciplina] =
      (stats.detalhado[turma][aula.disciplina] || 0) + 1;

    // Carga por Dia
    if (!stats.cargaHoraria[dia]) stats.cargaHoraria[dia] = [];
    stats.cargaHoraria[dia].push(aula["numero da aula"]);

    // Track para consecutividade
    const key = `${turma}_${dia}`;
    if (!track[key]) track[key] = [];
    track[key].push(num);
  });

  // Validar carga excessiva (> 8 aulas/dia)
  const excessivos = Object.entries(stats.cargaHoraria)
    .filter(([_, aulas]) => aulas.length > 8)
    .map(([dia, aulas]) => ({ dia, qtd: aulas.length }));

  // Validar aulas seguidas
  Object.entries(track).forEach(([key, nums]) => {
    if (nums.length <= 1) return;
    const [turma, dia] = key.split("_");
    const sorted = [...nums].sort((a, b) => a - b);

    let isConsecutive = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] !== 1) {
        isConsecutive = false;
        break;
      }
    }

    if (!isConsecutive) {
      if (!stats.problemas[turma]) stats.problemas[turma] = {};
      stats.problemas[turma][dia] = sorted;
    }
  });

  infoName.textContent = teacherName;

  let html = `
    <div class="info-stat-item">
      <div class="info-stat-label">Carga Horária Semanal</div>
      <div class="info-stat-value" style="font-size: 1.4rem; color: var(--accent-primary)">
        ${stats.total} <span style="font-size: 0.8rem; color: var(--text-md)">AULAS NO TOTAL</span>
      </div>
    </div>

    <div class="info-stat-item">
      <div class="info-stat-label">Resumo por Disciplina</div>
      <div class="info-list">
        ${Object.entries(stats.disciplinas)
          .map(
            ([disc, qtd]) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 0.9rem">${disc}</span>
            <span class="turma-tag" style="margin:0">${qtd}x</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <div class="info-stat-item">
      <div class="info-stat-label">Análise Detalhada por Turma</div>
      <div class="detail-container">
        ${Object.entries(stats.detalhado)
          .sort()
          .map(([turma, discs]) => {
            const hasProblem = stats.problemas[turma];
            return `
          <div class="detail-box" style="margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid ${hasProblem ? "oklch(60% 0.15 20 / 0.4)" : "var(--border-glass)"}; position: relative; overflow: hidden;">
            ${
              hasProblem
                ? `
                <div style="position: absolute; right: -5px; top: -5px; background: oklch(60% 0.15 20); color: white; font-size: 10px; padding: 4px 8px; border-radius: 0 0 0 12px; font-weight: 700;">AVISO</div>
            `
                : ""
            }
            
            <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                Turma ${turma}
                ${hasProblem ? '<span title="Aulas não consecutivas detectadas" style="color: oklch(60% 0.15 20); font-size: 1.2rem;">⚠️</span>' : ""}
            </div>

            <div style="margin-bottom: 8px;">
                ${Object.entries(discs)
                  .map(
                    ([d, q]) => `
                  <div style="font-size: 0.85rem; display: flex; justify-content: space-between; padding-left: 8px; margin-bottom: 2px;">
                    <span>• ${d}</span>
                    <span style="color: var(--text-md)">${q} aula(s)</span>
                  </div>
                `,
                  )
                  .join("")}
            </div>

            ${
              hasProblem
                ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid oklch(60% 0.15 20 / 0.2); font-size: 0.75rem; color: oklch(90% 0.05 20);">
                   <strong>Problema de Sequência:</strong><br>
                   ${Object.entries(hasProblem)
                     .map(
                       ([dia, aulas]) => `
                     • ${dia}: Aulas [${aulas.join(", ")}] não são seguidas.
                   `,
                     )
                     .join("<br>")}
                </div>
            `
                : ""
            }
          </div>
        `;
          })
          .join("")}
      </div>
    </div>

    <div class="info-stat-item">
      <div class="info-stat-label">Distribuição Semanal</div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
        ${CONFIG.dias
          .map((dia) => {
            const count = stats.cargaHoraria[dia]?.length || 0;
            const isExcessive = count > 8;
            return `<div class="turma-tag" style="opacity: ${count > 0 ? 1 : 0.3}; 
                    background: ${isExcessive ? "oklch(60% 0.15 20)" : count > 0 ? "var(--accent-primary)" : "transparent"}; 
                    color: ${isExcessive ? "#fff" : count > 0 ? "#000" : "inherit"};
                    border-color: ${isExcessive ? "transparent" : "var(--border-glass)"}">
            ${dia.split("-")[0].substring(0, 3)}: ${count}
          </div>`;
          })
          .join("")}
      </div>
      ${
        excessivos.length > 0
          ? `
        <div style="font-size: 0.85rem; color: oklch(90% 0.05 20); background: oklch(60% 0.15 20 / 0.1); padding: 12px; border-radius: 12px; border: 1px solid oklch(60% 0.15 20 / 0.3); margin-top: 15px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; color: oklch(70% 0.15 20)">
            <span style="font-size: 1.2rem;">🚨</span>
            <strong style="text-transform: uppercase; letter-spacing: 0.05em;">Sobrecarga Detectada</strong>
          </div>
          ${excessivos
            .map(
              (e) => `
            <div style="font-size: 0.8rem; margin-bottom: 2px; opacity: 0.9;">
              • <strong>${e.dia}:</strong> ${e.qtd} aulas (Limite: 8)
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `;

  infoContent.innerHTML = html;
}

function handleCellClick(teacherName) {
  const cells = document.querySelectorAll(".schedule-cell:not(.empty-cell)");
  const isAlreadyHighlighted = !!document.querySelector(
    `.schedule-cell.highlighted[data-teacher="${teacherName}"]`,
  );

  const wrapper = document.getElementById("teacher-dropdown");
  const triggerText = wrapper.querySelector(".custom-select-trigger span");
  const options = wrapper.querySelectorAll(".custom-option");

  // Limpa estados de todos
  cells.forEach((cell) => {
    const tName = cell.getAttribute("data-teacher");
    cell.classList.remove("highlighted");
    cell.style.backgroundColor = teacherColors[tName].base;
  });

  if (isAlreadyHighlighted || !teacherName || teacherName === "—") {
    triggerText.textContent = "Selecione um Professor";
    options.forEach((opt) => opt.classList.remove("selected"));
    updateInfoCard(null);
    return;
  }

  // Sincroniza select
  triggerText.textContent = teacherName;
  options.forEach((opt) => {
    opt.classList.toggle(
      "selected",
      opt.getAttribute("data-value") === teacherName,
    );
  });

  // Aplica destaque vivo apenas para o professor selecionado
  cells.forEach((cell) => {
    const tName = cell.getAttribute("data-teacher");
    if (tName === teacherName) {
      cell.classList.add("highlighted");
      cell.style.backgroundColor = teacherColors[teacherName].active;
    }
  });

  updateInfoCard(teacherName);
}

async function render() {
  try {
    const res = await fetch("json/grade_horaria.json");
    const data = await res.json();
    allData = data;

    generateTeacherColors(data);

    const main = document.getElementById("schedule-grid");
    main.innerHTML = "";

    CONFIG.dias.forEach((dia) => {
      const diaData = data.filter((i) => i["dia da semana"] === dia);
      if (!diaData.length) return;

      const card = document.createElement("section");
      card.className = "day-card";

      const title = document.createElement("h2");
      title.className = "day-title";
      title.textContent = dia;
      card.appendChild(title);

      const tableWrapper = document.createElement("div");
      tableWrapper.className = "table-wrapper";

      const table = document.createElement("table");

      let html = `<thead><tr><th style="width:120px">Horário</th>`;
      CONFIG.turmas.forEach((t) => {
        html += `<th>${t.replace(/(\d)(\w)/, "$1º $2")}</th>`;
      });
      html += `</tr></thead><tbody>`;

      const aulas = [...new Set(diaData.map((i) => i["numero da aula"]))].sort(
        (a, b) => a - b,
      );

      aulas.forEach((num) => {
        const info = diaData.find((i) => i["numero da aula"] === num);
        html += `<tr><td class="time-cell">
                      <span class="time-num">${num}ª Aula</span>
                      <span class="time-range">${info["horario da aula"]}</span>
                  </td>`;

        CONFIG.turmas.forEach((t) => {
          const aula = diaData.find(
            (i) => i["numero da aula"] === num && i["turma"] === t,
          );
          if (aula) {
            const teacherName = aula["nome do professor"];
            const colors = teacherColors[teacherName];
            const alias = CONFIG.aliases[aula.disciplina] || aula.disciplina;

            html += `<td>
                              <div class="schedule-cell" 
                                   style="background-color: ${colors.base}" 
                                   data-teacher="${teacherName}"
                                   onclick="handleCellClick('${teacherName}')">
                                  <div class="subject-abbr" title="${aula.disciplina}">${alias}</div>
                                  <div class="teacher-name">${teacherName}</div>
                              </div>
                          </td>`;
          } else {
            html += `<td><div class="schedule-cell empty-cell">—</div></td>`;
          }
        });
        html += `</tr>`;
      });

      html += `</tbody>`;
      table.innerHTML = html;
      tableWrapper.appendChild(table);
      card.appendChild(tableWrapper);
      main.appendChild(card);
    });

    // Inicializa o relatório geral de erros ao carregar
    updateInfoCard(null);
  } catch (err) {
    console.error(err);
  }
}

render();

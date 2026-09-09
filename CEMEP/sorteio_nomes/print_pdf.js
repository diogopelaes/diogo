/**
 * print_pdf.js - Módulo de impressão e geração de PDF da lista de questões sorteadas
 * CEMEP - Sorteio de Questões
 */

(function () {
  function formatarDataHora() {
    const agora = new Date();
    return agora.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function gerarHtmlImpressao({ titulo, total, sorteadas }) {
    const dataHora = formatarDataHora();
    const totalSorteadas = sorteadas.length;

    // Constrói linhas da tabela
    const linhas = sorteadas
      .map((item, index) => {
        const questaoFormatada = `Q${String(item.questao).padStart(2, "0")}`;
        const nomeFormatado = item.nome ? item.nome : "—";
        return `
          <tr>
            <td style="text-align: center; width: 45px; color: #666;">${index + 1}</td>
            <td style="font-weight: 600; color: #111; padding-left: 12px;">
              ${nomeFormatado}
            </td>
            <td style="text-align: center; width: 90px; font-weight: 700; color: #d9480f; background: #fff4e6;">
              ${questaoFormatada}
            </td>
            <td style="width: 140px; border-left: 1px dashed #ccc;"></td>
          </tr>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${titulo} - Lista de Sorteio</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #222;
            background: #fff;
            padding: 10px;
            font-size: 12pt;
            line-height: 1.4;
          }
          .header {
            border-bottom: 2px solid #ff6b00;
            padding-bottom: 12px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .header-left h1 {
            font-size: 18pt;
            font-weight: 700;
            color: #111;
            margin-bottom: 4px;
          }
          .header-left p {
            font-size: 10pt;
            color: #666;
            font-weight: 500;
          }
          .header-right {
            text-align: right;
            font-size: 9pt;
            color: #777;
          }
          .stats-bar {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 8px 14px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
            color: #495057;
          }
          .stats-bar strong {
            color: #212529;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: #f1f3f5;
            color: #495057;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            padding: 9px 8px;
            border: 1px solid #dee2e6;
            text-align: left;
          }
          td {
            padding: 8px 8px;
            border: 1px solid #dee2e6;
            font-size: 10.5pt;
          }
          tr:nth-child(even) td {
            background-color: #fafbfc;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #e9ecef;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>${titulo}</h1>
            <p>Prof. Diogo &bull; CEMEP</p>
          </div>
          <div class="header-right">
            <p><strong>Emissão:</strong> ${dataHora}</p>
            <p>Sorteio de Questões sem Reposição</p>
          </div>
        </div>

        <div class="stats-bar">
          <div>Total de Questões: <strong>${total}</strong></div>
          <div>Questões Sorteadas: <strong>${totalSorteadas}</strong></div>
          <div>Questões Restantes: <strong>${total - totalSorteadas}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 45px;">#</th>
              <th>Estudante</th>
              <th style="text-align: center; width: 90px;">Questão</th>
              <th style="width: 140px;">Visto</th>
            </tr>
          </thead>
          <tbody>
            ${linhas}
          </tbody>
        </table>

        <div class="footer">
          <span>Sorteio CEMEP &bull; Gerado eletronicamente</span>
          <span>Página 1 de 1</span>
        </div>
      </body>
      </html>
    `;
  }

  function imprimirPdf() {
    // Obtém dados do sorteio da página
    const dados = typeof window.obterDadosSorteio === "function" 
      ? window.obterDadosSorteio() 
      : null;

    if (!dados || !dados.sorteadas || dados.sorteadas.length === 0) {
      if (typeof window.mostrarModal === "function") {
        window.mostrarModal({
          tipo: "alert",
          titulo: "Nenhum Sorteio",
          subtitulo: "Aviso",
          mensagem: "Não há nenhuma questão sorteada no momento para imprimir ou gerar PDF.",
          textoConfirmar: "Entendido",
          icone: "material-symbols:info"
        });
      } else {
        alert("Não há nenhuma questão sorteada no momento para imprimir ou gerar PDF.");
      }
      return;
    }

    const htmlImpressao = gerarHtmlImpressao(dados);

    // Cria um iframe invisível para acionar a janela de impressão/PDF do navegador
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlImpressao);
    doc.close();

    // Aguarda carregar conteúdo e dispara o diálogo de impressão
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Remove o iframe após a janela de impressão ser acionada
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }, 250);
  }

  // Inicializa o botão de impressão quando o DOM estiver pronto
  function inicializar() {
    const btn = document.getElementById("printPdfBtn");
    if (btn) {
      btn.addEventListener("click", imprimirPdf);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

  // Expõe a função para acesso global se necessário
  window.imprimirListaSorteada = imprimirPdf;
})();

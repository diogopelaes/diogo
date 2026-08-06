/* ═══════════════════════════════════════════════════════
   Geometria Espacial – Comandos GeoGebra
   JavaScript: copiar, buscar, recolher, expandir, topo
   ═══════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchCount = document.getElementById("search-count");
  const btnExpand = document.getElementById("btn-expand");
  const btnCollapse = document.getElementById("btn-collapse");
  const backToTop = document.getElementById("back-to-top");
  const chapters = document.querySelectorAll(".chapter");

  /* ── Copiar comando ───────────────────────────── */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest(".card");
      const code = card.querySelector(".card-command");
      const text = code.textContent.trim();

      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add("copied");
        btn.textContent = "✓";
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.textContent = "📋";
        }, 1200);
      }).catch(function () {
        /* fallback para navegadores sem clipboard API */
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        btn.classList.add("copied");
        btn.textContent = "✓";
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.textContent = "📋";
        }, 1200);
      });
    });
  });

  /* ── Toggle capítulo ──────────────────────────── */
  document.querySelectorAll(".chapter-header").forEach(function (header) {
    header.setAttribute("tabindex", "0");
    header.setAttribute("role", "button");
    header.setAttribute("aria-expanded", "false");

    header.addEventListener("click", function () {
      toggleChapter(header.parentElement);
    });

    header.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleChapter(header.parentElement);
      }
    });
  });

  function toggleChapter(chapter) {
    const isOpen = chapter.classList.contains("open");
    const header = chapter.querySelector(".chapter-header");

    if (isOpen) {
      chapter.classList.remove("open");
      header.setAttribute("aria-expanded", "false");
    } else {
      chapter.classList.add("open");
      header.setAttribute("aria-expanded", "true");
    }
  }

  /* ── Expandir / Recolher tudo ─────────────────── */
  btnExpand.addEventListener("click", function () {
    chapters.forEach(function (ch) {
      ch.classList.add("open");
      ch.querySelector(".chapter-header").setAttribute("aria-expanded", "true");
    });
  });

  btnCollapse.addEventListener("click", function () {
    chapters.forEach(function (ch) {
      ch.classList.remove("open");
      ch.querySelector(".chapter-header").setAttribute("aria-expanded", "false");
    });
  });

  /* ── Busca por texto ──────────────────────────── */
  let searchTimeout = null;

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 200);
  });

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    /* Remover highlights anteriores */
    document.querySelectorAll(".highlight").forEach(function (el) {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });

    if (!query) {
      /* Mostrar tudo */
      document.querySelectorAll(".item").forEach(function (item) {
        item.classList.remove("hidden-by-search");
      });
      chapters.forEach(function (ch) {
        ch.classList.remove("hidden-by-search");
      });
      document.querySelectorAll(".toc-link").forEach(function (link) {
        link.classList.remove("hidden-by-search");
      });
      searchCount.textContent = "";
      return;
    }

    let matchCount = 0;

    chapters.forEach(function (ch) {
      const chapterTitle = ch.querySelector(".chapter-title").textContent.toLowerCase();
      let chapterHasMatch = chapterTitle.includes(query);

      const items = ch.querySelectorAll(".item");
      items.forEach(function (item) {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.classList.remove("hidden-by-search");
          chapterHasMatch = true;
          matchCount++;

          /* Highlight nos textos visíveis */
          highlightText(item, query);
        } else {
          item.classList.add("hidden-by-search");
        }
      });

      if (chapterHasMatch) {
        ch.classList.remove("hidden-by-search");
        ch.classList.add("open");
        ch.querySelector(".chapter-header").setAttribute("aria-expanded", "true");
      } else {
        ch.classList.add("hidden-by-search");
      }
    });

    /* Atualizar TOC */
    document.querySelectorAll(".toc-link").forEach(function (link) {
      const target = document.querySelector(link.getAttribute("href"));
      if (target && target.classList.contains("hidden-by-search")) {
        link.classList.add("hidden-by-search");
      } else {
        link.classList.remove("hidden-by-search");
      }
    });

    searchCount.textContent = matchCount > 0 ? matchCount + " item(ns)" : "Nenhum resultado";
  }

  function highlightText(container, query) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(function (node) {
      const parent = node.parentElement;
      if (!parent || parent.classList.contains("copy-btn") || parent.tagName === "SCRIPT") return;

      const text = node.textContent;
      const lower = text.toLowerCase();
      const idx = lower.indexOf(query);
      if (idx === -1) return;

      const before = document.createTextNode(text.substring(0, idx));
      const match = document.createElement("span");
      match.className = "highlight";
      match.textContent = text.substring(idx, idx + query.length);
      const after = document.createTextNode(text.substring(idx + query.length));

      const frag = document.createDocumentFragment();
      frag.appendChild(before);
      frag.appendChild(match);
      frag.appendChild(after);
      parent.replaceChild(frag, node);
    });
  }

  /* ── Voltar ao topo ───────────────────────────── */
  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }, { passive: true });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ── TOC smooth scroll ────────────────────────── */
  document.querySelectorAll(".toc-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        /* Abrir o capítulo se fechado */
        if (!target.classList.contains("open")) {
          target.classList.add("open");
          target.querySelector(".chapter-header").setAttribute("aria-expanded", "true");
        }
        const headerH = document.querySelector(".site-header").offsetHeight;
        const y = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });
});

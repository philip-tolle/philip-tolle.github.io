(() => {
  "use strict";

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("de-DE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss")
      .replace(/\s+/g, " ")
      .trim();

  const initFilters = () => {
    const panel = document.querySelector("[data-filter-panel]");
    const grid = document.querySelector("[data-card-grid]");
    if (!panel || !grid) return;

    const cards = [...grid.querySelectorAll("[data-card]")];
    const cardIndex = cards.map((card) => ({
      card,
      categories: String(card.dataset.categories || "").split(/\s+/),
      haystack: normalize(`${card.dataset.search || ""} ${card.textContent || ""}`),
    }));
    const search = panel.querySelector("[data-filter-search]");
    const categoryButtons = [...panel.querySelectorAll("[data-filter-category]")];
    const resultStatus = document.querySelector("[data-result-status]");
    const emptyState = document.querySelector("[data-empty-state]");
    const resetButton = document.querySelector("[data-reset-filters]");
    const state = { category: "all", query: "" };

    const setActive = (buttons, activeButton) => {
      buttons.forEach((button) => {
        const active = button === activeButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    };

    const render = () => {
      let visible = 0;

      cardIndex.forEach(({ card, categories, haystack }) => {
        const categoryMatches = state.category === "all" || categories.includes(state.category);
        const terms = state.query.split(" ").filter(Boolean);
        const searchMatches = terms.every((term) => haystack.includes(term));
        const show = categoryMatches && searchMatches;

        card.hidden = !show;
        if (!show) {
          card.classList.remove("is-open");
          card.querySelector("details")?.removeAttribute("open");
        } else {
          visible += 1;
        }
      });

      if (resultStatus) {
        resultStatus.textContent =
          visible === 1 ? "1 Abkürzung angezeigt" : `${visible} Abkürzungen angezeigt`;
      }
      if (emptyState) emptyState.hidden = visible !== 0;
      grid.hidden = visible === 0;
    };

    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.filterCategory || "all";
        setActive(categoryButtons, button);
        render();
      });
    });

    search?.addEventListener("input", () => {
      state.query = normalize(search.value);
      render();
    });

    resetButton?.addEventListener("click", () => {
      state.category = "all";
      state.query = "";
      if (search) search.value = "";
      setActive(categoryButtons, categoryButtons.find((button) => button.dataset.filterCategory === "all"));
      render();
      search?.focus();
    });

    document.querySelectorAll("[data-open-tip]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const card = id?.startsWith("#") ? document.querySelector(id) : null;
        if (!card) return;

        event.preventDefault();
        state.category = "all";
        state.query = "";
        if (search) search.value = "";
        setActive(categoryButtons, categoryButtons.find((button) => button.dataset.filterCategory === "all"));
        render();
        card.querySelector("details")?.setAttribute("open", "");
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        window.requestAnimationFrame(() => card.scrollIntoView({ behavior, block: "start" }));
      });
    });

    cards.forEach((card) => {
      const details = card.querySelector("details");
      details?.addEventListener("toggle", () => {
        card.classList.toggle("is-open", details.open);
        const label = details.querySelector("[data-details-label]");
        if (label) label.textContent = details.open ? "Abkürzung schließen" : "Abkürzung öffnen";
      });
    });

    render();
  };

  const writeClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Der lokale Fallback bleibt auch bei verweigerter Browser-Freigabe nutzbar.
      }
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.className = "copy-helper";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("copy failed");
  };

  const initCopyButtons = () => {
    const toast = document.querySelector("[data-copy-toast]");
    let toastTimer = null;

    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.dataset.copyTarget || "");
        const label = button.querySelector("[data-copy-label]");
        if (!target || !label) return;

        const original = label.textContent;
        try {
          await writeClipboard(target.textContent || "");
          label.textContent = "Kopiert";
          if (toast) {
            toast.textContent = "Kopiert. Du kannst den Inhalt jetzt direkt einsetzen oder im Studio weiterbauen.";
            toast.classList.add("is-visible");
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
          }
        } catch {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          const range = document.createRange();
          range.selectNodeContents(target);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          label.textContent = "Text markiert";
          if (toast) {
            toast.textContent = "Automatisches Kopieren war nicht möglich. Der Text ist für dich markiert.";
            toast.classList.add("is-visible");
          }
        }

        window.setTimeout(() => {
          label.textContent = original;
        }, 2400);
      });
    });
  };

  if (document.body.classList.contains("hub-page")) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        initFilters();
        initCopyButtons();
      }, 0);
    });
  }
})();

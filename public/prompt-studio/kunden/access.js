(() => {
  "use strict";

  const gateway = document.querySelector("[data-access-gateway]");
  if (!gateway) return;

  const manualForm = gateway.querySelector("[data-manual-form]");
  const codeInput = gateway.querySelector("[data-code-input]");
  const status = gateway.querySelector("[data-access-status]");
  const bootRequest = window.__ncPraxisAccessRequest;

  try {
    delete window.__ncPraxisAccessRequest;
  } catch {
    window.__ncPraxisAccessRequest = null;
  }

  const hideGateway = () => {
    document.documentElement.classList.add("access-resolving");
  };

  const showError = (message) => {
    document.documentElement.classList.remove("access-qr", "access-resolving");
    document.documentElement.classList.remove("access-status-pending");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-success");
    status.classList.add("is-visible");
  };

  const authenticate = async (body) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("../auth.php", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
        signal: controller.signal,
      });
      return { response };
    } catch (error) {
      return { error };
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const finishAuthentication = async (result) => {
    const response = result && result.response;
    if (response?.status === 204) {
      if (!result.redirectStarted) window.location.replace("../");
      return true;
    }

    if (response?.status === 401 || response?.status === 429) {
      showError("Der Zugang konnte nicht bestätigt werden. Prüfe den Code oder öffne den QR-Link erneut.");
      return false;
    }

    showError("Die Verbindung war kurz unterbrochen. Bitte versuche es noch einmal.");
    return false;
  };

  const params = new URLSearchParams(window.location.search);
  const state = params.get("status");

  if (status && state) {
    status.classList.add("is-visible");
    if (state === "signedout") {
      status.textContent = "Du bist sicher abgemeldet.";
      status.classList.add("is-success");
    } else if (state === "required") {
      status.textContent = "Bitte nutze deinen QR-Zugang oder gib deinen persönlichen Zugangscode ein.";
    } else {
      status.textContent = "Der Zugang konnte nicht bestätigt werden. Prüfe den Code oder öffne den QR-Link erneut.";
    }
    document.documentElement.classList.remove("access-status-pending");
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (bootRequest && typeof bootRequest.then === "function") {
    hideGateway();
    bootRequest.then(finishAuthentication);
  } else {
    document.documentElement.classList.remove("access-qr", "access-resolving");
  }

  codeInput?.addEventListener("input", () => {
    const compact = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    codeInput.value = compact.match(/.{1,4}/g)?.join("-") || compact;
  });

  manualForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const compact = String(codeInput?.value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z0-9]{8,32}$/.test(compact)) {
      showError("Bitte gib deinen vollständigen Zugangscode ein.");
      codeInput?.focus();
      return;
    }

    hideGateway();
    const result = await authenticate(new URLSearchParams({ code: compact }));
    await finishAuthentication(result);
  });
})();

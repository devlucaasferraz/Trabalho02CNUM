/** Preferência visual local, independente dos dados e do cálculo numérico. */
const preferenceKey = "entre-pontos-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function savedTheme() {
  try {
    const value = localStorage.getItem(preferenceKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const dark = theme === "dark";
  const button = document.getElementById("toggle-theme");
  if (button) {
    const action = dark ? "Ativar modo claro" : "Ativar modo escuro";
    button.setAttribute("aria-label", action);
    button.setAttribute("aria-pressed", String(dark));
    button.title = action;
    document.getElementById("theme-label").textContent = dark
      ? "Modo claro"
      : "Modo escuro";
  }
}

applyTheme(savedTheme() ?? (systemTheme.matches ? "dark" : "light"));

export function initializeTheme() {
  applyTheme(document.documentElement.dataset.theme);
  document.getElementById("toggle-theme").addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(preferenceKey, next);
    } catch {
      // O botão continua funcional mesmo com armazenamento local bloqueado.
    }
  });
  systemTheme.addEventListener("change", (event) => {
    if (!savedTheme()) applyTheme(event.matches ? "dark" : "light");
  });
}

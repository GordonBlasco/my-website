(() => {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch {
    // Storage can be unavailable in hardened or private browsing contexts.
  }
})();

import { initDatabase } from "./db.js";
import { start } from "./router.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initDatabase();
    start();
  } catch (err) {
    const screen = document.getElementById("screen");
    if (screen) {
      screen.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
          <p class="text-error font-headline-md text-headline-md">Erro ao inicializar o app</p>
          <p class="text-on-surface-variant font-body-md text-body-md text-sm">${err.message ?? "Erro desconhecido"}</p>
        </div>
      `;
    }
    console.error("[PowerUp] initDatabase failed:", err);
  }
});

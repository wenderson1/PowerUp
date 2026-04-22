import { getWeightHistory } from "../dal.js";
import { navigate } from "../router.js";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(isoString) {
  const d = new Date(isoString.replace(" ", "T"));
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export async function render(container, params) {
  const exerciseId = params && params.id ? parseInt(params.id, 10) : null;
  const ctx = window._exerciseContext || {};

  const backBtn = document.getElementById("btn-back");
  backBtn.classList.remove("invisible");
  backBtn.onclick = () =>
    ctx.workoutId ? navigate("#/workout/" + ctx.workoutId) : navigate("#/");

  if (!exerciseId || isNaN(exerciseId)) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Exercício não encontrado.</p>
      </div>`;
    return;
  }

  if (!ctx.exerciseId) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Contexto do exercício não disponível.</p>
        <p class="text-on-surface-variant text-sm font-body-md">Volte ao treino e tente novamente.</p>
      </div>`;
    return;
  }

  let history;
  try {
    history = await getWeightHistory(exerciseId, 10);
  } catch (err) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Erro ao carregar histórico.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">${escapeHtml(err.message)}</p>
      </div>`;
    return;
  }

  const listHTML =
    history.length === 0
      ? `<div class="flex flex-col items-center justify-center py-12 gap-4 text-center">
           <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">monitor_weight</span>
           <p class="text-on-surface-variant font-body-md text-body-md">Nenhum peso registrado ainda.</p>
         </div>`
      : history
          .map(
            (entry) => `
          <div class="bg-surface-container rounded-lg p-lg border border-outline-variant flex items-center justify-between">
            <span class="font-label-bold text-label-bold text-on-surface">${entry.weight_kg} kg</span>
            <span class="text-on-surface-variant text-sm font-body-md">${formatDate(entry.logged_at)}</span>
          </div>`,
          )
          .join("");

  container.innerHTML = `
    <div class="space-y-4 pt-2 pb-24">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-primary">${escapeHtml(ctx.exerciseName)}</h2>
        ${ctx.workoutName ? `<p class="text-on-surface-variant text-sm font-body-md mt-xs">em ${escapeHtml(ctx.workoutName)}</p>` : ""}
      </div>
      <div class="space-y-3">${listHTML}</div>
    </div>`;
}

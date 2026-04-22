import { getSessionExercises } from "../dal.js";
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
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export async function render(container, params) {
  const sessionId = params && params.id ? parseInt(params.id, 10) : null;

  const backBtn = document.getElementById("btn-back");
  backBtn.classList.remove("invisible");
  backBtn.onclick = () => navigate("#/history");

  if (!sessionId || isNaN(sessionId)) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Sessão não encontrada.</p>
      </div>`;
    return;
  }

  const ctx = window._sessionLogContext || {};
  const title = ctx.workoutName ? escapeHtml(ctx.workoutName) : "Sessão";
  const subtitle = ctx.startedAt ? formatDate(ctx.startedAt) : "";

  let exercises;
  try {
    exercises = await getSessionExercises(sessionId);
  } catch (err) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Erro ao carregar sessão.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">${escapeHtml(err.message)}</p>
      </div>`;
    return;
  }

  const listHTML =
    exercises.length === 0
      ? `<div class="flex flex-col items-center justify-center py-12 gap-4 text-center">
           <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">fitness_center</span>
           <p class="text-on-surface-variant font-body-md text-body-md">Nenhum exercício registrado.</p>
         </div>`
      : exercises
          .map(
            (ex) => `
          <div class="session-log-ex-row bg-surface-container rounded-lg p-lg border border-outline-variant
                      flex items-center gap-md cursor-pointer active:bg-surface-container-high transition-colors"
               data-exercise-id="${ex.exercise_id}"
               data-exercise-name="${escapeHtml(ex.exercise_name)}">
            <span class="material-symbols-outlined flex-shrink-0 ${ex.completed ? "text-primary" : "text-on-surface-variant"}"
                  style="font-size:22px;font-variation-settings:'FILL' ${ex.completed ? 1 : 0}">
              ${ex.completed ? "check_circle" : "radio_button_unchecked"}
            </span>
            <div class="flex flex-col flex-1">
              <span class="font-label-bold text-label-bold ${ex.completed ? "text-on-surface" : "text-on-surface-variant"}">${escapeHtml(ex.exercise_name)}</span>
              <span class="text-sm font-body-md text-on-surface-variant">${ex.weight_kg != null ? ex.weight_kg + " kg" : "—"}</span>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant" style="font-size:18px">chevron_right</span>
          </div>`,
          )
          .join("");

  container.innerHTML = `
    <div class="space-y-4 pt-2 pb-24">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-primary">${title}</h2>
        ${subtitle ? `<p class="text-on-surface-variant text-sm font-body-md mt-xs">${subtitle}</p>` : ""}
      </div>
      <div class="space-y-3">${listHTML}</div>
    </div>`;

  container.querySelectorAll(".session-log-ex-row").forEach((row) => {    row.addEventListener("click", () => {
      window._exerciseContext = {
        exerciseId: Number(row.dataset.exerciseId),
        exerciseName: row.dataset.exerciseName,
        workoutId: ctx.workoutId || null,
        workoutName: ctx.workoutName || "",
        backRoute: "#/session-log/" + sessionId,
      };
      navigate("#/exercise-history/" + row.dataset.exerciseId);
    });
  });
}

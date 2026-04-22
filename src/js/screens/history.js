import { getCompletedSessions } from "../dal.js";
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

export async function render(container) {
  const backBtn = document.getElementById("btn-back");
  backBtn.classList.add("invisible");
  backBtn.onclick = null;

  let sessions;
  try {
    sessions = await getCompletedSessions();
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
    sessions.length === 0
      ? `<div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
           <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">history</span>
           <p class="text-on-surface-variant font-body-md text-body-md">Nenhum treino realizado ainda.</p>
           <p class="text-on-surface-variant font-body-md text-body-md text-sm">Seu histórico aparecerá aqui após concluir um treino.</p>
         </div>`
      : sessions
          .map(
            (s) => `
          <div class="bg-surface-container rounded-lg p-lg border border-outline-variant
                      flex items-center justify-between cursor-pointer active:bg-surface-container-high
                      transition-colors session-card"
               data-session-id="${s.id}"
               data-workout-name="${escapeHtml(s.workout_name)}"
               data-started-at="${escapeHtml(s.started_at)}">
            <div class="flex flex-col gap-xs">
              <span class="font-label-bold text-label-bold text-on-surface">${escapeHtml(s.workout_name)}</span>
              <span class="text-on-surface-variant text-sm font-body-md">${formatDate(s.started_at)}</span>
              <span class="text-on-surface-variant text-sm font-body-md">${s.exercise_count} exercício${s.exercise_count !== 1 ? "s" : ""} feito${s.exercise_count !== 1 ? "s" : ""}</span>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>`,
          )
          .join("");

  container.innerHTML = `
    <div class="space-y-4 pt-2 pb-24">
      <h2 class="text-headline-lg font-headline-lg text-primary">Histórico</h2>
      <div class="space-y-3">${listHTML}</div>
    </div>`;

  container.querySelectorAll(".session-card").forEach((card) => {
    card.addEventListener("click", () => {
      window._sessionLogContext = {
        workoutName: card.dataset.workoutName,
        startedAt: card.dataset.startedAt,
      };
      navigate("#/session-log/" + card.dataset.sessionId);
    });
  });
}

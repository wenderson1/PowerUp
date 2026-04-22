import {
  getWorkouts,
  getExercises,
  logWeight,
  markExerciseDone,
  finishSession,
  getWeightHistory,
} from "../dal.js";
import { navigate } from "../router.js";

// In-memory state for current session (reset on each render call)
let doneSet = new Set(); // sessionExerciseId values
let seMap = {}; // exerciseId → sessionExerciseId

export async function render(container, params) {
  const sessionId = params && params.id ? parseInt(params.id, 10) : null;
  const workoutId = window._sessionWorkoutId
    ? parseInt(window._sessionWorkoutId, 10)
    : null;

  // Wire back button
  const backBtn = document.getElementById("btn-back");
  backBtn.classList.remove("invisible");
  backBtn.onclick = () => navigate(workoutId ? "#/workout/" + workoutId : "#/");

  if (!sessionId || isNaN(sessionId) || !workoutId || isNaN(workoutId)) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Sessão inválida.</p>
      </div>`;
    return;
  }

  let workout, exercises;
  try {
    const allWorkouts = await getWorkouts();
    workout = allWorkouts.find((w) => Number(w.id) === workoutId);
    exercises = await getExercises(workoutId);
  } catch (err) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Erro ao carregar sessão.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">${err.message}</p>
      </div>`;
    return;
  }

  // Reset state on each full render
  doneSet = new Set();
  seMap = {};

  const totalCount = exercises.length;

  const rowsHTML = exercises
    .map(
      (ex) => `
    <div class="session-exercise-row bg-surface-container rounded-lg border border-outline-variant transition-opacity"
         data-exercise-id="${ex.id}">
      <div class="row-header p-lg flex items-center justify-between cursor-pointer active:bg-surface-container-high transition-colors"
           data-exercise-id="${ex.id}">
        <div class="flex items-center gap-md flex-1 min-w-0">
          <button class="btn-done-toggle text-on-surface-variant active:scale-90 transition-transform flex-shrink-0"
                  data-exercise-id="${ex.id}" aria-label="Marcar como feito">
            <span class="done-icon material-symbols-outlined" style="font-size:28px">check_circle</span>
          </button>
          <span class="exercise-name font-label-bold text-label-bold text-on-surface truncate">
            ${escapeHtml(ex.name)}
          </span>
        </div>
        <div class="flex items-center gap-sm flex-shrink-0 ml-md">
          <input type="number" inputmode="decimal" placeholder="0"
            class="weight-input w-16 bg-surface-container-high rounded p-sm border border-outline-variant
                   text-on-surface font-body-md text-body-md text-center focus:border-primary outline-none"
            min="0" step="0.5" />
          <span class="text-on-surface-variant font-body-md text-body-md text-sm">kg</span>
        </div>
      </div>
      <div id="detail-${ex.id}" class="detail-panel border-t border-outline-variant px-lg pb-md pt-sm"
           style="display:none">
        <div class="flex items-center justify-between gap-md">
          <span class="detail-text text-on-surface-variant text-sm font-body-md">Carregando...</span>
          <button class="btn-ex-full-history text-primary text-sm font-label-bold flex items-center gap-xs"
                  data-exercise-id="${ex.id}" data-exercise-name="${escapeHtml(ex.name)}" aria-label="Ver histórico completo">
            <span class="material-symbols-outlined" style="font-size:16px">history</span>
            Ver histórico
          </button>
        </div>
      </div>
    </div>`,
    )
    .join("");

  container.innerHTML = `
    <div class="space-y-4 pt-2 pb-32">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-primary">${escapeHtml(workout ? workout.name : "Treino")}</h2>
        <p id="progress-text" class="text-on-surface-variant font-body-md text-body-md mt-xs">
          0 / ${totalCount} exercícios feitos
        </p>
      </div>
      <div class="space-y-3">${rowsHTML}</div>
    </div>
    <div class="fixed bottom-16 inset-x-0 px-4 pb-4 bg-background/90">
      <button id="btn-finish-session"
        class="w-full bg-primary text-on-primary font-label-bold text-label-bold py-4 rounded-full
               flex items-center justify-center gap-sm opacity-50 pointer-events-none transition-all">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">check</span>
        Finalizar Treino
      </button>
    </div>`;

  // Wire done toggles
  container.querySelectorAll(".btn-done-toggle").forEach((btn) => {
    btn.addEventListener("click", () =>
      handleToggle(btn, sessionId, totalCount),
    );
  });

  // Wire row click to expand detail (whole row except buttons and input)
  exercises.forEach((ex) => {
    const rowEl = container.querySelector(
      `.session-exercise-row[data-exercise-id="${ex.id}"]`,
    );
    if (!rowEl) return;
    rowEl.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.target.closest("button")) return;
      toggleExerciseDetail(ex.id);
    });
  });

  // Wire full history buttons
  container.querySelectorAll(".btn-ex-full-history").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window._exerciseContext = {
        exerciseId: Number(btn.dataset.exerciseId),
        exerciseName: btn.dataset.exerciseName,
        workoutId,
        workoutName: workout ? workout.name : "",
        backRoute: "#/session/" + sessionId,
      };
      navigate("#/exercise-history/" + btn.dataset.exerciseId);
    });
  });

  // Wire finish button
  document
    .getElementById("btn-finish-session")
    .addEventListener("click", async () => {
      try {
        await finishSession(sessionId);
        navigate("#/");
      } catch (err) {
        alert("Erro ao finalizar treino: " + err.message);
      }
    });
}

async function handleToggle(btn, sessionId, totalCount) {
  const exerciseId = Number(btn.dataset.exerciseId);
  const row = btn.closest(".session-exercise-row");
  const nameEl = row.querySelector(".exercise-name");
  const weightInput = row.querySelector(".weight-input");
  const iconEl = btn.querySelector(".done-icon");

  const alreadyDone = doneSet.has(seMap[exerciseId]);

  if (alreadyDone) {
    // Undo visual state (no DB change)
    const seId = seMap[exerciseId];
    doneSet.delete(seId);
    row.classList.remove("opacity-50");
    nameEl.classList.remove("line-through");
    iconEl.style.fontVariationSettings = "";
    btn.classList.remove("text-primary");
    btn.classList.add("text-on-surface-variant");
    weightInput.disabled = false;
  } else {
    // Log weight + mark done
    const kg = parseFloat(weightInput.value) || 0;
    try {
      const se = await logWeight(sessionId, exerciseId, kg);
      const seId = Number(se.id);
      await markExerciseDone(seId);
      seMap[exerciseId] = seId;
      doneSet.add(seId);

      row.classList.add("opacity-50");
      nameEl.classList.add("line-through");
      iconEl.style.fontVariationSettings = "'FILL' 1";
      btn.classList.add("text-primary");
      btn.classList.remove("text-on-surface-variant");
      weightInput.disabled = true;

      // Close detail panel if open
      const detail = document.getElementById(`detail-${exerciseId}`);
      if (detail) detail.style.display = "none";
    } catch (err) {
      alert("Erro ao registrar exercício: " + err.message);
      return;
    }
  }

  updateProgress(totalCount);
}

function updateProgress(totalCount) {
  const doneCount = doneSet.size;
  const progressEl = document.getElementById("progress-text");
  if (progressEl) {
    progressEl.textContent = `${doneCount} / ${totalCount} exercícios feitos`;
  }

  const finishBtn = document.getElementById("btn-finish-session");
  if (finishBtn) {
    if (doneCount > 0) {
      finishBtn.classList.remove("opacity-50", "pointer-events-none");
    } else {
      finishBtn.classList.add("opacity-50", "pointer-events-none");
    }
  }
}

async function toggleExerciseDetail(exerciseId) {
  const detail = document.getElementById(`detail-${exerciseId}`);
  if (!detail) return;

  const isOpen = detail.style.display === "block";
  if (isOpen) {
    detail.style.display = "none";
    return;
  }

  detail.style.display = "block";
  const textEl = detail.querySelector(".detail-text");
  textEl.textContent = "Carregando...";

  try {
    const history = await getWeightHistory(Number(exerciseId), 1);
    if (history.length === 0) {
      textEl.textContent = "Nenhum peso registrado ainda";
    } else {
      const entry = history[0];
      const d = new Date(entry.logged_at.replace(" ", "T"));
      const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      textEl.innerHTML = `Último: <span class="text-on-surface font-label-bold">${entry.weight_kg} kg</span> &middot; ${date}`;
    }
  } catch {
    textEl.textContent = "Erro ao carregar";
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

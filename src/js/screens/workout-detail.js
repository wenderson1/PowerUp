import {
  getWorkouts,
  getExercises,
  addExercise,
  removeExercise,
  createSession,
} from "../dal.js";
import { navigate } from "../router.js";

export async function render(container, params) {
  const workoutId = params && params.id ? parseInt(params.id, 10) : null;

  // Wire back button
  const backBtn = document.getElementById("btn-back");
  backBtn.classList.remove("invisible");
  backBtn.onclick = () => navigate("#/");

  if (!workoutId || isNaN(workoutId)) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Treino não encontrado.</p>
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
        <p class="text-error font-body-md text-body-md">Erro ao carregar exercícios.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">${err.message}</p>
      </div>`;
    return;
  }

  if (!workout) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">search_off</span>
        <p class="text-error font-body-md text-body-md">Treino não encontrado.</p>
      </div>`;
    return;
  }

  const listHTML =
    exercises.length === 0
      ? `<div class="flex flex-col items-center justify-center py-12 gap-4 text-center">
           <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">fitness_center</span>
           <p class="text-on-surface-variant font-body-md text-body-md">Nenhum exercício adicionado ainda.</p>
           <p class="text-on-surface-variant font-body-md text-body-md text-sm">Adicione exercícios para montar seu treino.</p>
           <button id="btn-empty-add-exercise"
             class="mt-2 bg-primary text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-full flex items-center gap-sm active:scale-95 transition-transform">
             <span class="material-symbols-outlined" style="font-size:18px">add</span>
             Adicionar exercício
           </button>
         </div>`
      : exercises
          .map(
            (ex) => `
          <div class="bg-surface-container rounded-lg p-lg border border-outline-variant flex items-center justify-between">
            <div class="flex items-center gap-md">
              <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-on-surface-variant" style="font-size:18px">fitness_center</span>
              </div>
              <span class="font-label-bold text-label-bold text-on-surface">${escapeHtml(ex.name)}</span>
            </div>
            <div class="flex items-center gap-xs">
              <button id="btn-ex-history-${ex.id}"
                      class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
                      aria-label="Histórico de pesos">
                <span class="material-symbols-outlined" style="font-size:20px">history</span>
              </button>
              <button class="btn-remove-exercise text-on-surface-variant hover:text-error transition-colors p-sm"
                      data-exercise-id="${ex.id}" aria-label="Remover exercício">
                <span class="material-symbols-outlined" style="font-size:20px">remove_circle</span>
              </button>
            </div>
          </div>`,
          )
          .join("");

  const startButtonHTML =
    exercises.length > 0
      ? `<div class="pt-md pb-xl flex justify-center">
           <button id="btn-start-workout"
             class="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-full
                    flex items-center gap-sm active:scale-95 transition-transform">
             <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">play_arrow</span>
             Iniciar Treino
           </button>
         </div>`
      : "";

  container.innerHTML = `
    <div class="space-y-4 pt-2 pb-24">
      <h2 class="text-headline-lg font-headline-lg text-primary">${escapeHtml(workout.name)}</h2>
      <div id="exercise-list" class="space-y-3">${listHTML}</div>
      ${startButtonHTML}
    </div>
    <button id="fab-add-exercise"
      class="fixed bottom-24 right-5 w-14 h-14 bg-surface-container-highest border border-outline-variant text-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-50">
      <span class="material-symbols-outlined text-2xl">add</span>
    </button>`;

  // Exercise history buttons
  exercises.forEach((ex) => {
    const histBtn = document.getElementById(`btn-ex-history-${ex.id}`);
    if (histBtn) {
      histBtn.addEventListener("click", () => {
        window._exerciseContext = {
          exerciseId: ex.id,
          exerciseName: ex.name,
          workoutId,
          workoutName: workout.name,
        };
        navigate("#/exercise-history/" + ex.id);
      });
    }
  });

  // Remove exercise buttons
  container.querySelectorAll(".btn-remove-exercise").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!window.confirm("Remover este exercício?")) return;
      try {
        await removeExercise(Number(btn.dataset.exerciseId));
        await render(container, params);
      } catch (err) {
        alert("Erro ao remover exercício: " + err.message);
      }
    });
  });

  // Start workout button
  const startBtn = document.getElementById("btn-start-workout");
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      try {
        const session = await createSession(workoutId);
        window._sessionWorkoutId = workoutId;
        navigate("#/session/" + session.id);
      } catch (err) {
        alert("Erro ao iniciar treino: " + err.message);
      }
    });
  }

  // Empty state button → show add form
  const emptyBtn = document.getElementById("btn-empty-add-exercise");
  if (emptyBtn) {
    emptyBtn.addEventListener("click", () =>
      showAddForm(container, workoutId, params),
    );
  }

  // FAB → show add form
  document.getElementById("fab-add-exercise").addEventListener("click", () => {
    showAddForm(container, workoutId, params);
  });
}

function showAddForm(container, workoutId, params) {
  if (document.getElementById("add-exercise-form")) return;

  const form = document.createElement("div");
  form.id = "add-exercise-form";
  form.className =
    "fixed inset-x-4 bottom-28 z-50 bg-surface-container-high rounded-xl border border-primary p-lg shadow-xl";
  form.innerHTML = `
    <h3 class="font-label-bold text-label-bold text-on-surface mb-md">Novo Exercício</h3>
    <input id="exercise-name-input" type="text" placeholder="Nome do exercício"
      class="w-full bg-surface-container rounded p-sm border border-outline-variant
             text-on-surface font-body-md text-body-md focus:border-primary outline-none mb-md" />
    <p id="exercise-name-error" class="text-error text-sm font-body-md mb-sm hidden">O nome não pode ser vazio.</p>
    <div class="flex gap-sm justify-end">
      <button id="btn-cancel-exercise"
        class="text-on-surface-variant font-label-bold text-label-bold px-md py-sm rounded hover:bg-surface-container transition-colors">
        Cancelar
      </button>
      <button id="btn-save-exercise"
        class="bg-primary text-on-primary font-label-bold text-label-bold px-md py-sm rounded hover:opacity-90 transition-opacity">
        Salvar
      </button>
    </div>`;

  document.body.appendChild(form);
  const input = document.getElementById("exercise-name-input");
  input.focus();

  document
    .getElementById("btn-cancel-exercise")
    .addEventListener("click", () => {
      form.remove();
    });

  document
    .getElementById("btn-save-exercise")
    .addEventListener("click", async () => {
      const name = input.value.trim();
      const errorEl = document.getElementById("exercise-name-error");
      if (!name) {
        errorEl.classList.remove("hidden");
        input.focus();
        return;
      }
      errorEl.classList.add("hidden");
      try {
        await addExercise(workoutId, name);
        form.remove();
        await render(container, params);
      } catch (err) {
        alert("Erro ao adicionar exercício: " + err.message);
      }
    });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-save-exercise").click();
    if (e.key === "Escape") form.remove();
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

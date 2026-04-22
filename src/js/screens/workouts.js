import { getWorkouts, createWorkout, deleteWorkout } from "../dal.js";
import { navigate } from "../router.js";

export async function render(container) {
  const backBtn = document.getElementById("btn-back");
  backBtn.classList.add("invisible");
  backBtn.onclick = null;

  let workouts;
  try {
    workouts = await getWorkouts();
  } catch (err) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-error" style="font-size:48px">error</span>
        <p class="text-error font-body-md text-body-md">Erro ao carregar treinos.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">${err.message}</p>
      </div>`;
    return;
  }

  const listHTML =
    workouts.length === 0
      ? `<div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
           <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">fitness_center</span>
           <p class="text-on-surface-variant font-body-md text-body-md">Nenhum treino cadastrado ainda.</p>
           <p class="text-on-surface-variant font-body-md text-body-md text-sm">Toque em + para criar seu primeiro treino.</p>
         </div>`
      : workouts
          .map(
            (w) => `
          <div class="bg-surface-container rounded-lg p-lg border border-outline-variant flex items-center justify-between cursor-pointer active:bg-surface-container-high"
               data-workout-id="${w.id}" role="button">
            <span class="font-label-bold text-label-bold text-on-surface">${escapeHtml(w.name)}</span>
            <div class="flex items-center gap-sm">
              <button class="btn-delete text-on-surface-variant hover:text-error transition-colors p-sm"
                      data-workout-id="${w.id}" aria-label="Deletar treino">
                <span class="material-symbols-outlined" style="font-size:20px">delete</span>
              </button>
              <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>`,
          )
          .join("");

  container.innerHTML = `
    <div class="space-y-4 pt-2 pb-24">
      <h2 class="text-headline-lg font-headline-lg text-primary">Meus Treinos</h2>
      <div id="workout-list" class="space-y-3">${listHTML}</div>
    </div>
    <button id="fab-add"
      class="fixed bottom-24 right-5 w-14 h-14 bg-surface-container-highest border border-outline-variant text-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-50">
      <span class="material-symbols-outlined text-2xl">add</span>
    </button>`;

  // Card navigation
  container
    .querySelectorAll("[data-workout-id][role=button]")
    .forEach((card) => {
      card.addEventListener("click", () => {
        navigate("#/workout/" + card.dataset.workoutId);
      });
    });

  // Delete buttons
  container.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (
        !window.confirm("Deletar este treino? Esta ação não pode ser desfeita.")
      )
        return;
      try {
        await deleteWorkout(Number(btn.dataset.workoutId));
        await render(container);
      } catch (err) {
        alert("Erro ao deletar treino: " + err.message);
      }
    });
  });

  // FAB → show create form
  document
    .getElementById("fab-add")
    .addEventListener("click", () => showCreateForm(container));
}

function showCreateForm(container) {
  if (document.getElementById("create-workout-form")) return;

  const form = document.createElement("div");
  form.id = "create-workout-form";
  form.className =
    "fixed inset-x-4 bottom-28 z-50 bg-surface-container-high rounded-xl border border-primary p-lg shadow-xl";
  form.innerHTML = `
    <h3 class="font-label-bold text-label-bold text-on-surface mb-md">Novo Treino</h3>
    <input id="workout-name-input" type="text" placeholder="Nome do treino"
      class="w-full bg-surface-container rounded p-sm border border-outline-variant
             text-on-surface font-body-md text-body-md focus:border-primary outline-none mb-md" />
    <p id="workout-name-error" class="text-error text-sm font-body-md mb-sm hidden">O nome não pode ser vazio.</p>
    <div class="flex gap-sm justify-end">
      <button id="btn-cancel-workout"
        class="text-on-surface-variant font-label-bold text-label-bold px-md py-sm rounded hover:bg-surface-container transition-colors">
        Cancelar
      </button>
      <button id="btn-save-workout"
        class="bg-primary text-on-primary font-label-bold text-label-bold px-md py-sm rounded hover:opacity-90 transition-opacity">
        Salvar
      </button>
    </div>`;

  document.body.appendChild(form);
  const input = document.getElementById("workout-name-input");
  input.focus();

  document
    .getElementById("btn-cancel-workout")
    .addEventListener("click", () => {
      form.remove();
    });

  document
    .getElementById("btn-save-workout")
    .addEventListener("click", async () => {
      const name = input.value.trim();
      const errorEl = document.getElementById("workout-name-error");
      if (!name) {
        errorEl.classList.remove("hidden");
        input.focus();
        return;
      }
      errorEl.classList.add("hidden");
      try {
        await createWorkout(name);
        form.remove();
        await render(container);
      } catch (err) {
        alert("Erro ao criar treino: " + err.message);
      }
    });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-save-workout").click();
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

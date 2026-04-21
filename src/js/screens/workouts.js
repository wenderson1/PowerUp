export function render(container) {
  container.innerHTML = `
    <div class="space-y-6 pt-2">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-primary">Meus Treinos</h2>
      </div>
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">fitness_center</span>
        <p class="text-on-surface-variant font-body-md text-body-md">Nenhum treino cadastrado ainda.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">Em breve você poderá criar seus treinos aqui.</p>
      </div>
    </div>
  `;
}

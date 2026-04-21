export function render(container) {
  container.innerHTML = `
    <div class="space-y-6 pt-2">
      <div>
        <h2 class="text-headline-lg font-headline-lg text-primary">Histórico</h2>
      </div>
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span class="material-symbols-outlined text-on-surface-variant" style="font-size:48px">history</span>
        <p class="text-on-surface-variant font-body-md text-body-md">Nenhuma sessão registrada ainda.</p>
        <p class="text-on-surface-variant font-body-md text-body-md text-sm">Seu histórico de treinos aparecerá aqui.</p>
      </div>
    </div>
  `;
}

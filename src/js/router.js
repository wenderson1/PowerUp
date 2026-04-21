import * as workoutsScreen from './screens/workouts.js';
import * as historyScreen from './screens/history.js';

const routes = {
  '':         workoutsScreen,
  '#/':       workoutsScreen,
  '#/history': historyScreen,
};

function getScreen(hash) {
  return routes[hash] ?? workoutsScreen;
}

function render() {
  const hash = window.location.hash || '';
  const screen = getScreen(hash);
  const container = document.getElementById('screen');
  if (container) screen.render(container);

  // Update active tab
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const route = btn.getAttribute('data-route');
    const isActive = route === hash || (hash === '' && route === '#/');
    btn.classList.toggle('active', isActive);
  });
}

export function start() {
  window.addEventListener('hashchange', render);
  render();
}

export function navigate(hash) {
  window.location.hash = hash;
}

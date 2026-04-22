import * as workoutsScreen from "./screens/workouts.js";
import * as historyScreen from "./screens/history.js";
import * as workoutDetailScreen from "./screens/workout-detail.js";
import * as sessionScreen from "./screens/session.js";
import * as sessionLogScreen from "./screens/session-log.js";
import * as exerciseHistoryScreen from "./screens/exercise-history.js";

const routes = {
  "": workoutsScreen,
  "#/": workoutsScreen,
  "#/history": historyScreen,
};

let currentParams = {};

function getScreen(hash) {
  if (routes[hash]) {
    currentParams = {};
    return routes[hash];
  }
  const workoutMatch = hash.match(/^#\/workout\/(\d+)$/);
  if (workoutMatch) {
    currentParams = { id: workoutMatch[1] };
    return workoutDetailScreen;
  }
  const sessionMatch = hash.match(/^#\/session\/(\d+)$/);
  if (sessionMatch) {
    currentParams = { id: sessionMatch[1] };
    return sessionScreen;
  }
  const sessionLogMatch = hash.match(/^#\/session-log\/(\d+)$/);
  if (sessionLogMatch) {
    currentParams = { id: sessionLogMatch[1] };
    return sessionLogScreen;
  }
  const exerciseHistoryMatch = hash.match(/^#\/exercise-history\/(\d+)$/);
  if (exerciseHistoryMatch) {
    currentParams = { id: exerciseHistoryMatch[1] };
    return exerciseHistoryScreen;
  }
  currentParams = {};
  return workoutsScreen;
}

export function getRouteParams() {
  return currentParams;
}

function render() {
  const hash = window.location.hash || "";
  const screen = getScreen(hash);
  const container = document.getElementById("screen");
  if (container) screen.render(container, currentParams);

  // Update active tab
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    const route = btn.getAttribute("data-route");
    const isActive = route === hash || (hash === "" && route === "#/");
    btn.classList.toggle("active", isActive);
  });
}

export function start() {
  window.addEventListener("hashchange", render);

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.getAttribute("data-route");
      if (route) navigate(route);
    });
  });

  render();
}

export function navigate(hash) {
  window.location.hash = hash;
}

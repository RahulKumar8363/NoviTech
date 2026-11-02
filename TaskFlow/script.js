// TaskFlow: DOM, events, arrays, objects, localStorage and async/await.

const STORAGE_KEY = "taskflow.tasks.v1";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("#searchInput");
const filterSelect = document.querySelector("#filterSelect");
const formMessage = document.querySelector("#formMessage");
const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const remainingCount = document.querySelector("#remainingCount");
const visibleCount = document.querySelector("#visibleCount");
const clearCompletedButton = document.querySelector("#clearCompleted");
const todayLabel = document.querySelector("#todayLabel");

let tasks = loadTasks();

todayLabel.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short", month: "short", day: "numeric"
}).format(new Date());

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
    showMessage("Could not save tasks in this browser.");
  }
}

function showMessage(text = "", isError = true) {
  formMessage.textContent = text;
  formMessage.style.color = isError ? "#c34d59" : "#159b73";
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = tasks.length - completed;
}

function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  const visibleTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(query);
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !task.completed) ||
      (filter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });

  taskList.replaceChildren();

  if (visibleTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const title = document.createElement("strong");
    title.textContent = tasks.length === 0 ? "Your list is a blank canvas." : "No matching tasks.";

    const description = document.createElement("p");
    description.textContent = tasks.length === 0
      ? "Add your first task above and build some momentum."
      : "Try another search or choose a different filter.";

    empty.append(title, description);
    taskList.append(empty);
  } else {
    visibleTasks.forEach(task => {
      const row = document.createElement("article");
      row.className = `task-item${task.completed ? " is-complete" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-check";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Mark ${task.text} as ${task.completed ? "active" : "completed"}`);
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text; // textContent avoids treating user input as HTML.

      row.append(checkbox, text);

      if (task.completed) {
        const tag = document.createElement("span");
        tag.className = "task-tag";
        tag.textContent = "Completed";
        row.append(tag);
      }

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.textContent = "×";
      deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
      deleteButton.addEventListener("click", () => deleteTask(task.id));

      row.append(deleteButton);
      taskList.append(row);
    });
  }

  visibleCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
  updateStats();
}

function addTask(text) {
  const task = {
    id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks = [task, ...tasks]; // Spread operator creates a new array.
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    showMessage("Please enter a task first.");
    taskInput.focus();
    return;
  }

  if (tasks.some(task => task.text.toLowerCase() === text.toLowerCase())) {
    showMessage("That task is already on your list.");
    return;
  }

  addTask(text);
  taskForm.reset();
  showMessage("Task added successfully.", false);
  taskInput.focus();
});

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

clearCompletedButton.addEventListener("click", () => {
  const before = tasks.length;
  tasks = tasks.filter(task => !task.completed);

  if (tasks.length === before) {
    showMessage("There are no completed tasks to clear.");
    return;
  }

  saveTasks();
  renderTasks();
  showMessage("Completed tasks cleared.", false);
});

// A small real API example to practise fetch + async/await.
// It is intentionally separate from task CRUD so the app works offline too.
async function loadFocusTip() {
  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    if (!response.ok) throw new Error("Could not load a focus tip.");
    const data = await response.json();

    const tipParagraph = document.querySelector(".tip-card p");
    if (data.quote && tipParagraph) {
      tipParagraph.textContent = data.quote;
    }
  } catch (error) {
    // Keep the built-in tip if the API/network is unavailable.
    console.info("Using the built-in focus tip:", error.message);
  }
}

renderTasks();
loadFocusTip();

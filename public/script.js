const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Get references to DOM elements
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const taskDueDateInput = document.getElementById('task-due-date');
const taskList = document.getElementById('task-list');

// Fetch all tasks when the page loads
window.onload = function() {
  fetchTasks();
};

// Fetch tasks from the backend API
function fetchTasks() {
  fetch(`${API_BASE_URL}/tasks`)
    .then(response => response.json())
    .then(tasks => {
      taskList.innerHTML = '';
      tasks.forEach(task => {
        const formattedDate = new Date(task.due_date).toLocaleDateString(); // Format the date
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${task.task_name} - ${formattedDate}</span>
          <button onclick="markAsCompleted('${task.task_id}')"><i class="fas fa-check"></i></button>
          <button class="delete-btn" onclick="deleteTask('${task.task_id}')"><i class="fas fa-trash-alt"></i></button>
        `;
        if (task.completed) {
          li.classList.add('completed');
        }
        taskList.appendChild(li);
      });
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

// Add a new task
taskForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const taskName = taskNameInput.value;
  const dueDate = taskDueDateInput.value;

  fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taskName, dueDate }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Task created successfully') {
      fetchTasks(); // Reload the task list
      taskNameInput.value = '';
      taskDueDateInput.value = '';
    }
  })
  .catch(error => console.error('Error adding task:', error));
});

// Mark a task as completed
function markAsCompleted(taskId) {
  fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
  })
    .then(response => response.json())
    .then(() => {
      fetchTasks(); // Reload the task list
    })
    .catch(error => console.error('Error marking task as completed:', error));
}

// Delete a task
function deleteTask(taskId) {
  fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(() => {
      fetchTasks(); // Reload the task list
    })
    .catch(error => console.error('Error deleting task:', error));
}

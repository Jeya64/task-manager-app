const apiUrl = 'http://localhost:8080/api';
let currentEditId = null;

// 🔧 Helper to escape backticks so they don't break template strings
function escapeBackticks(str) {
  return str.replace(/`/g, '\\`');
}

function loadTasks() {
  fetch(`${apiUrl}/getAllTask`)
    .then(response => response.json())
    .then(data => {
      const tasksDiv = document.getElementById('tasks');
      tasksDiv.innerHTML = '';
      data.forEach(task => {
        tasksDiv.innerHTML += `
          <div class="task">
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-status">Status: ${task.completed ? '✔️ Completed' : '❌ Incomplete'}</div>
            <div class="task-actions">
              <button onclick="editTask(${task.id}, \`${escapeBackticks(task.title)}\`, \`${escapeBackticks(task.description)}\`, ${task.completed})">Edit</button>
              <button onclick="deleteTask(${task.id})" class="delete-btn">Delete</button>
            </div>
          </div>
        `;
      });
    });
}

function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  toast.innerText = message;

  toast.className = 'toast'; // reset classes

  if (type === 'delete') {
    toast.classList.add('delete-toast');
  }

  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2200);

  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

function addTask() {
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');

  if (!titleInput.checkValidity() || !descriptionInput.checkValidity()) {
    titleInput.reportValidity();
    descriptionInput.reportValidity();
    return;
  }

  fetch(`${apiUrl}/createTask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: titleInput.value, description: descriptionInput.value, completed: false })
  }).then(() => {
    titleInput.value = '';
    descriptionInput.value = '';
    loadTasks();
    showToast("✅ Task added successfully!");
  });
}

function deleteTask(id) {
  fetch(`${apiUrl}/deleteTask/${id}`, {
    method: 'DELETE'
  }).then(() => {
    loadTasks();
    showToast("🗑️ Task deleted successfully!", "delete");
  });
}

function editTask(id, title, description, completed) {
  currentEditId = id;
  document.getElementById('editTitle').value = title;
  document.getElementById('editDescription').value = description;
  document.getElementById('editCompleted').checked = completed;

  document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

window.onload = () => {
  loadTasks();

  // Modal update
  document.getElementById('updateBtn').addEventListener('click', () => {
    const updatedTitle = document.getElementById('editTitle');
    const updatedDescription = document.getElementById('editDescription');
    const updatedCompleted = document.getElementById('editCompleted').checked;

    if (!updatedTitle.checkValidity() || !updatedDescription.checkValidity()) {
      updatedTitle.reportValidity();
      updatedDescription.reportValidity();
      return;
    }

    fetch(`${apiUrl}/updateTask/${currentEditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTitle.value,
        description: updatedDescription.value,
        completed: updatedCompleted
      })
    }).then(() => {
      closeModal();
      loadTasks();
      showToast("✏️ Task updated successfully!");
    });
  });

  // Cancel modal
  document.getElementById('cancelBtn').addEventListener('click', () => {
    closeModal();
  });

  // Ensure modal is hidden on load
  document.getElementById('editModal').style.display = 'none';
};

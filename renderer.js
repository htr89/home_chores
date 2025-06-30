async function loadTasks() {
  const res = await fetch('http://localhost:3000/tasks');
  const tasks = await res.json();
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.name} - ${t.assignedTo} - due ${t.dueDate} - ${t.points} points`;
    list.appendChild(li);
  });
}

document.getElementById('taskForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    name: document.getElementById('name').value,
    assignedTo: document.getElementById('assignedTo').value,
    dueDate: document.getElementById('dueDate').value,
    points: document.getElementById('points').value
  };
  await fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  e.target.reset();
  loadTasks();
});

window.addEventListener('DOMContentLoaded', loadTasks);

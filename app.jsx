const { useState, useEffect } = React;

function App() {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    const res = await fetch('http://localhost:3000/tasks');
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      assignedTo: form.assignedTo.value,
      dueDate: form.dueDate.value,
      points: form.points.value
    };
    await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    form.reset();
    loadTasks();
  };

  return (
    React.createElement('div', null,
      React.createElement('h1', null, 'Task Manager'),
      React.createElement('form', { id: 'taskForm', onSubmit: handleSubmit },
        React.createElement('input', { type: 'text', name: 'name', placeholder: 'Task name', required: true }),
        React.createElement('input', { type: 'text', name: 'assignedTo', placeholder: 'Assigned to', required: true }),
        React.createElement('input', { type: 'date', name: 'dueDate', required: true }),
        React.createElement('input', { type: 'number', name: 'points', placeholder: 'Points', required: true }),
        React.createElement('button', { type: 'submit' }, 'Add Task')
      ),
      React.createElement('ul', { id: 'taskList' },
        tasks.map(t => React.createElement('li', { key: t.id }, `${t.name} - ${t.assignedTo} - due ${t.dueDate} - ${t.points} points`))
      )
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));

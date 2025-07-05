const { useState, useEffect } = React;
const {
    Container,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText
} = MaterialUI;

function App() {
    const [tasks, setTasks] = useState([]);

    const loadTasks = async () => {
        const res = await fetch('http://localhost:3000/tasks');
        const data = await res.json();
        setTasks(data);
    };

    useEffect(() => {
        console.log('Form listener registered');
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        form.reset();
        loadTasks();
    };

    return (
        React.createElement(Container, {maxWidth: 'sm'},
            React.createElement('h1', null, 'Task Manager'),
            React.createElement('form', {id: 'taskForm', onSubmit: handleSubmit},
                React.createElement(TextField, {label: 'Task name', name: 'name', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(TextField, {label: 'Assigned to', name: 'assignedTo', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(TextField, {label: 'Due date', name: 'dueDate', type: 'date', InputLabelProps: {shrink: true}, required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(TextField, {label: 'Points', name: 'points', type: 'number', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(Button, {type: 'submit', variant: 'contained', color: 'primary', style: {marginTop: '16px'}}, 'Add Task')
            ),
            React.createElement(List, {id: 'taskList'},
                tasks.map(t => React.createElement(ListItem, {key: t.id},
                    React.createElement(ListItemText, {primary: `${t.name} - ${t.assignedTo}`, secondary: `due ${t.dueDate} - ${t.points} points`})
                ))
            )
        )
    );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));

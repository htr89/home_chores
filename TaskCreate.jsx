const { Container, TextField, Button } = MaterialUI;

function TaskCreate() {
    const navigate = useNavigate();
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
        navigate('list');
    };
    return (
        React.createElement(Container, {maxWidth: 'sm'},
            React.createElement('h1', null, 'Create Task'),
            React.createElement('form', {id: 'taskForm', onSubmit: handleSubmit},
                React.createElement(TextField, {label: 'Task name', name: 'name', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(TextField, {label: 'Assigned to', name: 'assignedTo', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(TextField, {label: 'Due date', name: 'dueDate', type: 'date', InputLabelProps: {shrink: true}, required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(TextField, {label: 'Points', name: 'points', type: 'number', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(Button, {type: 'submit', variant: 'contained', color: 'primary', style: {marginTop: '16px'}}, 'Add Task')
            )
        )
    );
}

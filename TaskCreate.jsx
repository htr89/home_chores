// Access Material UI components directly from the global MaterialUI object

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
        React.createElement(MaterialUI.Container, {maxWidth: 'sm'},
            React.createElement('h1', null, 'Create Task'),
            React.createElement('form', {id: 'taskForm', onSubmit: handleSubmit},
                React.createElement(MaterialUI.TextField, {label: 'Task name', name: 'name', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(MaterialUI.TextField, {label: 'Assigned to', name: 'assignedTo', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(MaterialUI.TextField, {label: 'Due date', name: 'dueDate', type: 'date', InputLabelProps: {shrink: true}, required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(MaterialUI.TextField, {label: 'Points', name: 'points', type: 'number', required: true, fullWidth: true, margin: 'normal'}),
                React.createElement(MaterialUI.Button, {type: 'submit', variant: 'contained', color: 'primary', style: {marginTop: '16px'}}, 'Add Task')
            )
        )
    );
}

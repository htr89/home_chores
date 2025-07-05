const { useState, useEffect } = React;
const {
    Container,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText
} = MaterialUI;
const {
    BrowserRouter,
    Routes,
    Route,
    Link,
    Navigate,
    useNavigate
} = ReactRouterDOM;

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
        navigate('/list');
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

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const loadTasks = async () => {
        const res = await fetch('http://localhost:3000/tasks');
        const data = await res.json();
        setTasks(data);
    };
    useEffect(() => { loadTasks(); }, []);
    return (
        React.createElement(Container, {maxWidth: 'sm'},
            React.createElement('h1', null, 'Task List'),
            React.createElement(List, {id: 'taskList'},
                tasks.map(t => React.createElement(ListItem, {key: t.id},
                    React.createElement(ListItemText, {primary: `${t.name} - ${t.assignedTo}`, secondary: `due ${t.dueDate} - ${t.points} points`})
                ))
            )
        )
    );
}

function App() {
    return (
        React.createElement(BrowserRouter, null,
            React.createElement('div', {style: {display: 'flex'}},
                React.createElement('div', {style: {flex: 1, paddingRight: '16px'}},
                    React.createElement(Routes, null,
                        React.createElement(Route, {path: '/create', element: React.createElement(TaskCreate)}),
                        React.createElement(Route, {path: '/list', element: React.createElement(TaskList)}),
                        React.createElement(Route, {path: '*', element: React.createElement(Navigate, {to: '/create'})})
                    )
                ),
                React.createElement('nav', {style: {width: '200px', borderLeft: '1px solid #ccc', paddingLeft: '16px'}},
                    React.createElement(List, null,
                        React.createElement(ListItem, null,
                            React.createElement(Link, {to: '/create'}, 'Create Task')
                        ),
                        React.createElement(ListItem, null,
                            React.createElement(Link, {to: '/list'}, 'Task List')
                        )
                    )
                )
            )
        )
    );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));

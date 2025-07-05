const { useState, useEffect } = React;
const {
    Container,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText
} = MaterialUI;

// Simple hash-based navigation to avoid external router dependency
const NavigationContext = React.createContext({
    page: 'create',
    navigate: () => {}
});

function NavigationProvider({ children }) {
    const [page, setPage] = useState(window.location.hash.slice(1) || 'create');

    useEffect(() => {
        const handler = () => setPage(window.location.hash.slice(1) || 'create');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    const navigate = (to) => {
        const target = to.replace(/^#/, '');
        window.location.hash = `#${target}`;
    };

    return React.createElement(
        NavigationContext.Provider,
        { value: { page, navigate } },
        children
    );
}

function useNavigate() {
    return React.useContext(NavigationContext).navigate;
}

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
    const { page, navigate } = React.useContext(NavigationContext);
    return (
        React.createElement('div', {style: {display: 'flex'}},
            React.createElement('div', {style: {flex: 1, paddingRight: '16px'}},
                page === 'create' ?
                    React.createElement(TaskCreate) :
                    React.createElement(TaskList)
            ),
            React.createElement('nav', {style: {width: '200px', borderLeft: '1px solid #ccc', paddingLeft: '16px'}},
                React.createElement(List, null,
                    React.createElement(ListItem, null,
                        React.createElement('a', {href: '#create', onClick: () => navigate('create')}, 'Create Task')
                    ),
                    React.createElement(ListItem, null,
                        React.createElement('a', {href: '#list', onClick: () => navigate('list')}, 'Task List')
                    )
                )
            )
        )
    );
}

ReactDOM.render(
    React.createElement(NavigationProvider, null,
        React.createElement(App)
    ),
    document.getElementById('root')
);

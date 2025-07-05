const { Container, List, ListItem, ListItemText } = MaterialUI;

function TaskList() {
    const [tasks, setTasks] = React.useState([]);
    const loadTasks = async () => {
        const res = await fetch('http://localhost:3000/tasks');
        const data = await res.json();
        setTasks(data);
    };
    React.useEffect(() => { loadTasks(); }, []);
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

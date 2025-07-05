const { List, ListItem } = MaterialUI;

function NavigationBar() {
    const navigate = useNavigate();
    return (
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
    );
}

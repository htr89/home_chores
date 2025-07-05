// Access Material UI components directly from the global MaterialUI object

function NavigationBar() {
    const navigate = useNavigate();
    return (
        React.createElement('nav', {style: {width: '200px', borderLeft: '1px solid #ccc', paddingLeft: '16px'}},
            React.createElement(MaterialUI.List, null,
                React.createElement(MaterialUI.ListItem, null,
                    React.createElement('a', {href: '#create', onClick: () => navigate('create')}, 'Create Task')
                ),
                React.createElement(MaterialUI.ListItem, null,
                    React.createElement('a', {href: '#list', onClick: () => navigate('list')}, 'Task List')
                )
            )
        )
    );
}

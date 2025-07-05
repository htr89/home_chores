const { useState, useEffect } = React;

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


function App() {
    const { page } = React.useContext(NavigationContext);
    return (
        React.createElement('div', {style: {display: 'flex'}},
            React.createElement('div', {style: {flex: 1, paddingRight: '16px'}},
                page === 'create' ?
                    React.createElement(TaskCreate) :
                    React.createElement(TaskList)
            ),
            React.createElement(NavigationBar)
        )
    );
}

// Use the React 18 root API
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    React.createElement(NavigationProvider, null,
        React.createElement(App)
    )
);

module.exports = (app, db) => {
    app.post('/login', async (req, res) => {
        const { name, password } = req.body;
        await db.read();
        const user = db.data.users.find(u => u.name === name && u.password === password);
        if (!user) return res.status(401).json({ error: 'invalid credentials' });
        const { password: pw, ...safeUser } = user;
        res.json(safeUser);
    });
};

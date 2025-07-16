module.exports = (app, db) => {
    app.get('/config', async (req, res) => {
        await db.read();
        db.data.globalConfigurations = db.data.globalConfigurations || {
            workingHoursStart: '06:00',
            workingHoursEnd: '22:00'
        };
        res.json(db.data.globalConfigurations);
    });

    app.patch('/config', async (req, res) => {
        const { workingHoursStart, workingHoursEnd } = req.body;
        await db.read();
        db.data.globalConfigurations = db.data.globalConfigurations || {
            workingHoursStart: '06:00',
            workingHoursEnd: '22:00'
        };
        if (workingHoursStart !== undefined)
            db.data.globalConfigurations.workingHoursStart = workingHoursStart;
        if (workingHoursEnd !== undefined)
            db.data.globalConfigurations.workingHoursEnd = workingHoursEnd;
        await db.write();
        res.json(db.data.globalConfigurations);
    });
};

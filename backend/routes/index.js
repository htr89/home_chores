module.exports = (app, db) => {
    require('./tasks')(app, db);
    require('./events')(app, db);
    require('./steps')(app, db);
    require('./users')(app, db);
    require('./config')(app, db);
    require('./auth')(app, db);
};

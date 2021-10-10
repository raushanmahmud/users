const createLoginRoutes = passport => {
    const router = require('express').Router();
    router.get('/login', (req, res) => {
        if (req.isAuthenticated()) return res.redirect('/');
        for(let [key, value] of Object.entries(req.body)) {
            req.flash(`${key}`, value);
        };
        res.render('login.html');
    });

    router.post(
        '/login',
        passport.authenticate('local', {
            failureRedirect: '/login',
            successRedirect: '/',
            failureFlash: 'Username or password incorrect',
        }),
        (error, req, res, next) => {
            if (error) {
                for(let [key, value] of Object.entries(req.body)) {
                    req.flash(`${key}`, value);
                };
                next(error);
            }
        }
    )
    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    })

    return router;
};

module.exports = createLoginRoutes;
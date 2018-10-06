const express = require('express');
const router = express.Router();
const User = require('../models/user');
const expressValidator = require('express-validator');
const passport = require('passport');

const { buildCheckFunction } = require('express-validator/check');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);



module.exports = router;

router.post('/location', passport.authenticate('jwt', { session: false }), function(req, res, next) {

    req.checkBody('lat', 'Missing lat field').notEmpty();
    req.checkBody('long', 'Missing long field').notEmpty();

    let token = req.body.token

    User.update({
        _id: req.user.id
    }, {
        deviceToken: token
    }, function(err, user) {

        if (!user) return res.status(400).json({ error: "We were unable to find a user with those credentials."});           
        if (err) {
            console.error(err.toString());
            return res.status(500).json({ error: err });
        }

        return res.status(200).json({
            user: user
        });
    });

});
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const expressValidator = require('express-validator');
const passport = require('passport');
const apn = require('apn');

const { buildCheckFunction } = require('express-validator/check');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);

/* POST Register a new user */
router.post('/register', function(req, res, next) {

	req.checkBody('username', 'Missing username field').notEmpty();
	req.checkBody('email', 'Missing email field').notEmpty();
	req.checkBody('password', 'Missing password field').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		console.log('errors: ' + JSON.stringify(errors));
		return res.json(400, {errors: errors});
	}

	var params = {};
	params.username = req.body.username;
	params.email = req.body.email;
	params.password = req.body.password;
    	
    // First check to see if a user with this email already exists
    User.findOne({
        "email": params.email
    }).exec(function(err, duplicateUser) {

        // If so, stop here.
        if (duplicateUser) return res.json(409, { error: "A user with this email address already exists."})

        User.create(params, function(err, newUser) {

        	if(err) return res.json(400, err);

            passport.authenticate('local', function(err, user, token) {

                if (!user) return res.json(400, { error: "We were unable to find a user with those credentials. Please verify your login information."});            
                if (err) return res.json(400, { error: err });
                
                User.findById(user.id).exec(function(err, foundUser) {
                    if (!foundUser) return res.json(400, { error: "We were unable to find a user with those credentials. Please verify your login information."});            
                    if (err) return res.json(400, { error: err });

                    return res.json({
                        token: token,
                        user: foundUser
                    });
                })
                    
            })(req, res);
        });
    });
});

router.post('/login', function(req, res, next) {

	passport.authenticate('local', function(err, user, token) {

		if (!user) return res.json(400, { error: "We were unable to find a user with those credentials. Please verify your login information."});			
		if (err) return res.json(500, { error: err });
		
		return res.json({
	  		token: token,
	 		user: user
		});
	})(req, res);
});

router.put('/profileImage', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    
    req.checkBody('profileImageURL', 'Missing profileImageURL field').notEmpty();

    let profileImageURL = req.body.profileImageURL;

    User.update({_id: req.user.id}, {
        profileImageURL: profileImageURL
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

router.get('/friends', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    

});

router.post('/friends', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    
  
});

module.exports = router;

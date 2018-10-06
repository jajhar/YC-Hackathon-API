const express = require('express');
const router = express.Router();
const User = require('../models/user');
const expressValidator = require('express-validator');
const passport = require('passport');
const apn = require('apn');

const { buildCheckFunction } = require('express-validator/check');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);


router.post('/push', passport.authenticate('jwt', { session: false }), function(req, res, next) {

    req.checkBody('userIds', 'Missing userIds field').notEmpty();
    req.checkBody('message', 'Missing message field').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        console.log('errors: ' + JSON.stringify(errors));
        return res.json(400, {errors: errors});
    }

    let userIds = req.body.userIds;
    let message = req.body.message;

    User.find({
        '_id': userIds
    }).exec(function(err, users) {

        if (!users) return res.status(400).json({ error: "Failed to fetch users"});           
        if (err) {
            console.error(err.toString());
            return res.status(500).json({ error: err });
        }

        var deviceTokens = [];

        users.forEach(function(user) {

            if (!user.deviceToken) {
                console.log("User has not registered for push notifications");
                return;
            }

            if (user.muted.chatrooms) {
                let mutedIds = user.muted.chatrooms;
                if (mutedIds.indexOf(chatroomId) > -1) {
                    // User has muted this chatroom, stop here...
                    return;
                }
            }
            
            deviceTokens.push(user.deviceToken);
        });

         // Configure APNs
        var options = {
          token: {
            key: "apns/AuthKey_TA8UFQ7BDW.p8",
            keyId: "TA8UFQ7BDW",
            teamId: "ZBH9MMUG99"
          },
          production: true
        };
        var apnProvider = new apn.Provider(options);

        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 1;
        note.sound = "ping.aiff";
        note.alert = req.user.ign + '\n' + message;
        // note.payload = {'chatroomId': chatroomId};
        note.topic = "com.yc.hackathon";

        apnProvider.send(note, deviceTokens).then( (result) => {
            // see documentation for an explanation of result
            console.log(result);
        });

        // For one-shot notification tasks you may wish to shutdown the connection
        // after everything is sent, but only call shutdown if you need your
        // application to terminate.
        apnProvider.shutdown();

        return res.status(200).json({
            "message": "Success!"
        });
    });
});

router.post('/register', passport.authenticate('jwt', { session: false }), function(req, res, next) {

    req.checkBody('token', 'Missing token field').notEmpty();

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

module.exports = router;

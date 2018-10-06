// const passport = require('passport'),
//       LocalStrategy = require('passport-local').Strategy,
//       bcrypt = require('bcrypt-nodejs'),
//       passportJWT = require("passport-jwt"),
//       ExtractJwt = passportJWT.ExtractJwt,
//       JwtStrategy = passportJWT.Strategy,
//       jwt = require('jsonwebtoken');

// passport.initialize();

// passport.serializeUser(function(user, cb) {
//   cb(null, user.id);
// });

// passport.deserializeUser(function(id, cb){
//   User.findOne({id}, function(err, user) {
//     cb(err, user);
//   });
// });

// var opts = {};
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'shaguar012824279!A';

// var jwtConfigOptions = {};
// // jwtConfigOptions.expiresIn = '10080'; // 1 week

// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

//     User.findOne({id: jwt_payload.id}, function(err, user) {
//         if (err) {
//             return done(err, false);
//         }
//         if (user) {
//             return done(null, true, user);
//         } else {
//             return done(null, false);
//             // or you could create a new account
//         }
//     });
// }));

// passport.use(new LocalStrategy({
//   usernameField: 'email',
//   passportField: 'password'
// }, function(username, password, cb) {

//     User.findOne({email: username}, function(err, user) {

//         if(err) return cb(err);
//         if(!user) return cb(null, false, {message: 'User not found'});

//       bcrypt.compare(password, user.password, function(err, res) {
        
//         if(!res) return cb(null, false, { message: 'Invalid Password' });

//         let userDetails = {
//             email: user.email,
//             username: user.username,
//             id: user.id
//         };

//         var token = jwt.sign(userDetails, opts.secretOrKey, jwtConfigOptions);

//         return cb(null, userDetails, token);
//     });
//   });
// }));

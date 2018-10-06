var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
const User = require('./models/user');
const apn = require('apn');

const passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      bcrypt = require('bcrypt'),
      passportJWT = require("passport-jwt"),
      ExtractJwt = passportJWT.ExtractJwt,
      JwtStrategy = passportJWT.Strategy,
      jwt = require('jsonwebtoken');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notificationsRouter = require('./routes/notifications');
var trackRouter = require('./routes/track');
var scheduleRouter = require('./routes/schedule');

var app = express();

mongoose.connect('mongodb://localhost:27017/YCHackathon', function(error) {
  // Check error in initial connection. There is no 2nd param to the callback.
  if (error) {
  	console.log("Error connecting to database!");
  	console.log(error);
  }
});

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb){
  User.findOne({id}, function(err, user) {
    cb(err, user);
  });
});

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'shaguar012824279!A';

var jwtConfigOptions = {};
// jwtConfigOptions.expiresIn = '10080'; // 1 week

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

  console.log(jwt_payload);

    User.findOne({_id: jwt_payload.id}, function(err, user) {

        if (err) {
            return done(err, null);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, null);
            // or you could create a new account
        }
    });
}));

passport.use(new LocalStrategy({
  usernameField: 'email',
  passportField: 'password'
}, function(username, password, cb) {

  console.log('Verifying user ' + username + ' via local strategy...');

    User.findOne({email: username}, function(err, user) {

        if(err) return cb(err);
        if(!user) return cb(null, false, {message: 'User not found'});

        bcrypt.compare(password, user.password, function(err, res) {
        
          if(!res) return cb(null, false, { message: 'Invalid Password' });

          let userDetails = {
              email: user.email,
              ign: user.ign,
              id: user.id
          };

          var token = jwt.sign(userDetails, opts.secretOrKey, jwtConfigOptions);

          return cb(null, user, token);
      });
    });
}));

var DiscordStrategy = require('passport-discord').Strategy;
 
passport.use(new DiscordStrategy({
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: 'callbackURL'
},
function(accessToken, refreshToken, profile, cb) {
    if (err)
        return done(err);
 
    User.findOrCreate({ discordId: profile.id }, function(err, user) {
        return cb(err, user);
    });
}));

// Routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
// app.use('/search', searchRouter);
app.use('/notify', notificationsRouter);
// app.use('/game', gamesRouter);
// app.use('/tags', tagsRouter);
app.use('/schedule', scheduleRouter);
app.use('/track', trackRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err//req.app.get('env') === 'development' ? err : {};

  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.send(err);
  // res.render('error');
});

app.listen(8080, () => console.log('API listening on port 8080!'))

module.exports = app;

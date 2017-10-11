const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const jwt = require('jwt-simple');
const User = require('./models/user');
const config = require('./config');

module.exports = function(passport) {
    passport.use(new Strategy(
        function(token, done) {
          try {
            var decoded = jwt.decode(token, config.secret);
            if (decoded.exp <= Date.now()) {
                return done('Access token has expired');
            }
             User.findOne({
                token: token,
                name: decoded.iss
                }, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false);
                    }
                    return done(null, user);
             });
          } catch (err) {
            return done(err);
          }
        }
    ));
};
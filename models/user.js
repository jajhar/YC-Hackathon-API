'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        sparse: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String
    },
    deviceToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date()
    }
});

// Duplicate the ID field.
UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

var hasSecurePassword = function(user, options, callback) {
    if (user.password != user.password_confirmation) {
        throw new Error("Password confirmation doesn't match Password");
    }
    bcrypt.hash(user.get('password'), 10, function(err, hash) {
        if (err) return callback(err);
        user.set('password_digest', hash);
        return callback(null, options);
    });
};

// hash user password before saving into database
UserSchema.pre('save', function(next){

    // only hash the password if it has been modified (or is new)
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, saltRounds);
    }

    next();
});

UserSchema.methods.toJSON = function () {
    virtuals: true
    var obj = this.toObject();
    delete obj.createdAt;
    delete obj.coordinates;
    delete obj.password;
    delete obj.deviceToken
    return obj;
};

// UserSchema.set("toObject", { transform: function (doc, obj, options) { 
//   console.log("TOOOSDFIOJSDOFIJDSOFJDSLFKDSJLFKDJSLFJD KLDJF LKDSJFLSD");
//     delete obj.createdAt;
//     delete obj.coordinates;
//     delete obj.password;
//     delete obj.deviceToken
//     return obj;
// }, minimize: false });

// UserSchema.methods.toObject.transform = function (doc, obj, options) {
//       console.log("TOOOSDFIOJSDOFIJDSOFJDSLFKDSJLFKDJSLFJD KLDJF LKDSJFLSD");
//     delete obj.createdAt;
//     delete obj.coordinates;
//     delete obj.password;
//     delete obj.deviceToken
//     return obj;
// };

module.exports = mongoose.model('User', UserSchema);

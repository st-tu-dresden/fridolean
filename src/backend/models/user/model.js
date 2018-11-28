const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const Schema = mongoose.Schema;
require('../index').assertCurrentVersion();

// define User model schema
const UserSchema = new Schema({
    // username: {
    //     type: String,
    //     required: [true, "Username field required."]
    // },
    _id: {type: String, default: uuidv4},
    email: {
        type: String,
        index: { unique: true},
        required: [true, "Email field requried."]
    },
    password: {
        type: String, required: [true, "Password field is required."]
    },
    name: {
        type: String,
        default: "defaultusername"
    },
    keycloak_id: {
        type: String,
        default: null
    },
    projects: {
        // todo: reference Project model like below
        // type: [{ type : ObjectId, ref: 'Project' }],
        type: [{ type : String }],
    }
},{usePushEach: true });

// compare the passes password with value in db
UserSchema.methods.comparePassword = function comparePassword(password, callback) {
    bcrypt.compare(password, this.password, callback);
}

// pre-save hook method.
UserSchema.pre("save", function saveHook(next) {
    const user = this;

    // proceed if password is modified or user is new

    if (!user.isModified("password")) return next();

    return bcrypt.genSalt((saltError, salt) => {
        if (saltError) {
            return next(saltError);
        }

        return bcrypt.hash(user.password, salt, (hashError, hash) => {
            if (hashError) {
                return next(hashError);
            }

            // replace a password string with hash value
            user.password = hash;

            return next();
        })
    })
})

// create model(collection, schema)
const User = mongoose.model('User', UserSchema);

module.exports = User;

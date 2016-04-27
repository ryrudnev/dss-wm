import { omit } from '../util/utils';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Scope from ''

const { Schema } = mongoose;

// Rounds constant for generating salt
const SALT_ROUNDS = 10;

// Private fields
const PRIVATE_FIELDS = [
  'password',
];

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: []
});

UserSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(SALT_ROUNDS, (saltErr, salt) => {
      if (saltErr) {
        return next(saltErr);
      }
      bcrypt.hash(this.password, salt, (hashErr, hash) => {
        if (hashErr) {
          return next(hashErr);
        }
        this.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.virtual('userId').get(function () {
  return this.id;
});

UserSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

UserSchema.methods.toPublicJSON = function () {
  return omit(this.toJSON(), PRIVATE_FIELDS);
};

UserSchema.statics = {};

export default mongoose.model('User', UserSchema);

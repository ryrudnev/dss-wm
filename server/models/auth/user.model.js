import { omit } from '../../util/utils';
import { genUid } from '../../services/counter';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// import Scope from './scope.model';
// import Role from './role.model';

const { Schema } = mongoose;

// Rounds constant for generating salt
const SALT_ROUNDS = 10;

// Private fields
const PRIVATE_FIELDS = [
  'password',
];

const UserSchema = new Schema({
  _id: Number,
  email: String,
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: [{ type: String, ref: 'Role' }],
  scopes: [{ type: String, ref: 'Scope' }],
  subjects: [String],
});

UserSchema.pre('save', function (next) {
  const hashPass = () => {
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
  };

  if (this.isNew) {
    genUid('userId').then(id => {
      this._id = id;
      hashPass();
    });
  } else if (this.isModified('password')) {
    hashPass();
  } else {
    next();
  }
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

UserSchema.methods.getScopes = function () {
  // TODO: get all scopes for current user
};

export default mongoose.model('User', UserSchema);

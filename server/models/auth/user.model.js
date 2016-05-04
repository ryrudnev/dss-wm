import { omit, resolve, uniqueArray } from '../../util/utils';
import { genUid } from '../../services/counter';
import mongoose from 'mongoose';
import mongooseDeepPopulate from 'mongoose-deep-populate';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

// Rounds constant for generating salt
const SALT_ROUNDS = 10;

const UserSchema = new Schema({
  _id: { type: Number, required: true },
  email: String,
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: [{ type: String, ref: 'Role' }],
  scopes: [{ type: String, ref: 'Scope' }],
  subjects: [String],
});
const deepPopulate = mongooseDeepPopulate(mongoose);
UserSchema.plugin(deepPopulate /* , {} */);

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
    }).catch(err => next(err));
  } else if (this.isModified('password')) {
    hashPass();
  } else {
    next();
  }
});

UserSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  versionKey: false,
  transform(doc, ret /* , options */) {
    return { ...omit(ret, ['_id', 'password']), id: ret._id };
  },
});

UserSchema.methods.comparePassword = function (password) {
  return new Promise((res, rej) => {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err || !isMatch) {
        return rej(err);
      }
      res();
    });
  });
};

UserSchema.methods.calcPermissions = function () {
  return this.deepPopulate('scopes roles.scopes').then(() => {
    let { roles, scopes } = this.toJSON();
    if (!scopes.length) {
      scopes = uniqueArray(roles.reduce((prev, role) => [...prev, ...role.scopes], []));
    }
    roles = roles.map(r => omit(r, 'scopes'));
    return resolve({ roles, scopes });
  });
};

export default mongoose.model('User', UserSchema);

import User from './models/user.model';

export default function (done) {
  done = done || (() => {});

  User.count().exec((err, count) => {
    if (err) { return done(err); }
    if (count > 0) { return done(); }

    const seeds = [
      { username: 'admin', password: 'admin', role: 'admin' },
      { username: 'test', password: 'test', role: 'user', subjects: ['e6', 'e5'] },
    ];

    User.create(seeds, (error) => {
      if (!error) { return done(error); }
      done();
    });
  });
}

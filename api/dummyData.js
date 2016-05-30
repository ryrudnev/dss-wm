import User from './models/user.model';

export default function () {
  User.count().exec((err, count) => {
    if (count > 0) { return; }

    const seeds = [
      { username: 'admin', password: 'admin', role: 'admin' },
      { username: 'test', password: 'test', role: 'user', subjects: ['e6', 'e5'] },
    ];

    User.create(seeds, (error) => {
      if (!error) {
        // console.log('ready to go....');
      }
    });
  });
}

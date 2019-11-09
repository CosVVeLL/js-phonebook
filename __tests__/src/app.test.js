// import assert from 'assert';
import request from 'supertest';

import fs from 'fs';
import path from 'path';

import app from '../../src/app';
import { userService } from '../../src/app';

describe('GET /', () => {
  it('request home', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('getting user 23 information', (done) => {
    request(app)
      .get('/phonebook/users/23')
      .expect(200, {
        data: {
          name: "Dr. Dameon Graham",
          phone: "(638) 259-2475",
        },
      }, done);
  });
});

/*
test('request', async () => {
  const res = await request(app).get('/');
  if (res.error) throw res.error;
  expect(res.status).toBe(200);
});
*/

describe('authentication', () => {
  userService.createUser('admin', 'qwerty', 'qwerty');
  const nickname = 'CosWeLL';
  const password = 'QAZxsw345';
  describe('POST /users', () => {
    describe('success', () => {
      it('sign up (redirect)', (done) => {
        request(app)
          .post('/users')
          .send(`nickname=${nickname}&password=${password}&confirmPassword=${password}`)
          .expect(302)
          .expect('Location', '/')
          .expect(function(res) {
            const user = userService.repositories.User.find(nickname);
            //console.log(userService.repositories.User.data.map((e) => e.getNickname()));
            //console.log(userService.repositories.User.find(nickname));
          })
          .end((function(err, res) {
            if (err) return done(err);
            done();
          }));
      });

      it('log in (redirect)', (done) => {
        request(app)
          .post('/session')
          .send(`nickname=${nickname}&password=${password}`)
          .expect(302)
          .expect('Location', '/')
          /*.expect(function(res) {
            const user = userService.repositories.User.find(nickname);
            //console.log(res.locals.currentUser);
            //console.log(Object.getOwnPropertyNames(res.res));
            const str = JSON.stringify(res);
            console.log(res);
            fs.writeFile(path.join(__dirname, '../../temp.txt'), str);
          })*/
          .end(done);
      });
    });
  });
});


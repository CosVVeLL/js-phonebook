//import assert from 'assert';
import request from 'supertest';
import app from '../src/app';

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


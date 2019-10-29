import express from 'express';
import debug from 'debug';

import phonebook from '../lib/phonebook';
import session from '../lib/session';

const router = express.Router();

const httpRequestLog = debug('http:request');

router.use(session.options, session.handle);

router.get('/', (req, res) => {
  phonebook().then((pUsers) => {
    httpRequestLog(`GET ${req.url}`);
    //  const messages = [
    //    'Welcome to The Phonebook',
    //    `Records count: ${Object.keys(pUsers).length}`,
    //  ];
    const nickname = req.session.nickname ? `${req.session.nickname}` : 'DUDE!';
    const title = `Let's go, ${nickname}`;
    const h2 = 'Welcome to The Phonebook';
    const message = `Records count: ${Object.keys(pUsers).length}`;
    res.render('phonebook', { title, h2, message });
    //  res.set('Content-Type', 'text/plain')
    //     .send(`${messages.join('\n')}\n`);
  });
});
router.get('/users/:id', (req, res) => {
  phonebook().then((pUsers) => {
    const { id } = req.params;
    httpRequestLog(`GET ${req.url}`);
    const pUser = pUsers[id];
    if (!pUser) {
      res.setStatus(404);
    }
    res.json({ data: pUser });
  });
});

router.get('/search.json', (req, res) => {
  phonebook().then((pUsers) => {
    const { q } = req.query;
    httpRequestLog(`GET ${req.url}`);
    const normalizedSearch = q.trim().toLowerCase();
    const ids = Object.keys(pUsers);

    const pUsersSubset = ids
      .filter(id => pUsers[id].name.toLowerCase().includes(normalizedSearch))
      .map(id => pUsers[id]);
    res.json({ data: pUsersSubset });
  });
});

router.get('/users', (req, res) => {
  phonebook().then((pUsers) => {
    const { page, perPage } = req.query;
    httpRequestLog(`GET ${req.url}`);
    const ids = Object.keys(pUsers);

    const pUsersSubset = ids.slice((page * perPage) - perPage, page * perPage)
      .map(id => pUsers[id]);
    const totalPages = Math.ceil(ids.length / perPage);
    res.json({ meta: { page, perPage, totalPages }, data: pUsersSubset });
  });
});

export default router;


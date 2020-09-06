import knex from 'knex';

import express from 'express';
import debug from 'debug';

// import phonebook from '../lib/phonebook';
import session from '../lib/session';

const router = express.Router();
const client = knex({
  client: 'pg',
  connection: {
    host: '/var/run/postgresql',
  },
});

router.use(session.options, session.handle);

const httpRequestLog = debug('http:request:phonebook');

router.get('/', async (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  const handle = res.locals.currentUser.isGuest() ?
    'DUDE!' :
    `${res.locals.currentUser.getHandle()}`;
  const title = `Let's go, ${handle}`;
  const h2 = 'Welcome to The Phonebook';
  const numOfUsers = await client('phonebook').count('*').then(([{ count }]) => count);
  const message = `Records count: ${numOfUsers}`;
  await res.render('phonebook', { title, h2, message });
  //  res.set('Content-Type', 'text/plain')
  //     .send(`${messages.join('\n')}\n`);
});

router.get('/users/:id', async (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  const { id } = req.params;
  const [pUser] = await client('phonebook')
    .where({ id })
    .select('name', 'phone');
  if (!pUser) {
    await res.setStatus(404);
  }
  await res.json({ data: pUser });
});

router.get('/search.json', async (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  const { q } = req.query;
  const normalizedSearch = q.trim().toLowerCase();
  const pUsersSubset = await client('phonebook')
    .where('name', 'ILIKE', `%${q}%`)
    .select('name', 'phone');

  await res.json({ data: pUsersSubset });
});

router.get('/users', async (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  const { page, perPage } = req.query;
  httpRequestLog(`GET ${req.url}`);
  const pUsers = await client.select('name', 'phone')
    .from('phonebook')
    .limit(perPage)
    .offset((page - 1) * perPage);

  const [{ count }] = await client('phonebook').count('*');
  const totalPages = Math.ceil(count / perPage);
  await res.json({ meta: { page, perPage, totalPages }, data: pUsers });
});

export default router;


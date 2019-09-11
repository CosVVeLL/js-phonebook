import Express from 'express';
import session from 'express-session';
import debug from 'debug';
import morgan from 'morgan';

import path from 'path';
import fs from 'fs';

import phonebook from '../src/phonebook';
import crypto from 'crypto';

const app = new Express();

const httpRequestLog = debug('http:request');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });
const loggerErrors = morgan('dev', { skip: (req, res) => res.statusCode < 400 });
const logger = morgan('combined', { stream: accessLogStream });
app.use(loggerErrors);
app.use(logger);

app.set('views', './templates');
app.set('view engine', 'pug');
app.use(session({
  secret: 'secret key 23',
  resave: false,
  saveUninitialized: false,
}));

app.get('/', (req, res) => {
  phonebook().then((users) => {
    httpRequestLog(`GET ${req.url}`);
//  const messages = [
//    'Welcome to The Phonebook',
//    `Records count: ${Object.keys(users).length}`,
//  ];
    const title = `Let's go, DUDE!`;
    const h1 = 'Welcome to The Phonebook';
    const message = `Records count: ${Object.keys(users).length}`;
    res.render('home', { title, h1, message });
//  res.set('Content-Type', 'text/plain')
//    .send(`${messages.join('\n')}\n`);
  });
});

app.get('/users/:id', (req, res) => {
  phonebook().then((users) => {
    const { id } = req.params;
    httpRequestLog(`GET ${req.url}`);
    const user = users[id];
    if (!user) {
      res.setStatus(404);
    }
    res.json({ data: user });
  });
});

app.get('/search.json', (req, res) => {
  phonebook().then((users) => {
    const { q } = req.query;
    httpRequestLog(`GET ${req.url}`);
    const normalizedSearch = q.trim().toLowerCase();
    const ids = Object.keys(users);
    
    const usersSubset = ids
      .filter(id => users[id].name.toLowerCase().includes(normalizedSearch))
      .map(id => users[id]);
    res.json({ data: usersSubset });
  });
});

app.get('/users', (req, res) => {
  phonebook().then((users) => {
    const { page, perPage } = req.query;
    httpRequestLog(`GET ${req.url}`);
    const ids = Object.keys(users);

    const usersSubset = ids.slice((page * perPage) - perPage, page * perPage)
      .map(id => users[id]);
    const totalPages = Math.ceil(ids.length / perPage);
    res.json({ meta: { page, perPage, totalPages }, data: usersSubset });
  });
});

app.get('/increment', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  req.session.counter = req.session.counter || 0;
  req.session.counter += 1;
  res.render('increment', { title: '+1', increment: req.session.counter });
});

app.use((req, res, next) => {
  const err = new Error('Page Not Found >:(');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status);
  switch (err.status) {
    case 404:
      res.render(err.status.toString(), {
        err: err.status,
        message: err.message,
      });
      break;
    default:
      throw new Error('Unexpected error!');
  }
});

export default app;


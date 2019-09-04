import Express from 'express';
import debug from 'debug';
import morgan from 'morgan';
import phonebook from '../src/phonebook';
import path from 'path';
import fs from 'fs';

const app = new Express();

const httpRequestLog = debug('http:request');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });
const loggerErrors = morgan('dev', { skip: (req, res) => res.statusCode < 400 });
const logger = morgan('combined', { stream: accessLogStream });
app.use(loggerErrors);
app.use(logger);

app.get('/', (req, res) => {
  phonebook().then((users) => {
    httpRequestLog(`GET ${req.url}`);
    const messages = [
      'Welcome to The Phonebook',
      `Records count: ${Object.keys(users).length}`,
    ];
    res.set('Content-Type', 'text/plain')
      .send(messages.join('\n'));
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

export default app;


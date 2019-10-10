import Express from 'express';
import session from 'express-session'; // управление сессиями через req.session
import bodyParser from 'body-parser'; // добавляет в req.body тело входящего запроса
import morgan from 'morgan'; // для логгирования
import debug from 'debug'; // для отладки (идёт с express)
import methodOverride from 'method-override'; // позволяет использовать HTTP-глаголы там, где клиент не позволяет этого делать

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import Guest from '../entities/Guest';
import User from '../entities/User';
import phonebook from './phonebook';
import users from '../data/users';
import encrypt from './encrypt';
import birds from './routers/birds';
import flash from './flash'; // когда надо оповестить об (не) успешном выполнении какого-л. действия

users.push(new User('admin', encrypt('qwerty')));

const app = new Express();
app.use('/birds', birds);

const httpRequestLog = debug('http:request');
const httpLog = debug('http:log');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });
const loggerErrors = morgan('dev', { skip: (req, res) => res.statusCode < 400 });
const logger = morgan('combined', { stream: accessLogStream });
app.use(loggerErrors);
app.use(logger);

const pathway = path.join(__dirname, 'public');
app.use('/assets', Express.static(pathway)); // специальный маршрут, кот. связывается с обработчикам, кот. в свою очередь принимает на вход путь, по которому он будет просматривать файлы на диске
app.use(methodOverride('_method'));
app.set('views', './templates');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key 23',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

const requireAuth = (req, res, next) => {
  if (req.locals.currentUser.isGuest()) {
    next(new Error("Access Denied: You are not autheneicated"));
  }
  next();
};

app.use((req, res, next) => {
  if (req.session && req.session.nickname) {
    const { nickname } = req.session;
    res.locals.currentUser = users.find(user => user.nickname === nickname);
  } else {
    res.locals.currentUser = new Guest();
  }
  next();
})

app.get('/', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  res.render('home', { users: users.length, title: 'Home' });
});

app.get('/phonebook', (req, res) => {
  phonebook().then((pUsers) => {
    httpRequestLog(`GET ${req.url}`);
//  const messages = [
//    'Welcome to The Phonebook',
//    `Records count: ${Object.keys(pUsers).length}`,
//  ];
    const userNickname = req.session.nickname ? `${req.session.nickname}.` : 'DUDE!';
    const title = `Let's go, ${userNickname}`;
    const h1 = 'Welcome to The Phonebook';
    const message = `Records count: ${Object.keys(pUsers).length}`;
    res.render('phonebook', { title, h1, message });
//  res.set('Content-Type', 'text/plain')
//    .send(`${messages.join('\n')}\n`);
  });
});

app.get('/phonebook/users/:id', (req, res) => {
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

app.get('/phonebook/search.json', (req, res) => {
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

app.get('/phonebook/users', (req, res) => {
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

app.get('/users/new', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  res.render('new/user', {
    h1: 'Sign up',
    form: {},
    errors: {},
  });
});

app.post('/users', (req, res) => {
  httpRequestLog(`POST ${req.url}`);
  const { nickname, password } = req.body;
  httpLog(`req.body: ${JSON.stringify(req.body)}`);

  const errors = {};
  if (!nickname) {
    errors.nickname = "Can't be blank";
  } else {
    const isUniq = users.find(user => (
      user.nickname.toLowerCase() === nickname.toLowerCase()
    )) === undefined;
    if (!isUniq) {
      errors.nickname = 'Nickname already exist';
    }
  }
  if (!password) {
    errors.password = "Can't be blank";
  }

  if (Object.keys(errors).length === 0) {
    users.push(new User(nickname, encrypt(password)));
    res.redirect('/');
    return;
  }

  httpLog(`errors: ${JSON.stringify(errors)}`);
  res.status(422);
  res.render('new/user', {
    h1: 'Sign up! >:',
    form: req.body,
    errors,
  });
});

app.get('/session/new', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  res.render('new/session', {
    h1: 'Sign in',
    title: 'Login form',
    form: {},
  });
});

app.post('/session', (req, res) => {
  httpRequestLog(`POST ${req.url}`);
  const { nickname, password } = req.body;
  const user = users.find(user => user.nickname.toLowerCase() === nickname.toLowerCase());
  if (user && user.passwordDigest === encrypt(password)) {
    httpLog(`req.body: ${JSON.stringify(req.body)}`);
    req.session.nickname = user.nickname;
    res.redirect('/');
    return;
  }
  const error = 'Invalid nickname or password';
  httpLog(`error: ${JSON.stringify({ ...req.body, error })}`);
  res.status(422);
  res.render('new/session', {
    h1: 'Sign in',
    title: 'Login form',
    form: { nickname },
    error,
  });
});

app.delete('/session', (req, res) => {
  httpRequestLog(`DELETE ${req.url}`);
  delete req.session.nickname;
  res.flash('info', `Good bye, ${res.locals.currentUser.nickname}`);
  res.redirect('/');
  //  req.session.destroy(() => {
  //    res.redirect('/');
  //  });
});

app.get('/increment', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  req.session.counter = req.session.counter || 0;
  req.session.counter += 1;
  res.render('increment', {
    title: '+1',
    increment: req.session.counter,
  });
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
      throw new Error(err/*'Unexpected error!'*/);
  }
});

export default app;


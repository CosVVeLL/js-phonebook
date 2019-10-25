import Express from 'express';
import session from 'express-session'; // управление сессиями через req.session
import bodyParser from 'body-parser'; // добавляет в req.body тело входящего запроса
import morgan from 'morgan'; // для логгирования
import debug from 'debug'; // для отладки (идёт с express)
import methodOverride from 'method-override'; // позволяет использовать HTTP-глаголы там, где клиент не позволяет этого делать

import path from 'path';
import fs from 'fs';

import Guest from '../entities/Guest';
import UserService from '../services/UserService';
import * as repositories from '../repositories';
import validator from '../lib/validation';
import phonebook from '../lib/phonebook';
// import users from '../data/users';
import encrypt from '../lib/encrypt';
import birds from './routers/birds';
import flash from '../lib/flash'; // когда надо оповестить об (не) успешном выполнении какого-л. действия

const repositoriyInstances = Object.keys(repositories).reduce((acc, name) => (
  { ...acc, [name]: new repositories[name]() }
), {});
const validate = validator(repositoriyInstances);
const userService = new UserService(repositoriyInstances, validate);
userService.createUser('admin', 'qwerty')
// users.push(new User('admin', 'qwerty'));

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
    res.locals.currentUser = userService.findUser(nickname);
  } else {
    res.locals.currentUser = new Guest();
  }
  next();
})

app.get('/', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  res.render('home', { users: userService.numberOfUsers(), title: 'Home' });
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
    const h2 = 'Welcome to The Phonebook';
    const message = `Records count: ${Object.keys(pUsers).length}`;
    res.render('phonebook', { title, h2, message });
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
    h2: 'Sign up',
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
    httpLog(`!!!!!!!!!!!!!!!!!`);
    const isUniq = userService.findUser(nickname) === undefined;
    //  const isUniq = users.find(user => (
    //    user.nickname.toLowerCase() === nickname.toLowerCase()
    //  )) === undefined;
    if (!isUniq) {
      errors.nickname = 'Nickname already exist';
    }
  }
  if (!password) {
    errors.password = "Can't be blank";
  }

  if (Object.keys(errors).length === 0) {
    userService.createUser(nickname, password);
    //  users.push(new User(nickname, password));
    res.flash('info', 'Ah shit, here we go again.');
    res.redirect('/');
    return;
  }

  httpLog(`errors: ${JSON.stringify(errors)}`);
  res.status(422);
  res.render('new/user', {
    h2: 'Sign up! >:',
    form: req.body,
    errors,
  });
});

app.get('/session/new', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  res.render('new/session', {
    h2: 'Sign in',
    title: 'Login form',
    form: {},
  });
});

app.post('/session', (req, res) => {
  httpRequestLog(`POST ${req.url}`);
  const { nickname, password } = req.body;
  const user = userService.findUser(nickname);
  if (user && user.passwordDigest === encrypt(password)) {
    httpLog(`req.body: ${JSON.stringify(req.body)}`);
    res.flash('info', `Welcome, ${user.nickname}!`);
    req.session.nickname = user.nickname;
    res.redirect('/');
    return;
  }
  const error = 'Invalid nickname or password';
  httpLog(`error: ${JSON.stringify({ ...req.body, error })}`);
  res.status(422);
  res.render('new/session', {
    h2: 'Sign in',
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


import express from 'express';
import bodyParser from 'body-parser'; // добавляет в req.body тело входящего запроса
import morgan from 'morgan'; // для логгирования
import debug from 'debug'; // для отладки (идёт с express)
import methodOverride from 'method-override'; // позволяет использовать HTTP-глаголы там, где клиент не позволяет этого делать

import path from 'path';
import fs from 'fs';

// import { UserService } from './services';
// import * as repositories from './repositories';
// import validator from './lib/validation';
import serviceManager from './';
import encrypt from './lib/encrypt';
import { birds, phonebook } from './routers';
import session from './lib/session';
import flash from './lib/flash'; // когда надо оповестить об (не) успешном выполнении какого-л. действия

const app = new express();
app.use('/birds', birds);
app.use('/phonebook', phonebook);

const httpRequestLog = debug('http:request');
const httpLog = debug('http:log');
const httpStartSession = debug('http:log:start session');
const accessLogStream = fs.createWriteStream(path.join(process.cwd(), './access.log'), { flags: 'a' });
const loggerErrors = morgan('dev', { skip: (req, res) => res.statusCode < 400 });
const logger = morgan('combined', { stream: accessLogStream });
app.use(loggerErrors);
app.use(logger);

// const repositoryInstances = Object.keys(repositories).reduce((acc, name) => (
//   { ...acc, [name]: new repositories[name]() }
// ), {});
// const validate = validator(repositoryInstances);
// const userService = new UserService(repositoryInstances, validate);
const manager = serviceManager();
const userService = manager.services.User;
userService.createUser('admin', 'qwerty', 'qwerty');

const pathway = path.join(__dirname, 'public');
app.use('/assets', express.static(pathway)); // специальный маршрут, кот. связывается с обработчикам, кот. в свою очередь принимает на вход путь, по которому он будет просматривать файлы на диске
app.use(methodOverride('_method'));
app.set('views', './templates'); // process.cwd() + ...
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session.options, session.handle);
app.use(flash());

const requireAuth = (req, res, next) => {
  if (res.locals.currentUser.isGuest()) {
    next(new Error("Access Denied: You are not autheneicated"));
  }
  next();
};

app.get('/', (req, res) => {
  httpRequestLog(`GET ${req.url}`);
  httpLog(userService.repositories.User.numberOfUsers());
  res.render('home', { users: userService.repositories.User.numberOfUsers(), title: 'Home' });
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
  httpLog(`req.body: ${JSON.stringify(req.body)}`);
  const { nickname, password, confirmPassword } = req.body;
  const creationResult = userService.createUser(nickname, password, confirmPassword);
  const [, errors] = creationResult ? creationResult : [, creationResult];

  if (!errors) {
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
  const user = userService.repositories.User.find(nickname);
  if (user && user.getPasswordDigest() === encrypt(password)) {
    httpStartSession(`req.body: ${JSON.stringify(req.body)}`);
    req.session.nickname = user.getNickname();
    res.flash('success', `Welcome, ${user.getHandle()}!`);
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
  res.flash('primary', `Good bye, ${res.locals.currentUser.getHandle()}`);
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
      throw new Error(`Unexpected error: ${err}`);
  }
});

export default app;
export {
  userService,
};


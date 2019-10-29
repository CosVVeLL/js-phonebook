import expressSession from 'express-session'; // управление сессиями через req.session

import Guest from '../entities/Guest';
import { userService } from '../app';

const options = expressSession({
  secret: 'secret key 23',
  resave: false,
  saveUninitialized: false,
});

const handle = (req, res, next) => {
  if (req.session && req.session.nickname) {
    const { nickname } = req.session;
    res.locals.currentUser = userService.find(nickname);
  } else {
    res.locals.currentUser = new Guest();
  }
  next();
};

export default {
  options,
  handle,
};


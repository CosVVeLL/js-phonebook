import assert from 'assert';

export default () => (req, res, next) => {
  assert(req.session, 'a req.session is required!'); // проверка на то, что не забыли подключить сессию
  res.locals.flash = req.session.flash || [];
  req.session.flash = [];
  res.flash = (type, message) => {
    req.session.flash.push({ type, message });
  };
  next();
};


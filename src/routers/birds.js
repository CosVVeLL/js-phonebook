import express from 'express';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const router = express.Router();

router.use((req, res, next) => {
  const date = utcToZonedTime(new Date(), 'Europe/Moscow');
  console.log(format(date, 'H:mm:ss d.MM.y'));
  next();
});

router.get('/', (req, res) => {
  res.send('Birds home page');
});

router.get('/about', (req, res) => {
  res.send('About birds');
});

export default router;                                                                                                  //module.exports = router;


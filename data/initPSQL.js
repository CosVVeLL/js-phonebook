import knex from 'knex';
import { promises as fs } from 'fs';
import phonebook from './src/lib/phonebook';

const client = knex({
  client: 'pg',
  connection: {
    host: '/var/run/postgresql', /*'127.0.0.1',
    // port: '44001',
    // user: 'coswell',
    // password: '1124365',
    // database: 'coswell',
    // filename: process.env.PG_CONNECTION_STRING,*/
  },
});
// client.on('query', console.log);

phonebook().then(async (pUsers) => {
  const pu = Object.values(pUsers);
  const initSql = await fs.readFile(`${__dirname}/init.sql`, 'utf-8');

  client.transaction(async (trx) => {
    await client.raw(initSql);
    return await trx.insert(pu)
      .into('phonebook');
  })
  .then(async (inserts) => {
    console.log(`${inserts.rowCount} new users saved.`);
    await client.destroy();
  })
  .catch((err) => {
    console.log(err);
  });
});


const pg = require('pg');

const config = {
  user: 'travis_ci_test_user', // this is the db user credential
  database: 'travis_ci_test',
  password: 'rrwcscrz2',
  port: 5432,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000
};
const pool = new pg.Pool(config);

pool.on('connect', () => {
  console.log('connected to the Database');
});

/*
 * Create Tables
 */
const createTables = () => {
  const queryText = `
    CREATE TABLE phonebook (
      id    bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name  varchar(255),
      phone varchar(25)
    );
  `;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      pool.end();
    });
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

module.exports = {
  createTables,
  pool
};

require('make-runnable');


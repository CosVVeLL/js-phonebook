DROP TABLE IF EXISTS phonebook;
DROP TABLE IF EXISTS users;

CREATE TABLE phonebook (
  id    bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name  varchar(255),
  phone varchar(25)
);

CREATE TABLE users (
  id                bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nickname          varchar(255),
  handle            varchar(255),
  password_digest   varchar(255)
);


const dotenv = require('dotenv');
const path = require('path');

if (process.env.NODE_ENV === 'test') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.test.env'),
  });
} else {
  dotenv.config();
}

const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCCESS_TOKEN_AGE,
  },
  database: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
};

module.exports = config;

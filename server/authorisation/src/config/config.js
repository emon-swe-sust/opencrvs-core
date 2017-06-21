
const Confidence = require('confidence')

const criteria = {
  env: process.env.NODE_ENV
}

store = new Confidence.Store({
  //
  $meta: 'App configuration file',
  //
  // Knex Connector
  //
  knex: {
    $filter: 'env',
    test: {
        client: 'pg',
        connection: {
            database: 'authorisation_test',
            user:     'opencrvs',
            password: '8d3db93cf3832222992b6351a19b4de43a5b0fd1b01a0a6b10634bcc83780785'
        },
        migrations: {
            directory: './src/model/migrations'
        },
        seeds: {
            directory: './src/model/seeds/test'
        }
    },
    prod: {
        client: 'pg',
        connection: {
            database: 'authorisation',
            user:     '',
            password: ''
        },
        migrations: {
            directory: './src/model/migrations'
        },
        seeds: {
            directory: './src/model/seeds/production'
        }
    },
    $default: {
        client: 'pg',
        connection: {
            database: 'authorisation',
            user:     'opencrvs',
            password: '8d3db93cf3832222992b6351a19b4de43a5b0fd1b01a0a6b10634bcc83780785'
        },
        migrations: {
            directory: './src/model/migrations'
        },
        seeds: {
            directory: './src/model/seeds/development'
        }
    },

  },
  //
  // JWT Auth
  //
  jwtAuth: {
    secret: '38c565b35098797461bf3582897fef10da80178fc0a07c7fbc0ade3214b150d2'
  }
});

exports.get = function (key) {
  return store.get(key, criteria)
}

exports.meta = function (key) {
  return store.meta(key, criteria);
}

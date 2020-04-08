const debug = require('debug');

const server = new debug('app:server');
const request = new debug('app:request');

const query = new debug('debug:query');
const axios = new debug('debug:axios');

const error = new debug('error:server');
const fail = new debug('error:request');

server('Server Start');
request('Request is this');

query('selet * from table');
axios('call external api');

error('404 not found');
fail('request failure');
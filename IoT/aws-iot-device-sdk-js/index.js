'use strict';

const Device = require('./src/device')

main = () => {
  const Client = new Device();
  Client.init();
};

main();
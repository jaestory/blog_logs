'use strict';

const FS = require('fs');

class Config {
  constructor() { }

  get type() {
    return process.env.NODE_ENV
  }

  setDevice() {
    const ret = {
      keyPath: 'resources/private.pem.key',
      certPath: 'resources/certificate.pem.crt',
      caPath: 'resources/AmazonRootCA1.pem',
      host: process.env.AWS_IOT_HOST,
      keepalive: 10    // AWS IoT supports kepp-alive values between 5 and 1200
    }
  }
}

module.exports = new Config;

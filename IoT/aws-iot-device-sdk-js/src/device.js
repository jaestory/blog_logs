'use strict';

const awsIoT = require('aws-iot-device-sdk');
const Config = require('../config');

class Device {
  constructor() {
    this.thingName;
    this.device;
    this.packetAck;
  }

  init() {
    this.thingName = this.generateThingName();
    this.runProcess();
  }

  runProcess() {
    this.device && this.device.end();   // Check if there is connected device, if true disconnect that device for maintain singleton connection

    const deviceInformation = Config.setDevice();
    deviceInformation.clientId = this.thingName;   // Set MQTT clientId to ThingName
    this.device = awsIoT.device(deviceInformation);  // set device object

    this.subscribe(['topic/A', 'topic/B']);
  }

  onDeviceEvent() {
    this.device.on('connect', (connack) => console.log(connack));

    this.device.on('close', (err) => err && console.log(err));

    this.device.on('reconnect', () => { });

    this.deive.on('offlinet', () => { });

    this.deive.on('error', (error) => error && console.log(error));
  }

  onMessage() {
    this.device.on('message', (topic, payload) => {
      payload = JSON.parse(payload.toString());

      switch (topic) {
        case 'topic/C':
          console.log(`Received Topic/C, Device react to ${payload}`);
          break;
        case 'topic/D':
          console.log('D meant Die. Device should sleep for 1 sec');
          break;
      }
    })
  }

  subscribe(topics) {
    this.device.subscribe(topics, (err, granted) => {
      err && console.log(err);
      granted && console.log(granted)
    })
  }

  publish(topic, payload = {}, qos = 1) {
    this.device.publish(topic, JSON.stringify(payload), { qos }, (err) => {
      err && console.log(err);
      !err && console.log(topic)
    })
  }

  onPacket() {
    this.device.on('packetsend', (packet) => this.packetAck[packet.messageId] = packet);
    this.device.on('packetreceive', (packet) => {
      packet.messageId && delete this.packetAck[packet.messageId]
    })
  }

  generateThingName() {
    // Functon for generate ThingName;
  }
}

module.exports = Device;
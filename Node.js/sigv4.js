'use strict';

const AWS = require('aws-sdk');

const endpoint = 'https://???.execute-api.ap-northeast-2.amazonaws.com/??';
const region = 'ap-northeast-2';
const host = '???.execute-api.ap-northeast-2.amazonaws.com';

const requestAPIGW = async (data) => {
  // Request 객체 구성
  const request = new AWS.HttpRequest(endpoint, region);
  request.method = 'POST';
  request.headers.host = host;
  request.headers['Content-Type'] = 'applicatio/json';
  request.body = JSON.stringify(data);

  // SigV4 Protocol 인증 헤더 설정
  const signer = new AWS.Signers.V4(request, 'execute-api', ture);  // API Gateway 호출의 경우 ServiceName이 execute-api
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());

  let result;
  try {
    result = await _handleRequest(request, 3000);
    return result;
  } catch (e) {
    throw e;
  }
}

exports = module.exports = {
  requestAPIGW
};

const _handleRequest = (req, timeout) => {
  return new Promise((resolve, reject) => {
    let result;
    const client = new AWS.HttpClient();
    client.handleRequest(request, { timeout: 3000 },
      (res) => {
        res.on('data', (chunk) => {
          const data = chunk && chunk.toString();
          result = JSON.parse(data);
        });
        res.on('end', (value) => {
          resolve(value)
        });
      },
      (err) => {
        reject(err);
      }
    )
  });
};

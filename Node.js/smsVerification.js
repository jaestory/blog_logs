'use strict';

const Axios = require('axios');
const Cache = require('memory-cache');
const Config = require('../config');

const postVerifyCode = async (request, h) => {
  const { phoneNumber } = request.payload;

  Cache.del(phoneNumber);

  let verifyCode;
  for (let i = 0; i < 6; i++) {
    verifyCode += parseInt(Math.random() * 10);
  };

  Cache.put(phoneNumber, verifyCode);

  try {
    Axios.post(
      `https://api-sens.ncloud.com/v1/sms/services/${Config.SENSAPI}/messages`,
      {
        'X-NCP-auth-key': Config.SENSAPI.AccessKeyId,
        'X-NCP-service-secret': Config.SENSAPI.serviceSecret
      },
      {
        type: 'sms',
        from: Config.SENSAPI.companyNumber,
        to: [phoneNumber],
        content: `인증번호는 ${verifyCode}입니다.`
      }
    )

    return h.response('인증번호 요청 성공');
  } catch (e) {
    Cache.del(phoneNumber);
    throw e;
  };
};

const confirmVerifyCode = async (request, h) => {
  const { phoneNumber, verifyCode } = request.payload;

  const CacheData = Cache.get(phoneNumber);
  if (!CacheData) {
    return h.response('인증번호를 다시 요청해주세요.').code(400);
  }

  if (CacheData !== verifyCode) {
    return h.response('인증번호를 다시 요청해주세요.').code(400);
  }

  Cache.del(phoneNumber);
  return h.response('인증번호 검증 성공');
};

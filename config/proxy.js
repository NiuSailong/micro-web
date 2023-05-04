import { SERVER_URL_OBJ } from './urlConfig';

const DQ_PROXY_ARRAY = [
    '/user',
    '/power',
];
const { CLIENT_ENV } = process.env;

export const SERVER_URL = function () {
  return SERVER_URL_OBJ[CLIENT_ENV] || SERVER_URL_OBJ.release;
};

const DQ_PROXY = function () {
  let obj = {};
  DQ_PROXY_ARRAY.forEach((Url) => {
    obj[Url] = {
      target: `${SERVER_URL()}/`,
      changeOrigin: true,
      secure: false,
    };
  });
  return obj;
};

export default DQ_PROXY();

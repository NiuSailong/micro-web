import { serverUrl } from './urlConfig';
const DQ_PROXY_ARRAY = [
  '/user',
  '/power',
];

const DQ_PROXY = function () {
  let obj = {};
  DQ_PROXY_ARRAY.forEach((Url) => {
    // @ts-ignore
    obj[Url] = {
      target: `${serverUrl}/`,
      changeOrigin: true,
      secure: false,
    };
  });
  return obj;
};

export default DQ_PROXY();

import { SERVER_URL_OBJ } from './urlConfig';

const DQ_PROXY_ARRAY = [
  '/user',
  '/power',
  '/table-layout',
  '/eam-ledger',
  '/eam-fault',
  '/dictionary',
  '/es',
  '/config-info',
  '/dictionary',
  '/new-control',
  '/settlement',
  '/eam-fault',
  '/control',
  '/job',
  '/jobLog',
  '/ancillaryservices',
  '/tianji-transaction',
  '/eim',
  '/pv-control',
  '/workflow-interlayer',
  '/workflow',
  '/purchaseinfo',
  '/binlog-sync-es',
  '/run-log',
  '/annex',
  '/log',
  '/signature',
  '/user-behavior',
  '/energystorage',
  '/iot-history',
  '/xiaoshouyi-config',
  '/message',
  '/dqconfig',
  '/ledger',
  '/datainfo',
  '/bff-eam',
  '/obtain-huineng-data',
];
const { CLIENT_ENV } = process.env;

const SERVER_URL = function () {
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

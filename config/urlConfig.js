const SERVER_URL_OBJ = {
  release: 'https://api.gw-greenenergy.com', //线上
  dev: 'https://api-dev.gw-greenenergy.com', //dev环境
  pre: 'https://api-pre.gw-greenenergy.com', //预上线环境
  test: 'https://api-test.gw-greenenergy.com', //测试环境
};

const MQTT_URL_OBJ = {
  release: 'wss://mqtt.gw-greenenergy.com:8083', //线上
  dev: 'wss://mqtt.gw-greenenergy.com:8083', //dev环境
  pre: 'wss://mqtt.gw-greenenergy.com:8083', //预上线环境
  test: 'wss://mqtt.gw-greenenergy.com:8083', //测试环境
};
const { CLIENT_ENV } = process.env;

const getCurrentUrl = () => {
  // @ts-ignore
  return SERVER_URL_OBJ[CLIENT_ENV] || SERVER_URL_OBJ.release;
};

const getCurrentMqttUrl = () => {
  // @ts-ignore
  return MQTT_URL_OBJ[CLIENT_ENV] || MQTT_URL_OBJ.release;
};

export const serverUrl = getCurrentUrl();
export const mqttUrl = getCurrentMqttUrl();

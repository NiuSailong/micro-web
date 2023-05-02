import { mqttCentre } from '#/utils/mqttCentre';

export const clientMqtt = (obj = {}) => {
  /**
   * @param side { string } 端类型
   * @param value { string } topic
   */
  const { list = [], callBack, prefix = 'power', deptNum = '' } = obj;
  list.forEach((t) => {
    let topic = '';
    let topicWildcard = undefined;
    switch (t?.mqttType) {
      case 'photovoltaic':
        topic = `${env || ''}${t?.side ? '/' : ''}${t?.side || ''}${t?.value || ''}`;
        topicWildcard = `${env || ''}${t?.side ? '/' : ''}${t?.side || ''}`;
        break;
      default:
        topic = `${env || ''}${t?.side ? '/' : ''}${t?.side || ''}${deptNum ? '/' : ''}${
          deptNum || ''
        }${t?.value || ''}`;
        topicWildcard = `${env || ''}${t?.side ? '/' : ''}${t?.side || ''}${deptNum ? '/' : ''}${
          deptNum || ''
        }`;
        break;
    }
    mqttCentre.subscribe(
      `${prefix}${t?.key}`,
      topic,
      callBack,
      t.isWildcard ?? false ? topicWildcard : undefined,
    );
  });
};

export const clearMqtt = (obj = {}) => {
  const { list = [], prefix = 'power' } = obj;
  list.forEach((n) => {
    mqttCentre.unsubscribe(`${prefix}${n?.key}`);
  });
};

export const itemSize = ({ height = 0, width = 0, oW = 140, oH = 60 }, autoH = false) => {
  let lastWidth = width - 5;
  let wNum = Math.floor(lastWidth / oW);
  let lW = Math.floor(lastWidth / wNum);
  let hNum = 0;
  let lH = 0;
  if (autoH) {
    hNum = Math.ceil((height - 2) / oH);
    lH = Math.floor((height - 2) / hNum);
  }
  return { width: lW - 1, height: autoH ? lH : Math.floor((oH * lW) / oW) };
};

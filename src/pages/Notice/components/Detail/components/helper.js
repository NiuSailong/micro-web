export const getSiteType = function (arr = [], tid = '') {
  const array = arr.filter((k) => k.value === tid);
  if (array.length > 0) {
    return array[0].description;
  }
  return '';
};
export const getRecipient = function (arr = []) {
  const array = arr.map((item) => {
    return `${item.label}(${item.value.length}人)`;
  });
  return array.join('、');
};
export const getAnnounce = function (obj = {}) {
  return obj.title || '';
};
export const getDept = function (obj = {}) {
  return obj.deptName || '';
};
export const getDevice = function (arr = []) {
  const array = arr.map((item) => {
    return `${item.assetname}`;
  });
  return array.join('、');
};

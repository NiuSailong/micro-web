import moment from 'moment';
export const DRAWERTITLE_ENMU = {
  edit: '编辑',
  add: '新增',
};
export const mergeRowNum = (text, dataSource, index, kye) => {
  if (text === null || text === 'null') {
    return 1;
  }
  if (index !== 0 && text === dataSource[index - 1]?.[kye]) {
    return 0;
  }
  let rowSpan = 1;
  for (let i = index + 1; i < dataSource.length; i++) {
    if (text !== dataSource[i]?.[kye]) {
      break;
    }
    rowSpan++;
  }
  return rowSpan;
};
export const rulesArr = {
  lengthRule: (len) => [
    () => ({
      validator(_, value) {
        if (len >= String(value)?.length || !value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(`最多${len}个字符`));
      },
    }),
  ],
  numRule: [
    () => ({
      validator(_, value) {
        if (/^[0-9]*$/.test(value) || !value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('只能输入数字类型'));
      },
    }),
  ],
  repeat: (dataList, key) => [
    () => ({
      validator(_, value) {
        const dataFilter = dataList?.filter((v) => v[key] == value);
        if (!(dataFilter?.length > 1) || !value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('父数据源名称重复'));
      },
    }),
  ],
  time: [
    () => ({
      validator(_, value) {
        const newDate = moment().format('YYYY_MM_DD');
        const valueDate = moment(value).format('YYYY_MM_DD');
        if (!moment(newDate).isBefore(valueDate) || !value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('选择时间无效'));
      },
    }),
  ],
  integer: [
    () => ({
      validator(_, value) {
        if (/^-?[1-9]\d*$/.test(value) || !value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('只能输入整数'));
      },
    }),
  ],
  float: [
    () => ({
      validator(_, value) {
        if (/^\d+(\.\d{1,})$/.test(value) || !value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('只能输入小数'));
      },
    }),
  ],
};

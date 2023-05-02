import _ from 'lodash';
// 是否是累计值选择项
const _CURRENT = [
  { description: '是', value: true },
  { description: '否', value: false },
];
export const DEVICE_TABLE_COLUMN = (dicListMap, options) => {
  const colList = [
    {
      title: '设备编号',
      dataIndex: 'device_num',
      tip: true,
      width: 170,
    },
    /* {
      title: 'edId',
      dataIndex: 'edId',
      hidden: true,
      className: 'hidden',
      tip: false,
    },
    {
      title: 'id',
      dataIndex: 'id',
      hidden: true,
      className: 'hidden',
      tip: false,
    }, */
    {
      title: '资产编号',
      dataIndex: 'asset_num',
      hidden: true,
      width: 170,
      tip: false,
    },
    {
      title: '数据来源',
      dataIndex: 'data_source',
      inputType: 'select',
      tip: true,
      colType: 'select',
      colOptions: options,
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      tip: true,
      colType: 'select',
      colOptions: dicListMap.ELECTRICAL_EQUIPMENT_TYPE,
    },
    /* {
      title: '类型名称',
      dataIndex: 'type_name',
      hidden: true,
      className: 'hidden',
      tip: false
    }, */
    {
      title: 'iot_tag',
      dataIndex: 'iot_tag',
      editable: true,
      tip: true,
    },
    {
      title: 'tag类型',
      dataIndex: 'tag_type',
      colType: 'select',
      colOptions: dicListMap.TAG_TYPE,
      tip: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      colType: 'select',
      colOptions: dicListMap.ELECTRICITY_MEASURE_UNIT,
      tip: true,
    },
    {
      title: '统一单位所用乘法系数',
      dataIndex: 'unity_multiplier',
      colType: 'inputNumber',
      width: 100,
      tip: true,
    },
    {
      title: '是否是累计值',
      dataIndex: 'current',
      colType: 'select',
      colOptions: _CURRENT,
      tip: false,
    },
  ];
  return colList;
};
/**
 * @description 表单 map 对象 搜索去掉空字符串 undefined null值 保留有效参数值F
 * @author LC@1981824361
 * @date 2021-11-20
 * @export
 * @param {*} filedsValue
 * @returns serchObj
 */
export function filterEmptyFileds(filedsValue) {
  if (!filedsValue) {
    throw new Error('请传入表单数据！');
  } else {
    const serchObj = {};
    Object.keys(filedsValue).forEach((key) => {
      if (key && filedsValue[key]) {
        serchObj[key] = filedsValue[key];
      } else if (filedsValue[key] === false) {
        serchObj[key] = filedsValue[key];
      }
    });
    return serchObj;
  }
}

/**
 * @description 随机 uuid
 * @author LC@1981824361
 * @date 2021-11-20
 * @export
 * @returns
 */
export function guid() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 模板数据
export const mainData = {
  data_source: 'iot',
  type: 'N',
  iot_tag: 'DPq',
  tag_type: 'DailyEnergy',
  unit: '万kWh',
  unity_multiplier: 0.001,
  current: true,
};

export const sameMockData = {
  data_source: 'same',
  type: 'same',
  iot_tag: '同上',
  tag_type: 'same',
  unit: 'same',
  unity_multiplier: '同上',
  current: 'same',
};

export const mapKeyValue = _.map(sameMockData, function (value, prop) {
  return { prop, value };
});

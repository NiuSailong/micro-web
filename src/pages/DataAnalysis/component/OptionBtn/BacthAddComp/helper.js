import _ from 'lodash';
import moment from 'moment';
import { addAssetNumMap } from '../../../../../services/stationMap';
import { batchAddProject, batchAddStation } from './service';

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

export const STATION_TABLE_COLUMN = () => {
  const colList = [
    {
      title: '部门编码',
      dataIndex: 'deptNum',
      tip: true,
      width: 170,
      fixed: 'left',
    },
    {
      title: '部门名称',
      dataIndex: 'deptName',
      hidden: true,
      width: 170,
      tip: true,
      fixed: 'left',
    },
    {
      title: '简称',
      dataIndex: 'abbreviate',
      width: 170,
      tip: true,
    },
    {
      title: '简称编码',
      dataIndex: 'abbreviateCode',
      width: 170,
      tip: false,
    },
    {
      title: '地区',
      dataIndex: 'region',
      tip: true,
      width: 170,
    },
    {
      title: '项目类型',
      colType: 'select',
      dataIndex: 'projectType',
      tip: false,
      width: 170,
    },
    {
      title: '装机台数',
      dataIndex: 'fdczjCount',
      tip: false,
      width: 170,
    },
    {
      title: '经度',
      dataIndex: 'longitude',
      tip: false,
      width: 170,
    },
    {
      title: '维度',
      dataIndex: 'latitude',
      tip: false,
      width: 170,
    },
    {
      title: '合同容量',
      dataIndex: 'contractCapacity',
      tip: false,
      width: 170,
    },
    {
      title: '风功率预测系统厂家',
      dataIndex: 'powerForecastFactory',
      tip: false,
      width: 170,
    },
    {
      title: '能巢版本',
      dataIndex: 'nengchaoVersion',
      tip: false,
      width: 170,
    },
    {
      title: '移交生产时间',
      colType: 'DatePicker',
      dataIndex: 'transProductionTime',
      tip: false,
      width: 170,
    },
    {
      title: '能巢布置时间',
      colType: 'DatePicker',
      dataIndex: 'nengchaoTime',
      tip: false,
      width: 170,
    },
    {
      title: '部门区域',
      dataIndex: 'deptArea',
      tip: false,
      width: 170,
    },
    {
      title: '所属集控',
      colType: 'select',
      dataIndex: 'centralControl',
      tip: false,
      width: 170,
      selectProps: {
        value: 'dept_id',
        label: 'dept_name',
      },
    },
    {
      title: '所属虚拟场站',
      colType: 'select',
      dataIndex: 'storedEnergy',
      placeholder: '',
      width: 170,
      message: '不能为空',
      tip: false,
      selectProps: {
        value: 'dept_id',
        label: 'dept_name',
      },
    },
    {
      title: '所属资产',
      dataIndex: 'assetManagement',
      colType: 'cascader',
      tip: true,
      width: 170,
    },
    {
      title: '所属客户',
      colType: 'cascader',
      dataIndex: 'customer',
      tip: true,
      width: 170,
    },
  ];
  return colList;
};

export const PROJECT_TABLE_COLUMN = () => {
  const Other_Col = [
    {
      title: '项目期数',
      colType: 'select',
      dataIndex: 'project',
      placeholder: '',
      width: 170,
      message: '不能为空',
      tip: false,
    },
    {
      title: '所属场站',
      colType: 'select',
      dataIndex: 'parentDeptNum',
      placeholder: '',
      width: 170,
      message: '不能为空',
      tip: true,
    },
  ];
  const projectCol = [...STATION_TABLE_COLUMN()];
  projectCol.splice(2, 0, ...Other_Col);
  return _.take(projectCol, projectCol.length - 2);
};

export const ASSETMAP_COLUMN = () => {
  const map_Col = [
    {
      title: 'eam风机编号',
      colType: 'select',
      dataIndex: 'assetNum',
      placeholder: '',
      width: 150,
      message: '不能为空',
      tip: true,
    },
    /* {
      title: 'eam部门编码',
      colType: 'select',
      dataIndex: 'deptNum',
      placeholder: '',
      width: 150,
      message: '不能为空',
      tip: true,
    }, */
    {
      title: '集控设备编号',
      dataIndex: 'deviceId',
      placeholder: '',
      width: 150,
      message: '不能为空',
      tip: true,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      placeholder: '',
      width: 150,
      message: '不能为空',
      tip: true,
    },
  ];
  return map_Col;
};

export const BatchCompConfigForMapDept = [
  {
    cardTitle: '批量添加设备',
    originCount: 10,
    tableColumn: ASSETMAP_COLUMN,
    pageFlag: 'assetmap',
    initValueObj: {},
    requestService: addAssetNumMap,
    checkObj: {
      checkKey: 'assetNum',
      checkMes: '保存数据eam风机编号重复，请检验数据',
    },
  },
];

export const BatchCompConfig = [
  {
    cardTitle: '批量添加场站',
    originCount: 10,
    tableColumn: STATION_TABLE_COLUMN,
    pageFlag: 'station',
    initValueObj: {
      zgLabel: '场站',
      khLabel: '场',
      valid: '1',
    },
    requestService: batchAddStation,
    checkObj: {
      checkKey: 'deptNum',
      checkMes: '保存数据部门编码重复，请检验数据',
    },
  },
  {
    cardTitle: '批量添加项目(请先保存场站)',
    originCount: 1,
    tableColumn: PROJECT_TABLE_COLUMN,
    pageFlag: 'project',
    initValueObj: {
      zgLabel: '项目',
      khLabel: '期',
      valid: '1',
    },
    requestService: batchAddProject,
    checkObj: {
      checkKey: 'deptNum',
      checkMes: '保存数据部门编码重复，请检验数据',
    },
  },
  /* {
    cardTitle: '批量添加设备',
    originCount: 10,
    tableColumn: ASSETMAP_COLUMN,
    pageFlag: 'assetmap',
    initValueObj: {},
    requestService: addAssetNumMap,
    checkObj: {
      checkKey: 'assetNum',
      checkMes: '保存数据eam风机编号重复，请检验数据',
    },
  }, */
];

// 项目类型、资管标签、客户标签
export const DICTIONARY_TYPE_LIST = ['PROJECT_TYPE', 'ZG_LABEL', 'KH_LABEL', 'PROJECT_NUMBER'];

// 默认数据
export const sameMockData = (pageFlag) => {
  let obj = {};
  if (pageFlag === 'assetmap') {
    obj.deptNum = 'same';
    obj.creator = '同上';
    return obj;
  }
  const originCol = BatchCompConfig.filter((col) => col.pageFlag === pageFlag)[0].tableColumn;
  originCol()
    .slice(2)
    .forEach((b) => {
      if (b.colType === 'cascader') {
        obj[b.dataIndex] = ['same'];
      } else if (b.colType === 'select') {
        obj[b.dataIndex] = 'same';
      } else if (b.colType === 'DatePicker') {
        obj[b.dataIndex] = moment();
      } else {
        obj[b.dataIndex] = '同上';
      }
    });
  return obj;
};

export const mapKeyValue = (flag) => {
  return _.map(sameMockData(flag), function (value, prop) {
    return { prop, value };
  });
};

// 级联同上obj
export const sameCascaderObj = {
  title: '同上',
  value: 'same',
};
/**
 * @description 判断数组元素是否重复
 * @export
 * @param {*} list 数组
 * @param {*} checkKey 需判断的数组元素
 * @returns {*}
 */
export function checkIsRepeat(list, checkKey) {
  const uniqList = _.unionBy(list, checkKey);
  if (uniqList.length !== list.length) {
    return true;
  }
  return false;
}

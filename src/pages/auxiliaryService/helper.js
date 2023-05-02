export const TYPE_ENUM = {
  22: {
    type: 'modelEh',
    tableKey: [
      'num',
      'username',
      'capacity',
      'area',
      'type',
      'factory',
      'mode',
      'owner',
      'iscontrol',
      'equipmentid',
    ],
  }, //电锅炉
  20: { type: 'model', tableKey: ['num', 'deptname', 'area', 'capacity', 'deptnum', 'iscontrol'] }, //电储能
  30: {
    type: 'modelCs',
    tableKey: [
      'seq',
      'name',
      'area',
      'capacity',
      'ecQty',
      'type',
      'stattionid',
      'iscontrol',
      'isparticipate',
    ],
  }, //充电桩
  45: {
    type: 'modelIl',
    tableKey: ['num', 'username', 'area', 'capacity', 'type', 'equipmentid', 'iscontrol'],
  }, //工业负荷
};

export const DETAIL_ENUM = {
  22: ['assetnum', 'name', 'sendTotal', 'sendMeas', 'iscontrol', 'models'], //电锅炉
  20: [
    'assetnum',
    'name',
    'sendTotal',
    'sendMeas',
    'iscontrol',
    'capacity',
    'maxchval',
    'mindischval',
    'power',
    'models',
  ], //电储能
  30: [
    'assetnum',
    'name',
    'type',
    'factory',
    'investor',
    'sendTotal',
    'sendMeas',
    'iscontrol',
    'capacity',
    'models',
  ], //充电桩
  45: ['assetnum', 'name', 'sendTotal', 'sendMeas', 'iscontrol', 'models'], //工业负荷
};

export const DETAIL_TITLE = {
  assetnum: '设备编号(必填)',
  name: '设备名称(必填)',
  sendTotal: '是否上送总加数据(必填)',
  sendMeas: '是否上送单体数据(必填)',
  iscontrol: '是否可控(必填 默认为否)',
  models: '设备模型(必填)',
  capacity: '设备容量（必填)',
  maxchval: '最大可充值(非必填)',
  mindischval: '最小可放值(非必填)',
  power: '功率(非必填)',
  type: '桩类型(必填)',
  factory: '桩厂家(必填)',
  investor: '投资方(必填)',
};

export const TITLE_ENUM = {
  num: '序号',
  username: '用户名',
  area: '所在区域',
  capacity: '容量',
  type: '用户类型',
  equipmentid: '运营系统内部ID',
  iscontrol: '是否可控',
  isparticipate: '是否参与',
  ecQty: '全站桩数量',
  stattionid: '运营系统内部ID',
  seq: '序号',
  factory: '设备厂家',
  mode: '蓄热方式',
  owner: '业主方',
  deptname: '站名',
  name: '站名',
  deptnum: '运营系统内部ID',
};

//复制粘贴
export const handlePaste = (values) => {
  const value = values.trim();
  const hiddenInputValue =
    value.indexOf('\\n') >= 0 ? value.replace(/[\s+]/g, ';') : value.replace(/[\r\n]/g, ';');
  const valueSplit =
    hiddenInputValue.indexOf(';;') > -1
      ? hiddenInputValue
      : hiddenInputValue.replace(/\s{1,}/g, ';');
  const data =
    hiddenInputValue.indexOf(';;') > -1
      ? hiddenInputValue.split(';;')
      : valueSplit.indexOf(';') > -1
      ? valueSplit.split(';')
      : valueSplit.split(/[\s+\n\f\r]/g);
  // let NumReg = /^\D$/;
  // let result = data.find(item => NumReg.test(item));
  // if (result) {
  //   console.log('执行了')
  //   return [];
  // }
  return data;
};

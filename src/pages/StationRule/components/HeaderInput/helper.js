export let Detail = [
  {
    title: '场战编号',
    tip: true,
    detail: 'number',
    span: 12,
    placeholder: '请输入场站编号',
    type: 'input',
  },
  {
    title: '场站名称',
    tip: true,
    detail: 'name',
    span: 12,
    placeholder: '请输入场站名称',
    type: 'input',
  },
  {
    title: '场站简称编号',
    tip: true,
    detail: 'detailname',
    span: 12,
    placeholder: '请输入场站简称编号',
    type: 'input',
  },
  {
    title: '场站简称',
    tip: true,
    detail: 'abbreviation',
    span: 12,
    placeholder: '请输入场站简称',
    type: 'input',
  },
  {
    title: '场站类型',
    tip: true,
    detail: 'type',
    span: 12,
    placeholder: '请输入场站类型',
    type: 'select',
    filterOption: false,
  },
  {
    title: '所属地区',
    tip: true,
    detail: 'aera',
    span: 12,
    placeholder: '请选择所属地区',
    type: 'cascader',
    filterOption: false,
  },
  {
    title: '所属资管组织',
    tip: true,
    detail: 'organization',
    span: 12,
    placeholder: '请输入所属资管组织',
    type: 'treeSelect',
  },
  {
    title: '所属客户',
    tip: true,
    detail: 'customer',
    span: 12,
    placeholder: '请选择所属客户',
    type: 'select',
    filterOption: true,
  },
  {
    title: '装机容量',
    tip: true,
    detail: 'capacity',
    span: 12,
    placeholder: '请输入装机容量',
    type: 'input',
  },
  {
    title: '装机数量',
    tip: true,
    detail: 'figure',
    span: 12,
    placeholder: '请输入装机数量',
    type: 'input',
  },
  {
    title: '经度',
    tip: false,
    detail: 'longitude',
    span: 12,
    placeholder: '请输入经度',
    type: 'input',
  },
  {
    title: '纬度',
    tip: false,
    detail: 'latitude',
    span: 12,
    placeholder: '请输入纬度',
    type: 'input',
  },
  {
    title: '备注',
    tip: false,
    detail: 'remarks',
    span: 24,
    placeholder: '请输入备注',
    type: 'aera',
  },
  {
    title: '创建人',
    tip: false,
    detail: 'Founder',
    span: 12,
    color: true,
    type: 'text',
  },
  {
    title: '创建时间',
    tip: false,
    detail: 'time',
    span: 12,
    color: true,
    type: 'text',
  },
];

export let Mokedata = {
  number: '0100102',
  name: '濮阳雅润风电场',
  detailname: 'PYYR',
  abbreviation: '濮阳雅润',
  type: '风电',
  aera: '溯州市',
  organization: '北方运营中心-朔州区域',
  customer: '天润新能',
  capacity: '50',
  figure: '30',
  longitude: '113.225',
  latitude: '778.222',
  remarks: '暂无异常情况',
  Founder: '张三',
  time: '2020.05.06 11：12',
};

export let CentralizedControl = [
  {
    title: '对应集控系统',
    tip: true,
    detail: 'CentralizedControlSystem',
    span: 12,
    placeholder: '请选择对应集控系统',
    type: 'select',
  },
  {
    title: '集控系统场战编号',
    tip: true,
    detail: 'NumberOfCentralizedControl',
    span: 12,
    placeholder: '请输入集控系统场战编号',
    type: 'input',
  },
  {
    title: '是否发送FTP',
    tip: true,
    detail: 'FTP',
    span: 12,
    placeholder: '请选择是否发动FTP',
    type: 'select',
  },
  {
    title: '是否启用',
    tip: true,
    detail: 'Enable',
    span: 12,
    placeholder: '请输入场站编号',
    type: 'select',
  },
  {
    title: '对应AGC设备',
    tip: false,
    detail: 'ACG',
    span: 12,
    placeholder: '请选择对应ACG设备（多个）',
    type: 'select',
    mode: 'multiple',
  },
];
export let MokeCentralized = {
  CentralizedControlSystem: '北方集控系统',
  NumberOfCentralizedControl: '20010201',
  FTP: '是',
  Enable: '是',
  ACG: 'B设备，C设备',
};

export let MokeSelect = {
  project: [],
};

export let Group = [
  {
    title: '项目名称',
    tip: true,
    detail: 'projectName',
    span: 12,
    placeholder: '请选择项目名称',
    type: 'treeSelect',
  },
  {
    title: '场站名称',
    tip: false,
    detail: 'forceStationName',
    span: 12,
    placeholder: '根据项目名称自动关联',
    type: 'text',
  },
  {
    title: '场站类型',
    tip: false,
    detail: 'forceStationType',
    span: 12,
    placeholder: '根据项目名称自动关联',
    type: 'text',
  },
  {
    title: '所属资管组织',
    tip: false,
    detail: 'infoOrg',
    span: 12,
    placeholder: '根据项目名称自动关联',
    type: 'text',
  },
  {
    title: '风光管家',
    tip: true,
    detail: 'sceneryHousekeeperIds',
    span: 12,
    mode: 'multiple',
    placeholder: '请选择风光管家',
    type: 'selectTree',
  },
  {
    title: '服务团队',
    tip: true,
    detail: 'serviceTeamIds',
    mode: 'multiple',
    span: 12,
    placeholder: '请选择服务团队',
    type: 'selectTree',
  },
  {
    title: '创建人',
    tip: false,
    detail: 'createUserName',
    span: 12,
    placeholder: '',
    type: 'text',
    color: true,
  },
  {
    title: '创建时间',
    tip: false,
    detail: 'createTime',
    span: 12,
    placeholder: '',
    type: 'text',
    color: true,
  },
];

export let oldData = [
  {
    title: '修改人',
    tip: false,
    detail: 'updateUserName',
    span: 12,
    placeholder: '',
    type: 'text',
    color: true,
  },
  {
    title: '修改时间',
    tip: false,
    detail: 'updateTime',
    span: 12,
    placeholder: '',
    type: 'text',
    color: true,
  },
];

export let GroupData = {
  project: '北方运营中心',
  Station: '根据项目名称自动关联',
  StationType: '根据项目名称自动关联',
  StationTream: '根据项目名称自动关联',
  Housekeeper: '张三特技',
  Creater: '李四',
  CreateTime: '',
};

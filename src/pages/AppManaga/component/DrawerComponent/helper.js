export const customizeColumns = [
  {
    code: 'menuCode',
    type: 'input',
    title: '菜单编码',
    width: 230,
    required: true,
  },
  {
    title: '上级菜单ID',
    code: 'parentId',
    type: 'select',
    width: 200,
    required: true,
  },
  {
    title: '菜单/按钮名称',
    code: 'menuName',
    type: 'input',
    width: 160,
    required: true,
  },
  {
    title: 'type选择',
    code: 'type',
    type: 'select',
    width: 150,
    required: true,
  },
  {
    title: '系统来源',
    code: 'source',
    type: 'select',
    width: 110,
    required: true,
  },
  {
    title: '权限选择',
    code: 'powerId',
    type: 'select',
    width: 205,
  },
  {
    title: 'component',
    code: 'component',
    type: 'input',
    width: 200,
  },
  {
    title: '描述',
    code: 'description',
    type: 'input',
    width: 150,
  },
  {
    title: '图标',
    code: 'icon',
    type: 'input',
    width: 180,
  },
  {
    title: '对应路由path',
    code: 'menupath',
    type: 'input',
    width: 220,
  },
  {
    title: '排序',
    code: 'orderNum',
    type: 'input',
    width: 100,
  },
  {
    title: '权限标识',
    code: 'perms',
    type: 'input',
    width: 140,
  },
];

export const _systemSource_ = [
  {
    id: 1,
    label: 'web',
    value: 'web',
  },
  {
    id: 2,
    label: 'app',
    value: 'app',
  },
];

export const _typeChoose_ = [
  {
    id: 1,
    label: '菜单',
    value: '0',
  },
  {
    id: 2,
    label: '按钮',
    value: '1',
  },
  {
    id: 3,
    label: '模块',
    value: '3',
  },
];

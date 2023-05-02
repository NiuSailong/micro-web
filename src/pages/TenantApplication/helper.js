import _ from 'lodash';
export const TABLE_HEADER = {
  companyNum: {
    title: '公司编码',
    dataIndex: 'companyNum',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    float: 'left',
  },
  companyName: {
    title: '公司名称',
    dataIndex: 'companyName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    float: 'left',
  },
  licence: {
    title: 'licence',
    dataIndex: 'licence',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    float: 'left',
  },
  /* appName: {
    title: '开始时间',
    dataIndex: 'appName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    float: 'left',
  }, */
  expireTime: {
    title: '过期时间',
    dataIndex: 'expireTime',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    float: 'left',
  },
};

export const STEP_lIST = [
  {
    title: '基本信息',
    status: 'wait',
  },
  {
    title: '应用配置',
    status: 'wait',
  },
  {
    title: '菜单配置',
    status: 'wait',
  },
];

export const STEP = {
  previous: -1,
  next: 1,
};

/**
 * 对比数据
 * @param {*} arr1 原数据
 * @param {*} arr2 操作后的数据
 * @returns
 */
export const handleArr = (arr1, arr2) => {
  const _arr1 = new Set(arr1);
  const _arr2 = new Set(arr2);
  const someArr = [...new Set([..._arr1].filter((x) => _arr2.has(x)))];
  const deleteArr = [];
  arr1.map((item) => {
    if (someArr.indexOf(item) === -1) {
      deleteArr.push(item);
    }
  });
  const addArr = [];
  arr2.map((item) => {
    if (someArr.indexOf(item) === -1) {
      addArr.push(item);
    }
  });
  // 交集为不变
  const sameArr = _.intersection(arr1, arr2);
  return { deleteArr, addArr, sameArr };
};

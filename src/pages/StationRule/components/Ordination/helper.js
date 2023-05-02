import React from 'react';
import { turquoise } from 'color-name';

const COLUMNSOBJ = {
  userName: {
    title: '用户',
    dataIndex: 'userName',
    sorter: true,
    showSorterTooltip: false,
    width: 185,
    ellipsis: true,
  },
  workState: {
    title: '工作状态',
    dataIndex: 'workState',
    sorter: true,
    showSorterTooltip: false,
    width: 110,
    ellipsis: true,
  },
  state: {
    title: '工作状态',
    dataIndex: 'state',
    sorter: true,
    showSorterTooltip: false,
    width: 100,
    ellipsis: true,
  },
  serviceTeam: {
    title: '所属服务团队',
    dataIndex: 'serviceTeam',
    sorter: true,
    showSorterTooltip: false,
    width: 200,
    ellipsis: true,
  },
  remark: { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true },
  teamId: {
    title: '团队编码',
    dataIndex: 'teamId',
    sorter: true,
    showSorterTooltip: false,
    width: 120,
    ellipsis: true,
  },
  serviceTeamName: {
    title: '团队名称',
    dataIndex: 'serviceTeamName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  serviceRange: {
    title: '服务范围',
    dataIndex: 'serviceRange',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  projectName: {
    title: '项目名称',
    dataIndex: 'projectName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  stationName: {
    title: '场站名称',
    dataIndex: 'stationName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  stationType: {
    title: '场站类型',
    dataIndex: 'stationType',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  organization: {
    title: '所属资管组织',
    dataIndex: 'organization',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  checkState: {
    title: '检查状态',
    dataIndex: 'checkState',
    sorter: true,
    showSorterTooltip: false,
    width: 100,
    ellipsis: true,
  },
  runState: {
    title: '运行状态',
    dataIndex: 'runState',
    sorter: true,
    showSorterTooltip: false,
    width: 100,
    ellipsis: true,
  },
};

export const COLUMNS_OPTIONS = function (keyList = [], onColumn, sortObj = {}) {
  let array = [];

  keyList.forEach((keyVal) => {
    const item = COLUMNSOBJ[keyVal];
    if (item) {
      array.push({
        ...item,
        sortOrder: sortObj.type == keyVal ? sortObj.value : false,
        render: (text, row, index) => {
          return onColumn(text, row, index, keyVal);
        },
      });
    }
  });
  return array;
};

export const TableTitle = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '场站名称',
    dataIndex: 'forceStationName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '场站类型',
    dataIndex: 'forceStationType',
    sorter: true,
    showSorterTooltip: false,
    width: 100,
    ellipsis: true,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '所属资管组织',
    dataIndex: 'infoOrg',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '检查状态',
    dataIndex: 'checkStatus',
    sorter: true,
    showSorterTooltip: false,
    width: 100,
    ellipsis: turquoise,
    render: (text) => {
      if (text === '通过') {
        return <span style={{ color: '#28B28B' }}>{text}</span>;
      }
      if (text === '未通过') {
        return <span style={{ color: '#EF3B24' }}>{text}</span>;
      }
      if (text === '未检查') {
        return <span style={{ color: '#F58D29' }}>{text}</span>;
      }
    },
  },
  {
    title: '运行状态',
    dataIndex: 'isDel',
    sorter: true,
    showSorterTooltip: false,
    width: 100,
    ellipsis: true,
    render: (text) => {
      return text || '-';
    },
  },
];

export const fiflter = function (sorter) {
  let arr = [];
  TableTitle.forEach((item) => {
    arr.push({
      ...item,
      sortOrder: sorter.type == item.dataIndex ? sorter.value : false,
    });
  });
  return arr;
};

export const data = [
  {
    id: Date.parse(new Date()) + `${Math.floor(Math.random() * 10000)}`,
    linenum: '',
    faultCode: '',
    faultName: '',
    stdhhours: '',
    stdcosts: [],
    workType: '',
    confirm: '',
  },
];

//日期格式转化
Date.prototype.Format = function (fmt) {
  let lintFmt = fmt;
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(lintFmt))
    lintFmt = lintFmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(lintFmt))
      lintFmt = lintFmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length),
      );
  return lintFmt;
};
var myDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
export let Sets = {
  projectName: null,
  rule2: '600',
  rule1: '600',
  distance: '10000',
  timeoutRate: '90',
  taxRate: '6',
  incomeRate: '40',
  rewardRate: '40',
  integralRewardRate: '1',
  planRewardAmount: '50',
  rewardAmount: '260',
  unplanProportion: '50',
  planRewardCycle: '30',
  rewardCycle: '30',
  planRewardRate: '40',
  penaltyCycle: '7',
  incomeDistributionRatio: '78',
  planRewardNum: '1',
  rewardNum: '1',
  stdcostsHours: '60',
  createTime: myDate,
};

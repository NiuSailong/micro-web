import React from 'react';
import { Menu } from 'antd';

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
  remarks: { title: '备注', dataIndex: 'remarks', width: 120, ellipsis: true },
  teamCode: {
    title: '团队编码',
    dataIndex: 'teamCode',
    sorter: true,
    showSorterTooltip: false,
    width: 120,
    ellipsis: true,
  },
  teamName: {
    title: '团队名称',
    dataIndex: 'teamName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  serviceTeamDept: {
    title: '服务范围',
    dataIndex: 'serviceTeamDept',
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
  forceStationName: {
    title: '场站名称',
    dataIndex: 'forceStationName',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  forceStationType: {
    title: '场站类型',
    dataIndex: 'forceStationType',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  infoOrg: {
    title: '所属资管组织',
    dataIndex: 'infoOrg',
    sorter: true,
    showSorterTooltip: false,
    width: 160,
    ellipsis: true,
  },
  checkStatus: {
    title: '检查状态',
    dataIndex: 'checkStatus',
    sorter: true,
    showSorterTooltip: false,
    width: 110,
  },
  isDel: {
    title: '运行状态',
    dataIndex: 'isDel',
    sorter: true,
    showSorterTooltip: false,
    width: 110,
  },
};

export const COLUMNS_OPTIONS = function (keyList = [], onColumn, sortObj = {}, columns) {
  const array = [];
  const allColumns = { ...COLUMNSOBJ, ...columns };
  keyList.forEach((keyVal) => {
    const item = allColumns[keyVal];
    if (item) {
      array.push({
        ...item,
        sortOrder: sortObj.type === keyVal ? sortObj.value : false,
        render: (text, row, index) => {
          return onColumn(text, row, index, keyVal);
        },
      });
    }
  });
  return array;
};

export const MENU_OPTIONS = function (array, onClick) {
  return (
    <Menu onClick={onClick}>
      {array.map((item) => {
        return <Menu.Item key={item.type}>{item.name}</Menu.Item>;
      })}
    </Menu>
  );
};

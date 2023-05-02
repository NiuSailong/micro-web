import React from 'react';
import { Menu } from 'antd';

export const TABLE_HEADERS = {
  deptId: {
    title: '部门ID',
    dataIndex: 'deptId',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  //   id: {
  //       title: 'ID',
  //       dataIndex: 'id',
  //       width: 50,
  //       showSorterTooltip: false,
  //       sorter: false,
  //   },
  deptName: {
    title: '部门名称',
    dataIndex: 'deptName',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  deptNum: {
    title: '部门编号',
    dataIndex: 'deptNum',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  abbreviate: {
    title: '简称',
    dataIndex: 'abbreviate',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  zgLabel: {
    title: '资管标签',
    dataIndex: 'zgLabel',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  khLabel: {
    title: '客户标签',
    dataIndex: 'khLabel',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  projectType: {
    title: '项目类型',
    dataIndex: 'projectType',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  abbreviateCode: {
    title: '简称编码',
    dataIndex: 'abbreviateCode',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  region: {
    title: '地区',
    dataIndex: 'region',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  parentId: {
    title: '父级部门ID',
    dataIndex: 'parentId',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  fdczjCount: {
    title: '装机台数',
    dataIndex: 'fdczjCount',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  windFarmLocation: {
    title: '风电场地址',
    dataIndex: 'windFarmLocation',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  createBy: {
    title: '创建人',
    dataIndex: 'createBy',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  createTime: {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
  modifyTime: {
    title: '修改时间',
    dataIndex: 'modifyTime',
    width: 100,
    showSorterTooltip: false,
    sorter: false,
  },
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

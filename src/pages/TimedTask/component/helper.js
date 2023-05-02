import React from 'react';
import moment from 'moment';

export const listArr = [
  {
    title: '任务日志ID',
    dataIndex: 'logId',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 50,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 50,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
  {
    title: 'spring bean名称',
    dataIndex: 'beanName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
  {
    title: '耗时(单位：毫秒)',
    dataIndex: 'times',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
  {
    title: '方法名',
    dataIndex: 'methodName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
  {
    title: '执行方法的参数',
    dataIndex: 'params',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    render(text, row) {
      return <div key={row.jobId}>{text ? moment(text).format('YYYY-MM-D') : '-'}</div>;
    },
  },
  {
    title: '失败信息',
    dataIndex: 'error',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
    render(text, row) {
      return <div key={row.jobId}>{text || '-'}</div>;
    },
  },
];

export const titleArr = [
  {
    title: '任务ID',
    dataIndex: 'jobId',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 50,
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 50,
  },

  {
    title: 'spring bean名称',
    dataIndex: 'beanName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },

  {
    title: 'cron表达式',
    dataIndex: 'cronExpression',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },

  {
    title: '方法名',
    dataIndex: 'methodName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
  {
    title: '执行方法的参数',
    dataIndex: 'params',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
];

export const addArr = [
  {
    title: '任务ID',
    dataIndex: 'jobId',
  },
  {
    title: 'spring bean名称',
    dataIndex: 'beanName',
  },
  {
    title: 'cron表达式',
    dataIndex: 'cronExpression',
  },
  {
    title: '方法名',
    dataIndex: 'methodName',
  },
  {
    title: '执行方法的参数',
    dataIndex: 'params',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];

export const lookupArr = [
  {
    title: '任务ID',
    dataIndex: 'jobId',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 50,
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 50,
  },

  {
    title: 'spring bean名称',
    dataIndex: 'beanName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },

  {
    title: 'cron表达式',
    dataIndex: 'cronExpression',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },

  {
    title: '方法名',
    dataIndex: 'methodName',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
  {
    title: '执行方法的参数',
    dataIndex: 'params',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    sorter: false,
    showSorterTooltip: false,
    ellipsis: true,
    width: 110,
  },
];

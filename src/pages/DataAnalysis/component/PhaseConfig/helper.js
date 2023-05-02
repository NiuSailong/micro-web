import React from 'react';
import { deleteSourceData, insertOrUpdateSourceData } from './service';
import { Typography, Popconfirm } from 'antd';

export const DATASOURCE_CONFIG_COLUMN = (SOURCE_TYPE) => {
  return [
    {
      title: '名称',
      dataIndex: 'name',
      width: '15%',
      editable: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: '15%',
      editable: true,
      options: SOURCE_TYPE,
      inputType: 'select',
    },
    {
      title: '配置信息',
      dataIndex: 'config_json',
      width: '50%',
      editable: true,
      inputType: 'textArea',
    },
  ].map((item) => ({
    ...item,
    title: (
      <span>
        <span style={{ color: 'red' }}>*</span>
        {item.title}
      </span>
    ),
  }));
};

// 是否是累计值选择项
const _CURRENT = [
  { description: '是', value: true },
  { description: '否', value: false },
];

export const DEVICE_TABLE_COLUMN = (_handleDeal, isView, options, dicListMap = {}) => {
  const operationCol = {
    title: '操作',
    align: 'center',
    width: 120,
    dataIndex: 'operation',
    render: (_, record) => {
      return (
        <span>
          <Typography.Link
            onClick={() => _handleDeal({ ...record, dealType: 'edit' })}
            key="edit"
            style={{ marginRight: 8 }}
          >
            编辑
          </Typography.Link>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => _handleDeal({ ...record, dealType: 'delete' })}
          >
            <Typography.Link key="delete" style={{ color: 'red' }}>
              删除
            </Typography.Link>
          </Popconfirm>
        </span>
      );
    },
  };
  const colList = [
    {
      title: '设备编号',
      dataIndex: 'device_num',
      editable: true,
      tip: true,
      width: 150,
    },
    {
      title: '资产编号',
      dataIndex: 'asset_num',
      hidden: true,
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'device_type',
      editable: true,
      tip: true,
      disabled: true,
    },
    {
      title: '数据来源',
      dataIndex: 'data_source',
      inputType: 'select',
      tip: true,
      colType: 'select',
      colOptions: options,
    },
    {
      title: '类型',
      dataIndex: 'type',
      editable: true,
      tip: true,
      colType: 'select',
      colOptions: dicListMap.ELECTRICAL_EQUIPMENT_TYPE,
    },
    {
      title: '类型名称',
      dataIndex: 'type_name',
      editable: true,
      hidden: true,
    },
    {
      title: 'iot_tag',
      dataIndex: 'iot_tag',
      editable: true,
    },
    {
      title: 'tag类型',
      dataIndex: 'tag_type',
      editable: true,
      colType: 'select',
      colOptions: dicListMap.TAG_TYPE,
      render: (text) => {
        const obj =
          (dicListMap.TAG_TYPE && dicListMap.TAG_TYPE.filter((item) => item.value === text)) || [];
        if (obj.length) {
          return obj[0].description;
        }
        return '';
      },
    },
    {
      title: '单位',
      dataIndex: 'unit',
      editable: true,
      colType: 'select',
      colOptions: dicListMap.ELECTRICITY_MEASURE_UNIT,
    },
    {
      title: '统一单位所用乘法系数',
      dataIndex: 'unity_multiplier',
      editable: true,
      colType: 'inputNumber',
    },
    {
      title: '是否是累计值',
      dataIndex: 'current',
      editable: true,
      colType: 'select',
      colOptions: _CURRENT,
      render: (text) => {
        const obj = _CURRENT.filter((item) => item.value === text);
        if (obj.length) {
          return obj[0].description;
        }
        return '';
      },
    },
  ].map((item) => {
    return item.dataIndex === 'type_name' || item.dataIndex === 'asset_num'
      ? { ...item, tip: false, align: 'center' }
      : { ...item, tip: true, align: 'center' };
  });
  return isView ? colList : [...colList, operationCol];
};

export const REQUEST_CONFIG = {
  delete: deleteSourceData,
  insertOrUpdate: insertOrUpdateSourceData,
};

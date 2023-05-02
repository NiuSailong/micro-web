import styles from './components/IndexComp/index.less';
import { Tooltip } from 'antd';
import React from 'react';
import {
  canalConfigList,
  indexTableList,
  canalConfigEdit,
  canalConfigDelete,
  canalConfigAdd,
  fieldAdd,
  indexTableDelete,
  indexTableEdit,
  indexTableAdd,
  fieldList,
  fieldDelete,
  fieldEdit,
} from '@/services/canalSer';

export const menuCode = {
  manage: 'CanalConnectManage',
  config: 'IndexInfoManage',
  field: 'field',
};

export const title = {
  [menuCode.manage]: 'canal配置',
  [menuCode.config]: '索引同步管理',
  [menuCode.field]: '字段详情',
};

export const MODAL_TYPE = {
  DELETE: 'delete',
  EDIT: 'edit',
  READ: 'read',
};

export const manageArr = [
  { title: '用户名', dataIndex: 'username' },
  { title: '密码', dataIndex: 'password' },
  { title: 'instanse名称', dataIndex: 'destination' },
  { title: 'ip地址', dataIndex: 'hostname' },
  { title: '端口', dataIndex: 'port' },
  { title: '限制', dataIndex: 'batchSize' },
  { title: '订阅主题', dataIndex: 'subscribe', required: false },
  { title: '操作', dataIndex: 'operation', fixed: 'right', width: 150 },
];
export const configArr = [
  { title: '数据库', dataIndex: 'schemaName' },
  { title: '表名', dataIndex: 'tableName' },
  { title: '索引名', dataIndex: 'indexName' },
  { title: '索引描述', dataIndex: 'indexDesc' },
  {
    title: '临时表',
    dataIndex: 'temp',
    type: 'select',
    defaultValue: false,
    data: [
      { name: '是', value: true },
      { name: '否', value: false },
    ],
  },
  { title: '操作', dataIndex: 'operation', fixed: 'right', width: 200, field: true },
];

export const fieldArr = [
  { title: '索引', dataIndex: 'indexName', type: 'text' },
  { title: '索引字段', dataIndex: 'indexField' },
  {
    title: '是否是主键',
    dataIndex: 'indexId',
    type: 'select',
    defaultValue: false,
    data: [
      { name: '是', value: true },
      { name: '否', value: false },
    ],
  },
  {
    title: '是否是检索字段',
    dataIndex: 'searchTextAll',
    type: 'select',
    defaultValue: false,
    data: [
      { name: '是', value: true },
      { name: '否', value: false },
    ],
  },
  { title: 'tableColumn', dataIndex: 'tableColumn' },
  { title: '操作', dataIndex: 'operation', fixed: 'right', width: 150 },
];
export const tableShow = {
  [menuCode.manage]: manageArr,
  [menuCode.config]: configArr,
  [menuCode.field]: fieldArr,
};

const handleForm = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (item.dataIndex !== 'operation') {
      arr.push({
        ...item,
        label: item.title,
        name: item.dataIndex,
      });
    }
  });
  return arr;
};
export const formList = {
  [menuCode.manage]: handleForm(manageArr),
  [menuCode.config]: handleForm(configArr),
  [menuCode.field]: handleForm(fieldArr),
};
export const getColumns = (data, fn) => {
  data.forEach((item) => {
    if (item.dataIndex === 'operation') {
      // eslint-disable-next-line react/display-name
      item.render = (value, cur) => {
        return (
          <div className={styles.canalOperation}>
            <a className={styles.btn} onClick={() => fn(MODAL_TYPE.EDIT, cur)}>
              编辑
            </a>
            <a className={styles.btn} onClick={() => fn(MODAL_TYPE.DELETE, cur)}>
              删除
            </a>
            {item.field ? (
              <a className={styles.btn} onClick={() => fn('field', cur)}>
                字段详情
              </a>
            ) : (
              ''
            )}
          </div>
        );
      };
    } else {
      item.render = (_value) => {
        let value = _value;
        if (item.type === 'select') {
          value = value ? '是' : '否';
        }
        return (
          <Tooltip title={value || ''} overlayClassName="overtoop" placement="topLeft">
            <div className={styles.textHidden}>{value}</div>
          </Tooltip>
        );
      };
    }
  });
  return data;
};

export const serviceObj = {
  [menuCode.manage]: {
    search: canalConfigList,
    add: canalConfigAdd,
    edit: canalConfigEdit,
    delete: canalConfigDelete,
  },
  [menuCode.config]: {
    search: indexTableList,
    add: indexTableAdd,
    edit: indexTableEdit,
    delete: indexTableDelete,
  },
  [menuCode.field]: {
    search: fieldList,
    add: fieldAdd,
    edit: fieldEdit,
    delete: fieldDelete,
  },
};

import React from 'react';
import styles from './components/Table/index.less';
import { Tooltip } from 'antd';

export const styleOption = {
  display: 'flex',
  justifyContent: 'space-between',
};

export const BtnList = [
  {
    name: '邀请',
    type: 'invite',
    isjurisdiction: true,
  },
  {
    name: '启用',
    type: 'start',
    isjurisdiction: true,
  },
  {
    name: '停用',
    type: 'out',
    isjurisdiction: true,
  },
  {
    name: '删除',
    type: 'delete',
    isjurisdiction: true,
  },
];

export const STATUSBAR = {
  0: { name: '已停用', color: '#E6EDF5' },
  1: { name: '已启用', color: '#1E7CE8' },
  2: { name: '未邀请', color: '#FFA940' },
  3: { name: '已邀请', color: '#28B28B' },
};

const ARRAYLIST = [
  { title: '姓名', dataIndex: 'name', width: 170, ellipsis: true },
  { title: '手机号', dataIndex: 'mobile', width: 150, ellipsis: true },
  { title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true },
  { title: '备注', dataIndex: 'description', width: 200, ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 120, ellipsis: true },
];
export const getColumns = (operationBtnFn, disabledBtns) => {
  const OPERATIONOBJ = {
    '-1': [
      { name: '编辑', type: 'redact', isQuan: true },
      { name: '删除', type: 'delete', isQuan: disabledBtns.deleteBtn },
      { name: '再次邀请', type: 'againIvite', isQuan: disabledBtns.againIviteBtn },
    ],
    0: [
      { name: '查看', type: 'look', isQuan: true },
      { name: '启用', type: 'startusing', isQuan: disabledBtns.startusingBtn },
    ],
    1: [
      { name: '查看', type: 'look', isQuan: true },
      { name: '停用', type: 'blockup', isQuan: disabledBtns.blockupBtn },
    ],
    2: [
      { name: '编辑', type: 'redact', isQuan: true },
      { name: '删除', type: 'delete', isQuan: disabledBtns.deleteBtn },
      { name: '邀请', type: 'invite', isQuan: disabledBtns.inviteBtn },
    ],
  };
  const array = ARRAYLIST.map((item) => {
    return {
      ...item,
      render(text) {
        if (item.dataIndex === 'status') {
          return (
            <div className={styles.tooltipBox}>
              <span className={styles.bar} style={{ background: STATUSBAR[text].color }} />
              <span>{STATUSBAR[text].name}</span>
            </div>
          );
        }
        return (
          <Tooltip overlayClassName="overtoop" placement="topLeft" title={text}>
            <div className={styles.tooltipBox}>
              <span>{text || '-'}</span>
            </div>
          </Tooltip>
        );
      },
    };
  });
  return array.concat([
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      render(text, row) {
        const arr = OPERATIONOBJ[row.status] || OPERATIONOBJ['-1'];
        return (
          <div>
            {arr.map((item, index) => {
              return (
                <>
                  <a
                    key={item.type}
                    style={{ color: item.isQuan ? '' : 'rgba(0,0,0,.25)' }}
                    onClick={() => {
                      operationBtnFn(item.type, row);
                    }}
                  >
                    {item.name}
                  </a>
                  {index < arr.length - 1 ? (
                    <span style={{ color: '#ACB1C1', margin: '0 8px' }}>|</span>
                  ) : null}
                </>
              );
            })}
          </div>
        );
      },
    },
  ]);
};

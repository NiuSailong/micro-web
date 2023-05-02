import { DEVICE_TYPE, MEASURES_TYPE, MEASURES_TYPE_CODE } from '@/pages/Measures/helper';
import { Tooltip } from 'antd';
import styles from '@/pages/Measures/components/MeasuresTable/index.less';
import React from 'react';

export const getColumns = (measureType: string, handleData?: boolean) => {
  let arr: any[] = [
    {
      code: 'measuresContent',
      name: '内容',
      width: 170,
      type: 'input',
      otherAttribute: {
        rules: [{ required: true, message: '请输入内容' }],
      },
    },
    {
      code: 'dangerHarmful',
      name: '危险和有害因素',
      width: 70,
      type: 'input',
      otherAttribute: {
        rules: [],
      },
    },
    {
      code: 'riskType',
      name: '风险种类',
      width: 70,
      type: 'input',
      otherAttribute: {
        rules: [],
      },
    },
    {
      code: 'performActions',
      name: '停电,验电等操作',
      width: 60,
      type: 'input',
      otherAttribute: {
        rules: [],
      },
    },
    {
      code: 'remark',
      name: '备注',
      width: 50,
      type: 'input',
      otherAttribute: {
        rules: [],
      },
    },
  ];
  if (measureType === MEASURES_TYPE_CODE.MAIN) {
    arr.push({
      name: '操作',
      code: 'operation',
      width: 70,
      type: 'operation',
      otherAttribute: {
        rules: [],
      },
    });
  }
  if (handleData) {
    arr = arr.map((item) => {
      return {
        title: item.name,
        dataIndex: item.code,
        key: item.code,
        width: item.width,
        render: (val: string) => {
          return (
            <Tooltip title={val || ''} overlayClassName="overtoop" placement="topLeft">
              <div className={styles.measuresTableTextHidden}> {val}</div>
            </Tooltip>
          );
        },
      };
    });
  }
  return arr;
};

export const formColumns = [
  {
    id: 'deviceType',
    type: 'select',
    label: '工作票类型',
    data: DEVICE_TYPE.filter((n) => n.deviceTypeDesc !== '全部'),
    selectKey: 'deviceType',
    selectLabel: 'deviceTypeDesc',
  },
  {
    id: 'measureType',
    type: 'select',
    label: '措施',
    data: MEASURES_TYPE.filter((n) => n.measureTypeDesc !== '全部'),
    selectKey: 'measureType',
    selectLabel: 'measureTypeDesc',
  },
  {
    id: 'type',
    type: 'input',
    label: '作业或任务',
  },
];

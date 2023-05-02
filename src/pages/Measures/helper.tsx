import _ from 'lodash';

export enum PAGE_STATUS {
  ADD = 'add',
  EDIT = 'edit',
  READONLY = 'readonly',
}

export const PAGE_STATUS_DESC = {
  [PAGE_STATUS.ADD]: '新建',
  [PAGE_STATUS.EDIT]: '编辑',
  [PAGE_STATUS.READONLY]: '查看',
};

interface deviceType {
  deviceType: string;
  deviceTypeDesc: string;
}
interface measureType {
  measureType: string;
  measureTypeDesc: string;
}
export interface tableRowType {
  id: number;
  deviceType: string;
  deviceTypeDesc: string;
  measureType: string;
  measureTypeDesc: string;
  type: string;
}
export const DEVICE_TYPE: deviceType[] = [
  {
    deviceType: '',
    deviceTypeDesc: '全部',
  },
  {
    deviceType: 'Asset',
    deviceTypeDesc: '风机工作票',
  },
  {
    deviceType: 'Asset_Lot',
    deviceTypeDesc: '风机工作票-多风机',
  },
  {
    deviceType: 'Electric',
    deviceTypeDesc: '电气一种工作票',
  },
  {
    deviceType: 'Electric2',
    deviceTypeDesc: '电气二种工作票',
  },
  {
    deviceType: 'Line',
    deviceTypeDesc: '线路一种工作票',
  },
  {
    deviceType: 'Line2',
    deviceTypeDesc: '线路二种工作票',
  },
];
export const MEASURES_TYPE_CODE = {
  ALL: '',
  HAZARD: 'HazardControlMeasures',
  RESTORE_MAIN: 'MainMeasuresToRestore',
  MAIN: 'MainMeasures',
};
export const MEASURES_TYPE: measureType[] = [
  {
    measureType: MEASURES_TYPE_CODE.ALL,
    measureTypeDesc: '全部',
  },
  {
    measureType: MEASURES_TYPE_CODE.MAIN,
    measureTypeDesc: '工作票安全措施',
  },
  {
    measureType: MEASURES_TYPE_CODE.RESTORE_MAIN,
    measureTypeDesc: '工作票恢复安全措施',
  },
  {
    measureType: MEASURES_TYPE_CODE.HAZARD,
    measureTypeDesc: '危险源识别、控制措施',
  },
];
export const columns = [
  {
    title: '工作票类型',
    dataIndex: 'deviceType',
    key: 'deviceType',
    width: 180,
    render: (text: string | any) => {
      return text && _.keyBy(DEVICE_TYPE, 'deviceType')?.[text]?.deviceTypeDesc;
    },
  },
  {
    title: '措施',
    dataIndex: 'measureType',
    key: 'measureType',
    width: 200,
    render: (text: string | any) => {
      return text && _.keyBy(MEASURES_TYPE, 'measureType')?.[text]?.measureTypeDesc;
    },
  },
  {
    title: '作业或任务',
    dataIndex: 'type',
    key: 'type',
  },
];

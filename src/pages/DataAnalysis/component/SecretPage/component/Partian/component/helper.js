import styles from './index.less';

export const InpHeader = [
  {
    colName: 'id',
    colType: 'input',
    dataIndex: 'id',
    placeholder: '',
    width: 0,
    tip: true,
    className: styles.idSpace,
  },
  {
    colName: '台帐编码',
    colType: 'input',
    dataIndex: 'assetnum',
    placeholder: '',
    width: 160,
    tip: true,
  },
  {
    colName: '父级设备',
    colType: 'select',
    dataIndex: 'parentnum',
    placeholder: '',
    width: 160,
  },
  {
    colName: '名称',
    colType: 'input',
    dataIndex: 'assetname',
    placeholder: '',
    width: 160,
    tip: true,
  },
  {
    colName: 'devce-modle',
    colType: 'input',
    dataIndex: 'devicemodel',
    placeholder: '',
    width: 160,
    tip: true,
  },
];

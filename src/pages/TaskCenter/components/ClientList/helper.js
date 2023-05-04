import styles from './index.less';
import { Space } from 'antd';
const options = [
  { label: '全部状态', value: null },
  { label: '排队中', value: 1 },
  { label: '正在执行', value: 2 },
  { label: '执行完成', value: 3 },
  { label: '执行错误', value: 4 },
  { label: '中断执行', value: 5 },
];
export const filterList = [
  {
    label: 'uuid',
    type: 'input',
    placeholder: '请输入uuid',
  },
  {
    label: 'status',
    type: 'select',
    placeholder: '请选择任务状态',
    options,
  },
];
export const detailColumns = [
  {
    title: 'uuid',
    dataIndex: 'uuid',
    key: 'uuid',
    className: styles.tableItem,
    width: 240,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '任务编码',
    dataIndex: 'taskCode',
    key: 'taskCode',
    className: styles.tableItem,
    width: 240,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    key: 'taskName',
    className: styles.tableItem,
    width: 220,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '任务日志',
    dataIndex: 'reason',
    key: 'reason',
    className: styles.tableItem,
    width: 200,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '客户端名称',
    dataIndex: 'userId',
    key: 'userId',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 150,
  },
  {
    title: '区域',
    dataIndex: 'regionCode',
    key: 'regionCode',
    className: styles.tableItem,
    width: 100,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '售电公司',
    dataIndex: 'sellId',
    key: 'sellId',
    className: styles.tableItem,
    width: 160,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '任务参数',
    dataIndex: 'param',
    key: 'param',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 240,
  },
  {
    title: '标的日',
    dataIndex: 'bidDateGenerate',
    key: 'bidDateGenerate',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 200,
  },
  {
    title: '调用时间',
    dataIndex: 'startCallTime',
    key: 'startCallTime',
    className: styles.tableItem,
    width: 180,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '执行时间(s)',
    dataIndex: 'times',
    key: 'times',
    className: styles.tableItem,
    width: 150,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '日志更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    className: styles.tableItem,
    width: 180,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '执行状态',
    dataIndex: 'status',
    key: 'status',
    className: styles.tableItem,
    width: 150,
    render: (text) => {
      if (text > 5) {
        return text == 6 ? '任务已发送' : '发送中断指令';
      } else if (text == 0) {
        return '任务创建';
      } else {
        return options[text].label || '-';
      }
    },
  },
];
export const columns = [
  {
    title: '区域',
    dataIndex: 'regionCode',
    key: 'regionCode',
    className: styles.tableItem,
    width: 100,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '售电公司',
    dataIndex: 'sellId',
    key: 'sellId',
    className: styles.tableItem,
    width: 220,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '客户端名称',
    dataIndex: 'userId',
    key: 'userId',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 220,
  },
];

export const getColumns = (props = {}) => {
  const { onChange } = props;
  return [
    ...columns,
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onChange?.(record, true)}>任务列表</a>
        </Space>
      ),
    },
  ];
};

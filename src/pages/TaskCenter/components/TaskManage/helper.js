import styles from './index.less';
import { Popconfirm, Space } from 'antd';
export const filterList = [
  {
    label: 'taskName',
    type: 'input',
    placeholder: '请输入任务名称',
  },
  {
    label: 'taskCode',
    type: 'input',
    placeholder: '请输入任务编码',
  },
];
export const buttons = ['TC-PZ-XZ', 'TC-PZ-DR', 'TC-PZ-YLPZ', 'TC-PZ-BJ', 'TC-PZ-SC'];
export const columns = [
  {
    title: '任务编码',
    dataIndex: 'taskCode',
    key: 'taskCode',
    isRule: true,
    rule: [
      {
        validator: (rule, val, callback) => {
          var pattern = new RegExp(
            "[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，`、？]",
          );
          if (pattern.test(val)) {
            callback('不可输入特殊字符');
          } else {
            callback();
          }
          callback();
        },
      },
    ],
    extra: '以省份拼音简称开头如sd_',
    label: 'input',
    isEdit: true,
    className: styles.tableItem,
    width: 280,
    maxLength: 2000,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    key: 'taskName',
    isRule: true,
    label: 'input',
    className: styles.tableItem,
    width: 280,
    maxLength: 2000,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '描述',
    dataIndex: 'describe',
    key: 'describe',
    label: 'input',
    isRule: false,
    className: styles.tableItem,
    maxLength: 2000,
    render: (text) => {
      return text || '-';
    },
    width: 150,
  },
  {
    title: '标的日',
    dataIndex: 'bidDateGenerate',
    key: 'bidDateGenerate',
    extra: '示例：d-1>d-0',
    isRule: true,
    label: 'input',
    className: styles.tableItem,
    maxLength: 2000,
    render: (text) => {
      return text || '-';
    },
    width: 150,
  },
  {
    title: '隔日重试',
    dataIndex: 'nextDayRetry',
    key: 'nextDayRetry',
    isRule: true,
    label: 'select',
    className: styles.tableItem,
    render: (text) => {
      return text ? '是' : '否';
    },
    width: 120,
  },
  {
    title: '流程类型',
    dataIndex: 'dagId',
    key: 'dagId',
    isRule: true,
    label: 'select',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 150,
  },
  {
    title: 'airflow重试时间(秒)',
    dataIndex: 'retryTime',
    key: 'retryTime',
    isRule: true,
    label: 'inputNumber',
    defaultValue: 60,
    className: styles.tableItem,
    maxLength: 11,
    render: (text) => {
      return text || '-';
    },
    width: 160,
  },
  {
    title: '任务周期',
    dataIndex: 'cycle',
    key: 'cycle',
    isRule: true,
    label: 'select',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 100,
  },
  {
    title: '任务参数',
    dataIndex: 'param',
    key: 'param',
    isRule: false,
    label: 'input',
    maxLength: 2000,
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 400,
  },
  {
    title: 'airflow参数',
    dataIndex: 'data',
    key: 'data',
    isRule: false,
    label: 'input',
    maxLength: 2000,
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 400,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    isRule: false,
    label: 'timePicker',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 150,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
    isRule: false,
    label: 'timePicker',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 150,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    extra: '数字越大优先级越高',
    defaultValue: 0,
    isRule: true,
    label: 'inputNumber',
    maxLength: 11,
    className: styles.tableItem,
    render: (text) => {
      return text != null ? text : '-';
    },
    width: 150,
  },
  {
    title: '客户端超时时间(秒)',
    dataIndex: 'clientTimeout',
    key: 'clientTimeout',
    isRule: true,
    label: 'inputNumber',
    defaultValue: 60,
    className: styles.tableItem,
    maxLength: 11,
    render: (text) => {
      return text || '-';
    },
    width: 160,
  },
  {
    title: '是否为私有数据',
    dataIndex: 'type',
    key: 'type',
    isRule: true,
    label: 'select',
    className: styles.tableItem,
    render: (text) => {
      return !!text ? (text == 'private' ? '私有' : '公有') : '-';
    },
    width: 150,
  },
  {
    title: '任务标签',
    dataIndex: 'flag',
    key: 'flag',
    isRule: true,
    label: 'select',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 100,
  },
  {
    title: '依赖任务与或关系',
    dataIndex: 'andOr',
    extra: '与为0，或为1',
    key: 'andOr',
    isRule: true,
    label: 'select',
    className: styles.tableItem,
    render: (text) => {
      return text ? '或' : '与';
    },
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 180,
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 180,
  },
  {
    title: '操作人',
    dataIndex: 'modifyBy',
    key: 'modifyBy',
    isRule: true,
    label: 'input',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
  },
];

export const getColumns = (props = {}) => {
  const { onChange, isButtonsDisable } = props;
  const newColumns = columns.filter((item) => item.title != '操作人');
  return [
    ...newColumns,
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 106,
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => onChange?.('edit', record)}
            style={{ color: isButtonsDisable('TC-PZ-BJ') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}
          >
            编辑
          </a>
          <Popconfirm
            placement={'topRight'}
            title="有关联任务关系或关联服务关系会一并删除，确认删除？"
            onConfirm={() => onChange?.('delete', record)}
          >
            <a style={{ color: isButtonsDisable('TC-PZ-SC') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}>
              删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};

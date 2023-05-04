import styles from './index.less';
import { Space, Tooltip, Popconfirm } from 'antd';
import { QuestionCircleOutlined } from '#/utils/antdIcons.js';
import { divide } from 'lodash';
export const options = [
  { label: '全部状态', value: null },
  { label: '待执行', value: 1, color: '#A6A6A6' },
  { label: '执行中', value: 2, color: '#0052D9' },
  { label: '执行完成', value: 3, color: '#00A870' },
  { label: '执行失败', value: 4, color: '#E34D59' },
];
export const buttons = ['TC-KZ-ZX', 'TC-KZ-TZ', 'TC-KZ-CXZX', 'TC-KZ-BJ', 'TC-KZ-FZ', 'TC-KZ-ZXZT'];
export const filterList = [
  {
    label: 'regionCode',
    type: 'input',
    placeholder: '请输入区域编码',
  },
  {
    label: 'sellId',
    type: 'input',
    placeholder: '请输入公司编码',
  },
  {
    label: 'startDate',
    type: 'datePicker',
    placeholder: '请选择日期',
  },
  {
    label: 'uuid',
    type: 'input',
    placeholder: '请输入uuid',
  },
  {
    label: 'taskCode',
    type: 'input',
    placeholder: '任务编码',
  },
  {
    label: 'taskName',
    type: 'input',
    placeholder: '任务名称',
  },
  {
    label: 'status',
    type: 'select',
    placeholder: '请选择任务状态',
    style: { width: '180px' },
    options,
  },
];
export const columns = [
  {
    title: 'uuid',
    dataIndex: 'uuid',
    key: 'uuid',
    isRule: true,
    label: 'input',
    className: styles.tableItem,
    width: 200,
    isEdit: true,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '待办名称',
    dataIndex: 'taskName',
    key: 'taskName',
    isRule: true,
    label: 'input',
    className: styles.tableItem,
    width: 280,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '标的日',
    key: 'bidDate',
    dataIndex: 'bidDate',
    label: 'input',
    isRule: true,
  },
  {
    title: '待办编码',
    dataIndex: 'taskCode',
    key: 'taskCode',
    isEdit: true,
    label: 'input',
    isRule: true,
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 280,
  },
  {
    title: '区域编码',
    dataIndex: 'regionCode',
    key: 'regionCode',
    className: styles.tableItem,
    width: 100,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '公司编码',
    dataIndex: 'sellId',
    key: 'sellId',
    className: styles.tableItem,
    width: 160,
    render: (text) => {
      return text || '-';
    },
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
    title: '执行状态',
    dataIndex: 'status',
    key: 'status',
    className: styles.tableItem,
    render: (text) => {
      return !!text ? (text == 5 ? '执行中(重试)' : options[Number(text)].label) : '-';
    },
    width: 150,
  },
  {
    title: '状态更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    className: styles.tableItem,
    render: (text) => {
      return text || '-';
    },
    width: 160,
  },
  {
    title: '依赖',
    dataIndex: 'relyOnTaskUuidList',
    key: 'relyOnTaskUuidList',
    className: styles.tableItem,
    render: (text) => {
      return text.length > 0 ? text.length + '个' : '-';
    },
    width: 150,
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
    title: '区域编码',
    dataIndex: 'regionCode',
    key: 'regionCode',
    className: styles.tableItem,
    width: 100,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '公司编码',
    dataIndex: 'sellId',
    key: 'sellId',
    className: styles.tableItem,
    width: 160,
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
      return text || '-';
    },
  },
  {
    title: '节点',
    dataIndex: 'node',
    key: 'node',
    className: styles.tableItem,
    width: 180,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '数据',
    dataIndex: 'data',
    key: 'data',
    className: styles.tableItem,
    width: 180,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    className: styles.tableItem,
    width: 180,
    render: (text) => {
      return text || '-';
    },
  },
];
export const getColumns = (props = {}) => {
  const { onChange, isButtonsDisable } = props;
  let columnsData = columns.filter((item) => {
    return !!item?.width;
  });
  return [
    ...columnsData,
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 360,
      filterDropdown: <a />,
      filterIcon: (
        <Tooltip
          style={{ width: 400 }}
          overlayClassName="overtoop"
          title={() => (
            <div style={{ width: 285 }}>
              <div>执行：更新当前待办状态为待执行；</div>
              <div>停止：终止运行当前待办，更新待办为失败状态；</div>
              <div>重新执行：更新当前节点及以下节点状态为待执行；</div>
              <div>复制：复制生成新待办；</div>
            </div>
          )}
        >
          <QuestionCircleOutlined style={{ fontSize: 14, color: '#FD4F43', marginTop: 4 }} />
        </Tooltip>
      ),
      render: (_, record) => (
        <Space size="middle">
          {record.status > 2 && record.status < 5 && (
            <Popconfirm
              placement={'topRight'}
              title="重新置为待执行状态？"
              onConfirm={() => onChange?.('run', record)}
            >
              <a
                style={{ color: isButtonsDisable('TC-KZ-ZX') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}
              >
                执行
              </a>
            </Popconfirm>
          )}
          {(record.status == 2 || record.status == 5) && (
            <Popconfirm
              placement={'topRight'}
              title="停止正在执行中待办？"
              onConfirm={() => onChange?.('stop', record)}
            >
              <a
                style={{ color: isButtonsDisable('TC-KZ-TZ') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}
              >
                停止
              </a>
            </Popconfirm>
          )}
          {record.status > 2 && record.status < 5 && (
            <Popconfirm
              placement={'topRight'}
              title="重置此待办链路下所有待办为未待执行状态？"
              onConfirm={() => onChange?.('reset', record)}
            >
              <a
                style={{
                  color: isButtonsDisable('TC-KZ-CXZX') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
                }}
              >
                重新执行
              </a>
            </Popconfirm>
          )}
          {record.status == 1 && (
            <a
              style={{ color: isButtonsDisable('TC-KZ-BJ') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}
              onClick={() => onChange?.('edit', record)}
            >
              编辑
            </a>
          )}
          <a
            style={{ color: isButtonsDisable('TC-KZ-FZ') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}
            onClick={() => onChange?.('add', record)}
          >
            复制
          </a>
          <a onClick={() => onChange?.('seeLog', record)}>日志</a>
          <a
            style={{ color: isButtonsDisable('TC-KZ-ZXZT') ? 'rgba(0, 0, 0, 0.25)' : '#1890ff' }}
            onClick={() => onChange?.('seeType', record)}
          >
            关联待办执行状态
          </a>
        </Space>
      ),
    },
  ];
};

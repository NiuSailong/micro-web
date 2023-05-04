import { Popconfirm, Space } from 'antd';
import { ToolTipFun } from '@/pages/SyncService/hepler';
import styles from '@/pages/SyncService/index.less';

export const COMMONLIB_ENUM = {
  true: {
    value: '是',
    label: true,
  },
  false: {
    value: '否',
    label: false,
  },
};
export const columns = [
  {
    title: '自动引入',
    dataIndex: 'commonLib',
    key: 'commonLib',
    isRule: true,
    label: 'radio',
    span: 24,
    className: styles.tableItem,
    render: (text) => {
      return COMMONLIB_ENUM[text]?.value || '-';
    },
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    isRule: true,
    label: 'input',
    span: 24,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    label: 'input',
    span: 24,
  },
  {
    title: '代码',
    dataIndex: 'content',
    key: 'content',
    isRule: true,
    label: 'textarea',
    span: 24,
    className: styles.tableItem,
    render: (text) => {
      return <div className={styles.tableItem_text}>{text || '-'}</div>;
    },
  },
  {
    title: '操作人',
    dataIndex: 'operateBy',
    key: 'operateBy',
    isRule: true,
    label: 'input',
    span: 24,
    isTableShow: false,
  },
];

export const getColumns = (props = {}) => {
  const { onChange, staticData = {} } = props;
  const newEditColumns = columns.map((col) => {
    return ToolTipFun(col);
  });
  return [
    ...newEditColumns?.filter((c) => c.isTableShow !== false),
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 106,
      render: (_, record) => {
        return (
          <Space size="middle">
            <a
              onClick={() => onChange?.('edit', record)}
              style={{
                color: staticData.editingDisable ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
              }}
            >
              编辑
            </a>
            <Popconfirm
              placement={'topRight'}
              title="是否确定删除?"
              onConfirm={() => onChange?.('delete', record)}
            >
              <a
                style={{
                  color: staticData.delDisable ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
                }}
              >
                删除
              </a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
};

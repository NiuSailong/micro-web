import { Space, Popconfirm } from 'antd';
import { ToolTipFun } from '@/pages/SyncService/hepler';
import styles from '@/pages/SyncService/index.less';

const LOG_STATUS_ENUM = {
  true: '完成',
  false: '未完成',
};
const logColumns = [
  {
    title: '执行状态',
    dataIndex: 'status',
    key: 'status',
    className: styles.tableItem,
    render: (text) => {
      return LOG_STATUS_ENUM[text] || '-';
    },
  },
  {
    title: '异常信息',
    dataIndex: 'errorMessage',
    key: 'errorMessage',
  },
  {
    title: '耗时(ms)',
    dataIndex: 'times',
    key: 'times',
  },
  {
    title: '执行时间',
    dataIndex: 'executeTime',
    key: 'executeTime',
  },
];
export const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    isRule: true,
    label: 'input',
    span: 8,
  },
  {
    title: '方案',
    dataIndex: 'programme',
    key: 'programme',
    isRule: true,
    label: 'select',
    span: 8,
  },
  {
    title: '触发类型',
    dataIndex: 'triggerType',
    key: 'triggerType',
    isRule: true,
    label: 'select',
    span: 8,
  },
  {
    title: '配置',
    dataIndex: 'content',
    key: 'content',
    isRule: true,
    label: 'input',
    span: 8,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    label: 'input',
    span: 8,
  },
  {
    title: '操作人',
    dataIndex: 'operateByName',
    key: 'operateBy',
    isRule: true,
    label: 'input',
    span: 8,
  },
];
export const editColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    editable: true,
    isRule: true,
    label: 'input',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    editable: true,
    isRule: true,
    label: 'select',
  },
  {
    title: '参数内容',
    dataIndex: 'content',
    key: 'content',
    editable: true,
    isRule: true,
    label: 'textarea',
    className: styles.tableItem,
    render: (text = '') => {
      return <div className={styles.tableItem_text}>{text || '-'}</div>;
    },
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    editable: true,
    label: 'input',
  },
];
export const getEditColumns = (props) => {
  const { onChange, handleSave, isEditing, parameterTypeObj = {} } = props;
  const newEditColumns = editColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...ToolTipFun(col),
      onCell: (record) => ({
        record,
        editable: col.editable,
        editing: isEditing?.(record),
        isRule: col.isRule,
        label: col.label,
        dataIndex: col.dataIndex,
        title: col.title,
        operationType: record.operationType || '',
        parameterTypeObj,
        handleSave,
      }),
    };
  });
  return [
    ...newEditColumns,
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 62,
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            placement={'topRight'}
            title="是否确定删除?"
            onConfirm={() => onChange?.('delete', record)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
export const getLogColumns = () => {
  const newEditColumns = logColumns.map((col) => {
    if (col.render) {
      return { ...col };
    }
    return ToolTipFun(col);
  });
  return newEditColumns;
};
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
      width: 196,
      render: (_, record) => {
        return (
          <Space size="middle">
            <a
              onClick={() => onChange?.('implement', record)}
              style={{
                color: staticData.executeDisable ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
              }}
            >
              执行
            </a>
            <a
              onClick={() => onChange?.('edit', record)}
              style={{
                color: staticData.editingDisable ? 'rgba(0, 0, 0, 0.25)' : '#1890ff',
              }}
            >
              编辑
            </a>
            <a onClick={() => onChange?.('log', record)}>日志</a>
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

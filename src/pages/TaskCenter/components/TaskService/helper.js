import { Popconfirm, Space, Tooltip } from 'antd';
import { ToolTipFun } from '@/pages/SyncService/hepler';
import styles from '@/pages/SyncService/index.less';
import TRButton from '#/components/TRButton';
import { rulesArr } from '@/pages/PowerStation/components/helper';
import moment from 'moment';

export const columns = [
  {
    title: '区域',
    dataIndex: 'regionName',
    key: 'regionName',
    isRule: true,
    label: 'select',
    span: 24,
    isEdit: true,
  },
  {
    title: '服务编码',
    dataIndex: 'serviceCode',
    key: 'serviceCode',
    label: 'input',
    isRule: true,
    isEdit: true,
    span: 24,
    rule: [
      {
        required: true,
        pattern: new RegExp(/^[a-zA-Z0-9_]+$/),
        message: '输入格式错误，只能输入数字、字母、下划线',
      },
    ],
  },
  {
    title: '服务名称',
    dataIndex: 'serviceName',
    key: 'serviceName',
    isRule: true,
    span: 24,
    label: 'input',
  },
  {
    title: '关联任务',
    dataIndex: 'taskIds',
    key: 'task',
    label: 'selectChecked',
    span: 24,
    className: styles.tableItem,
    render: (list = []) => {
      let str = '';
      list?.forEach((l, i) => {
        str += `${l?.taskName || '-'}${i < list?.length - 1 ? '，' : ''}` ?? '';
      });
      return (
        <div className={styles.tableItem_text}>
          <Tooltip
            placement="topLeft"
            title={() => {
              return (
                <span>
                  {list?.map((l, i) => {
                    return (
                      <span key={i}>
                        {l?.taskName || '-'}
                        <br />
                      </span>
                    );
                  })}
                </span>
              );
            }}
            color="#FFFFFF"
            overlayInnerStyle={{ color: '#000000', maxHeight: 300, overflowY: 'auto' }}
          >
            {str || '-'}
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    isRule: true,
    label: 'input',
    isEditShow: false,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    isRule: true,
    label: 'input',
    isEditShow: false,
  },
  {
    title: '操作人',
    dataIndex: 'updateBy',
    key: 'updateBy',
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
              title={
                record?.task?.length
                  ? '关联任务关系或关联服务关系会一并删除，确认删除?'
                  : '是否确定删除?'
              }
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

export const mergeRowNum = (text, dataSource, index, kye) => {
  if (text === null || text === 'null') {
    return 1;
  }
  if (index !== 0 && text === dataSource[index - 1]?.[kye]) {
    return 0;
  }
  let rowSpan = 1;
  for (let i = index + 1; i < dataSource.length; i++) {
    if (text !== dataSource[i]?.[kye]) {
      break;
    }
    rowSpan++;
  }
  return rowSpan;
};
const columnsAuthori = [
  {
    title: '区域名称',
    dataIndex: 'regionName',
    key: 'regionName',
    width: 120,
  },
  {
    title: '交易单元名称',
    dataIndex: 'powerUnitName',
    key: 'powerUnitName',
    width: 230,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 200,
  },
  {
    title: '操作人',
    dataIndex: 'updateBy',
    key: 'updateBy',
    width: 100,
  },
  {
    title: '过期时间',
    dataIndex: 'validEndTime',
    key: 'validEndTime',
    width: 200,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 200,
  },
];
export const getColumnsAuthori = ({ dataList, editFn, relationFn, btnPer, btnPerMap }) => {
  return [
    {
      title: '公司名称',
      dataIndex: 'sellName',
      key: 'sellName',
      render: (text, _, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(text, dataList, index, 'sellName') },
        };
      },
    },
    {
      title: '公司编码',
      dataIndex: 'sellNo',
      key: 'sellNo',
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.sellName, dataList, index, 'sellName') },
        };
      },
    },
    ...columnsAuthori,
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'id',
      render: (id, record, index) => {
        const data = dataList?.find((v) => v.id === id);
        return {
          children: (
            <Space>
              <TRButton
                type="link"
                onClick={() => editFn(data)}
                buttonPermissions={btnPer}
                menuCode={btnPerMap.pageTable}
              >
                <div style={{ fontSize: 14 }}>编辑</div>
              </TRButton>
              <a onClick={() => relationFn(data)}>关联</a>
            </Space>
          ),
          props: {
            rowSpan: mergeRowNum(record.sellName, dataList, index, 'sellName'),
            align: 'center',
          },
        };
      },
    },
  ];
};
const relationEdit = [
  {
    title: '过期时间',
    dataIndex: 'expirationTime',
    editable: true,
    isRule: true,
    // rules: rulesArr.lengthRule(255),
    editType: 'datePickerhhmmss',
    className: styles.editTableItem,
    render: (text) => {
      return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-';
    },
  },
];
export const relationeditFn = ({ handleDelete, handleSave, selectDataObj, btnPer, btnPerMap }) => {
  const relationColumns = [
    {
      title: '区域',
      dataIndex: 'regionCode',
      editable: true,
      isRule: true,
      editType: 'select',
      selectRest: { showSearch: true, optionFilterProp: 'label' },
      selectDataObj: selectDataObj.region,
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
    {
      title: '服务名称',
      dataIndex: 'serviceCode',
      editable: true,
      isRule: true,
      selectDataObj: selectDataObj.serviceSelect,
      width: 750,
      editType: 'select',
      selectRest: { showSearch: true, optionFilterProp: 'label' },
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
    ...relationEdit,
  ].map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          editType: col.editType,
          selectDataObj: col.selectDataObj,
          rules: col.rules,
          editingKey: true,
          isRule: col.isRule,
          selectRest: col.selectRest,
          handleSave,
        };
      },
    };
  });
  return [
    ...relationColumns,
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'key',
      render: (key) => {
        return (
          <Popconfirm
            title="是否确定删除?"
            placement={'topRight'}
            onConfirm={() => handleDelete(key)}
          >
            <TRButton type="link" buttonPermissions={btnPer} menuCode={btnPerMap.relation}>
              删除
            </TRButton>
          </Popconfirm>
        );
      },
    },
  ];
};

const editandAddColumns = [
  {
    title: '交易单元名称',
    dataIndex: 'powerUnitName',
    editable: true,
    isRule: true,
    width: 800,
    rules: rulesArr.lengthRule(200),
    editType: 'input',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
];
export const editandAddEditFn = ({ handleDelete, handleSave, selectDataObj, titleKey }) => {
  const editandAdd = [
    {
      title: '区域',
      dataIndex: 'regionCode',
      editable: true,
      isRule: true,
      editType: 'select',
      selectRest: { showSearch: true, optionFilterProp: 'label' },
      selectDataObj: selectDataObj.region,
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
    ...editandAddColumns,
  ].map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        editType: col.editType,
        selectDataObj: col.selectDataObj,
        rules: col.rules,
        isRule: col.isRule,
        selectRest: col.selectRest,
        editingKey: true,
        oper: titleKey,
        handleSave,
      }),
    };
  });
  return titleKey === '新增'
    ? [
        ...editandAdd,
        {
          title: '操作',
          fixed: 'right',
          width: 200,
          align: 'center',
          dataIndex: 'key',
          render: (key) => {
            return (
              <Popconfirm
                title="是否确定删除?"
                placement={'topRight'}
                onConfirm={() => handleDelete(key)}
              >
                <a>删除</a>
              </Popconfirm>
            );
          },
        },
      ]
    : editandAdd;
};

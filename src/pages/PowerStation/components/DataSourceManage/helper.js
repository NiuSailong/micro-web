import { Space, Popconfirm, Tag } from 'antd';
import TRButton from '#/components/TRButton';
import { mergeRowNum, rulesArr } from '@/pages/PowerStation/components/helper';
import styles from './index.less';
import moment from 'moment';

const columns = [
  {
    title: '子级数据源名称',
    dataIndex: 'dataSourceName',
    width: 200,
  },
  {
    title: 'url',
    dataIndex: 'dataSourceUrl',
    width: 200,
  },
  {
    title: 'token',
    dataIndex: 'dataSourceToken',
  },
  {
    title: '标签',
    dataIndex: 'accessType',
    width: 200,
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    width: 100,
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 200,
    render: (text) => {
      return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '';
    },
  },
  {
    title: '修改人',
    dataIndex: 'updateUserName',
    width: 150,
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    width: 200,
    render: (text) => {
      return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '';
    },
  },
];
export const columnsFn = ({ defaultData, dataList, editFn, btnPer }) => {
  return [
    {
      title: '父级数据源名称',
      dataIndex: 'dsName',
      width: 200,
      render: (text, _, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(text, dataList, index, 'dsName') },
        };
      },
    },
    {
      title: '状态',
      dataIndex: 'valid',
      width: 100,
      render: (text, record, index) => {
        return {
          children: <Tag color={text ? 'success' : 'error'}>{text ? '有效' : '无效'}</Tag>,
          props: { rowSpan: mergeRowNum(record?.dsName, dataList, index, 'dsName') },
        };
      },
    },
    ...columns,
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'dsId',
      render: (dsId, record, index) => {
        const data = defaultData?.find((v) => v.dsId === dsId);
        return {
          children: (
            <Space>
              <TRButton
                type="link"
                onClick={() => editFn(data)}
                buttonPermissions={btnPer}
                menuCode={'PS-DataSource-edit'}
              >
                编辑
              </TRButton>
              {/* <Popconfirm
                title="删除该数据源配置有可能会导致短期预测数据抓取或下发失败！是否删除?"
                placement={'topRight'}
                onConfirm={() => deleteFn(dsId)}
              >
                <TRButton type="link" buttonPermissions={btnPer} menuCode={'PS-DataSource-delete'}>
                  删除
                </TRButton>
              </Popconfirm> */}
            </Space>
          ),
          props: {
            rowSpan: mergeRowNum(record.dsName, dataList, index, 'dsName'),
            align: 'center',
          },
        };
      },
    },
  ];
}; // 生成带有单元格合并 columns ，使用 render.rowSpan 实现

export const formMap = (dataList, oper) => [
  {
    title: '父数据源名称',
    dataIndex: 'dsName',
    rules:
      oper === 'add'
        ? [...rulesArr.repeat(dataList, 'dsName', '父数据源名称重复'), ...rulesArr.lengthRule(10)]
        : [...rulesArr.lengthRule(100)],
  },
  {
    title: '父数据源状态',
    dataIndex: 'valid',
    type: 'select',
    selectOptions: [
      { value: true, label: '有效' },
      { value: false, label: '无效' },
    ],
  },
];

const editAddColumns = [
  {
    title: 'url',
    dataIndex: 'dataSourceUrl',
    editable: true,
    rules: rulesArr.lengthRule(255),
    editType: 'input',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: 'token',
    dataIndex: 'dataSourceToken',
    editable: true,
    rules: rulesArr.lengthRule(255),
    editType: 'input',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    editable: true,
    editType: 'input',
    disabled: true,
    className: styles.editTableItem,
    render: (text) => {
      return Number(text) || '-';
    },
  },
  {
    title: '是否有效',
    dataIndex: 'deleteFlag',
    editable: true,
    editType: 'select',
    disabled: true,
    selectDataObj: [
      { value: true, label: '无效' },
      { value: false, label: '有效' },
    ],
    className: styles.editTableItem,
    render: (text) => {
      return text;
    },
  },
];
export const editColumnsFn = ({ handleSave, selectDataObj, tableData }) => {
  return [
    {
      title: '子级数据源名称',
      dataIndex: 'dataSourceName',
      editable: true,
      isRule: true,
      rules: [
        ...rulesArr.lengthRule(255),
        () => ({
          validator(_, value) {
            const dataFilter = tableData?.filter((v) => v.dataSourceName == value);
            if (!(dataFilter?.length > 1) || !value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('子数据源名称重复'));
          },
        }),
      ],
      editType: 'input',
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
    ...editAddColumns,
    {
      title: '标签',
      dataIndex: 'accessType',
      editable: true,
      isRule: true,
      editType: 'select',
      selectDataObj,
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
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
        isRule: col.isRule,
        selectDataObj: col.selectDataObj,
        rules: col.rules,
        disabled: col.disabled,
        handleSave,
      }),
    };
  });
  // return [
  //   ...editColumns,
  //   {
  //     title: '操作',
  //     fixed: 'right',
  //     width: 200,
  //     align: 'center',
  //     dataIndex: 'key',
  //     render: (id) => {
  //       return (
  //         <Popconfirm
  //           title="删除该数据源配置有可能会导致短期预测数据抓取或下发失败！是否删除"
  //           placement={'topRight'}
  //           onConfirm={() => handleDelete(id)}
  //         >
  //           <a>删除</a>
  //         </Popconfirm>
  //       );
  //     },
  //   },
  // ];
};

import { Space, Popconfirm, Tag } from 'antd';
import { mergeRowNum, rulesArr } from '@/pages/PowerStation/components/helper';
import TRButton from '#/components/TRButton';
import moment from 'moment';
import styles from './index.less';

const columns = [
  {
    title: '系数',
    dataIndex: 'coefficient',
    width: 200,
  },
  {
    title: '是否下发',
    dataIndex: 'issueStatus',
    width: 200,
    render: (text) => {
      return text ? '是' : '否';
    },
  },
  {
    title: '结算单元id',
    dataIndex: 'stationId',
    width: 200,
  },
  {
    title: '结算单元名称',
    dataIndex: 'stationName',
    width: 200,
  },
  {
    title: '结算单元装机容量',
    dataIndex: 'stationCapacity',
    width: 200,
  },
  {
    title: '原始场站Id',
    dataIndex: 'originalWfid',
    width: 150,
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
    width: 200,
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
    width: 200,
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
export const columnsFn = ({ defaultData, dataList, deleteFn, editFn, btnPer }) => {
  return [
    {
      title: '风电场id',
      dataIndex: 'wfId',
      width: 200,
      render: (text, _, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(text, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '风电场名称',
      dataIndex: 'wfName',
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '下发时间',
      dataIndex: 'time',
      width: 200,
      render: (text, record, index) => {
        const value = text?.map((v) => v.issueTime).filter((v) => v) || [];
        return {
          children: value?.map((v, i) => (
            <Tag
              key={i}
              color={
                [
                  'magenta',
                  'red',
                  'volcano',
                  'orange',
                  'gold',
                  'lime',
                  'green',
                  'cyan',
                  'blue',
                  'geekblue',
                  'purple',
                ][i]
              }
            >
              {v}
            </Tag>
          )),
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '时间校验',
      dataIndex: 'time',
      width: 200,
      render: (text, record, index) => {
        const value = text?.map((v) => v.checkTime).filter((v) => v) || [];
        return {
          children: value?.map((v, i) => (
            <Tag
              key={i}
              color={
                [
                  'magenta',
                  'red',
                  'volcano',
                  'orange',
                  'gold',
                  'lime',
                  'green',
                  'cyan',
                  'blue',
                  'geekblue',
                  'purple',
                ][i]
              }
            >
              {v}
            </Tag>
          )),
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '风电场装机容量（单位kw）',
      dataIndex: 'wfCapacity',
      width: 250,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '下发通道',
      dataIndex: 'channel',
      width: 200,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '文件夹名称',
      dataIndex: 'folderName',
      width: 200,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '文件名前缀',
      dataIndex: 'fileNamePrefix',
      width: 200,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '下发方式',
      dataIndex: 'issueMode',
      width: 200,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
      width: 200,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    {
      title: '数据源',
      dataIndex: 'dataSourceName',
      width: 200,
      render: (text, record, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId') },
        };
      },
    },
    ...columns,
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'wfId',
      render: (wfId, record, index) => {
        const data = defaultData?.find((v) => v.wfId === wfId);
        return {
          children: (
            <Space>
              <TRButton
                buttonPermissions={btnPer}
                menuCode={'PS-DataIssue-edit'}
                type="link"
                onClick={() => editFn(data)}
              >
                编辑
              </TRButton>
              <Popconfirm
                title="删除该下发配置有可能会导致短期预测数据抓取或下发失败！是否删除？"
                placement={'topRight'}
                onConfirm={() => deleteFn(wfId)}
              >
                <TRButton buttonPermissions={btnPer} menuCode={'PS-DataIssue-delete'} type="link">
                  删除
                </TRButton>
              </Popconfirm>
            </Space>
          ),
          props: {
            rowSpan: mergeRowNum(record.wfId, dataList, index, 'wfId'),
            align: 'center',
          },
        };
      },
    },
  ];
}; // 生成带有单元格合并 columns ，使用 render.rowSpan 实现
export const editAddForm = [
  {
    title: '风电场名称',
    dataIndex: 'wfName',
    type: 'input',
  },
  {
    title: '下发通道',
    dataIndex: 'channel',
    type: 'input',
    rules: rulesArr.lengthRule(255),
    notRules: true,
  },
  {
    title: '文件夹名称',
    dataIndex: 'folderName',
    type: 'input',
    rules: rulesArr.lengthRule(255),
    notRules: true,
  },
  {
    title: '文件名前缀',
    dataIndex: 'fileNamePrefix',
    type: 'input',
    rules: rulesArr.lengthRule(255),
    notRules: true,
  },
  {
    title: '下发方式',
    dataIndex: 'issueMode',
    type: 'input',
    rules: rulesArr.lengthRule(255),
  },
];
export const timeTableColumns = ({ timetableDel, timeTableSave }) => {
  return [
    {
      title: '下发时间',
      dataIndex: 'issueTime',
      editable: true,
      editType: 'timePicker',
      isRule: true,
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
    {
      title: '时间校验',
      dataIndex: 'checkTime',
      editable: true,
      editType: 'timePicker',
      className: styles.editTableItem,
      render: (text) => {
        return text || '-';
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'key',
      render: (key) => {
        return (
          <Popconfirm
            title="删除该下发配置有可能会导致短期预测数据抓取或下发失败！是否删除？"
            placement={'topRight'}
            onConfirm={() => timetableDel(key)}
          >
            <a>删除</a>
          </Popconfirm>
        );
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
        selectDataObj: col.selectDataObj,
        rules: col.rules,
        isRule: col.isRule,
        handleSave: timeTableSave,
      }),
    };
  });
};
const editAddColumns = [
  {
    title: '系数',
    disabled: true,
    dataIndex: 'coefficient',
    rules: [...rulesArr.lengthRule(20), ...rulesArr.float],
    isRule: true,
  },
  {
    title: '结算单元id',
    dataIndex: 'stationId',
    rules: [...rulesArr.lengthRule(11), ...rulesArr.integer],
    selectRest: { optionLabelProp: 'value', showSearch: true },
    isRule: true,
  },
  {
    title: '结算单元名称',
    dataIndex: 'stationName',
    disabled: true,
    isRule: true,
  },
  {
    title: '结算单元装机容量',
    dataIndex: 'stationCapacity',
    rules: [...rulesArr.lengthRule(10), ...rulesArr.numRule],
    isRule: true,
  },
  {
    title: '原始场站Id',
    dataIndex: 'originalWfid',
    rules: rulesArr.lengthRule(255),
    isRule: false,
  },
];
export const editColumnsFn = ({ handleDelete, handleSave, selectDataObj }) => {
  const editColumns = [
    ...editAddColumns.map((v) => ({
      ...v,
      editable: true,
      editType: v.dataIndex === 'stationId' ? 'select' : 'input',
      rules: v.rules || [],
      className: styles.editTableItem,
      selectDataObj: selectDataObj.stationId,
      selectRest: v.selectRest || {},
      isRule: v.isRule,
      render: (text) => {
        return text || '-';
      },
    })),
    {
      title: '是否下发',
      dataIndex: 'issueStatus',
      editable: true,
      editType: 'select',
      selectDataObj: selectDataObj.issueStatus,
      className: styles.editTableItem,
      isRule: true,
      render: (text) => {
        return text;
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
        selectDataObj: col.selectDataObj,
        disabled: col.disabled,
        isRule: col.isRule,
        selectRest: col.selectRest,
        handleSave,
      }),
    };
  });
  return [
    ...editColumns,
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'key',
      render: (id) => {
        return (
          <Popconfirm
            title="删除该下发配置有可能会导致短期预测数据抓取或下发失败！是否删除？"
            placement={'topRight'}
            onConfirm={() => handleDelete(id)}
          >
            <a>删除</a>
          </Popconfirm>
        );
      },
    },
  ];
};

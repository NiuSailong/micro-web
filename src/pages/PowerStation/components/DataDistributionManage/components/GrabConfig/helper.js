import { Space, Button, Col } from 'antd';
import { mergeRowNum, rulesArr } from '@/pages/PowerStation/components/helper';
import TRButton from '#/components/TRButton';
import moment from 'moment';
import styles from './index.less';

const columns = [
  {
    title: '数据源',
    dataIndex: 'dataSourceName',
    render: (text, item) => {
      return `${text}-${item.dataSource}`;
    },
  },
  {
    title: '抓取天数', // 默认 15天
    dataIndex: 'queryDays',
    width: 100,
  },
  {
    title: '线损', // 默认 0.03
    dataIndex: 'lineLoss',
    width: 80,
  },
  {
    title: '类型', // 默认 power
    dataIndex: 'type',
    width: 80,
  },
  {
    title: '抓取有效期开始时间',
    dataIndex: 'effectiveBeginDate',
    width: 230,
  },
  {
    title: '抓取有效期结束时间',
    dataIndex: 'effectiveEndDate',
    width: 230,
  },
  {
    title: '默认数据源有效期开始时间',
    dataIndex: 'defaultBeginDate',
    width: 230,
  },
  {
    title: '默认数据源有效期结束时间',
    dataIndex: 'defaultEndDate',
    width: 230,
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
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
    width: 100,
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
      title: '结算单元',
      dataIndex: 'stationName',
      render: (text, _, index) => {
        return {
          children: text || '',
          props: { rowSpan: mergeRowNum(text, dataList, index, 'stationName') },
        };
      },
    },
    ...columns,
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'stationId',
      render: (stationId, record, index) => {
        const data = defaultData?.find((v) => v.stationId === stationId);
        return {
          children: (
            <Space>
              <TRButton
                buttonPermissions={btnPer}
                menuCode={'PS-DataGrab-edit'}
                type="link"
                onClick={() => editFn(data)}
              >
                编辑
              </TRButton>
            </Space>
          ),
          props: {
            rowSpan: mergeRowNum(record.stationId, dataList, index, 'stationId'),
            align: 'center',
          },
        };
      },
    },
  ];
}; // 生成带有单元格合并 columns ，使用 render.rowSpan 实现

export const formMap = (dataList, idOption, pro) => [
  {
    title: '结算单元Id',
    dataIndex: 'stationId',
    selectOptions: idOption,
    type: 'select',
    comProps: { optionLabelProp: 'value', showSearch: true },
    rules: [...rulesArr.lengthRule(20), ...rulesArr.integer].concat(
      pro === 'add' ? rulesArr.repeat(dataList, 'stationId', '结算单元Id重复') : [],
    ),
  },
];
const editAddColumns = (oper) => [
  {
    title: '抓取天数',
    dataIndex: 'queryDays',
    editable: true,
    isRule: true,
    rules: rulesArr.lengthRule(255),
    editType: 'input',
    className: styles.editTableItem,
    render: (text) => {
      return `${text}` || '-';
    },
  },
  {
    title: '线损',
    dataIndex: 'lineLoss',
    editable: true,
    isRule: true,
    rules: [...rulesArr.lengthRule(11), ...rulesArr.float],
    editType: 'input',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '类型',
    dataIndex: 'type',
    editable: true,
    isRule: true,
    editType: 'input',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '抓取有效期开始时间',
    dataIndex: 'effectiveBeginDate',
    editable: true,
    isRule: true,
    rules: oper === 'add' ? rulesArr.time : [],
    oper,
    editType: 'datePicker',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '抓取有效期结束时间',
    dataIndex: 'effectiveEndDate',
    editable: true,
    isRule: true,
    rules: oper === 'add' ? rulesArr.time : [],
    editType: 'datePicker',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '默认数据源有效期开始时间',
    dataIndex: 'defaultBeginDate',
    editable: true,
    editType: 'datePicker',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
  {
    title: '默认数据源有效期结束时间',
    dataIndex: 'defaultEndDate',
    editable: true,
    editType: 'datePicker',
    className: styles.editTableItem,
    render: (text) => {
      return text || '-';
    },
  },
];
export const editColumnsFn = ({ handleSave, selectDataObj, oper, dataList, dataSourceMap }) => {
  const editColumns = [
    {
      title: '数据源',
      dataIndex: 'dataSource',
      editable: true,
      isRule: true,
      editType: 'cascader',
      selectDataObj,
      className: styles.editTableItem,
      rules: [
        () => ({
          validator(_, value) {
            const dataFilter = dataList?.filter((v) => v.dataSource == value[1]);
            if (!(dataFilter?.length > 1) || !value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('数据源重复'));
          },
        }),
      ],
      render: (text) => {
        return text || '-';
      },
    },
    ...editAddColumns(oper),
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
        oper: col.oper,
        cascaderMap: dataSourceMap,
        dataList,
        handleSave,
      }),
    };
  });
  return [...editColumns];
};

export const columnAll = [
  {
    colName: '台帐编号',
    colType: 'input',
    dataIndex: 'assetnum',
    placeholder: '',
    width: 160,
    tip: true,
    disable: false,
    maxLength: 100,
  },
  {
    colName: '父级设备',
    colType: 'select',
    dataIndex: 'parentnum',
    placeholder: '',
    width: 160,
    disable: false,
    maxLength: 100,
  },
  {
    colName: '名称',
    colType: 'input',
    dataIndex: 'assetname',
    placeholder: '',
    width: 160,
    tip: true,
    disable: false,
    maxLength: 100,
  },
  {
    colName: 'devce-modle',
    colType: 'input',
    dataIndex: 'devicemodel',
    placeholder: '',
    width: 160,
    tip: true,
    disable: false,
    maxLength: 100,
  },
];

export const PickerData = [
  {
    colName: '描述',
    colType: 'input',
    dataIndex: 'description',
    width: 100,
    tip: true,
  },
  {
    colName: '失效时间',
    colType: 'RangePickers',
    dataIndex: 'rateDeadline',
    width: 120,
    tip: true,
  },
  {
    colName: '月份',
    colType: 'RangePicker',
    dataIndex: 'mount',
    width: 62,
    tip: true,
  },
  {
    colName: '峰平谷时段',
    colType: 'TimeTable',
    dataIndex: 'minTable',
    width: 160,
    tip: true,
  },
];

export const TimeOucker = [
  {
    colName: '开始',
    colType: 'input',
    dataIndex: 'startTime',
    width: 110,
    tip: true,
  },
  {
    colName: '结束',
    colType: 'input',
    dataIndex: 'endTime',
    width: 110,
    tip: true,
  },
  {
    colName: '名称',
    colType: 'select',
    dataIndex: 'rateName',
    width: 160,
    tip: true,
  },
];

//复制粘贴
export const handlePaste = (values) => {
  const value = values.trim();
  const hiddenInputValue =
    value.indexOf('\\n') >= 0 ? value.replace(/[\s+]/g, ';') : value.replace(/[\r\n]/g, ';');
  const valueSplit =
    hiddenInputValue.indexOf(';;') > -1
      ? hiddenInputValue
      : hiddenInputValue.replace(/\s{1,}/g, ';');
  const data =
    hiddenInputValue.indexOf(';;') > -1
      ? hiddenInputValue.split(';;')
      : valueSplit.indexOf(';') > -1
      ? valueSplit.split(';')
      : valueSplit.split(/[\s+\n\f\r]/g);
  // let NumReg = /^\D$/;
  // let result = data.find(item => NumReg.test(item));
  // if (result) {
  //   console.log('执行了')
  //   return [];
  // }
  return data;
};

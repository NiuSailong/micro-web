export const COLUMNSOBJ = {
  name: {
    title: '姓名',
    dataIndex: 'name',
  },
  mobile: {
    title: '手机号',
    dataIndex: 'mobile',
  },
};
export const COLUMNS_OPTIONS = function (onColumn) {
  let array = [];
  Object.keys(COLUMNSOBJ).forEach((keyVal) => {
    const item = COLUMNSOBJ[keyVal];
    array.push({
      ...item,
      render: (text, row, index) => {
        return onColumn(text, row, index, keyVal);
      },
    });
  });
  return array;
};

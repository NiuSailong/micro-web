export const COLUMNSOBJ = {
  personName: {
    title: '姓名',
    dataIndex: 'personName',
  },
  personMobile: {
    title: '手机号',
    dataIndex: 'personMobile',
  },
  comment: {
    title: '反馈内容',
    dataIndex: 'comment',
    width: 400,
    ellipsis: true,
  },
  stop: {
    title: '是否点击关闭',
    dataIndex: 'stop',
  },
  result: {
    title: '反馈结果',
    dataIndex: 'result',
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

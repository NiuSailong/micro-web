export const COLUMNS_OPTIONS = function (onColumn) {
  return [
    {
      title: '序号',
      dataIndex: 'order',
      width: 140,
      ellipsis: true,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'order');
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'title');
      },
    },
    {
      title: '发送人',
      width: 140,
      ellipsis: true,
      dataIndex: 'userName',
      render: (text, row, index) => {
        return onColumn(text, row, index, 'userName');
      },
    },
    {
      title: '发送时间',
      width: 180,
      ellipsis: true,
      dataIndex: 'sentTime',
      render: (text, row, index) => {
        return onColumn(text, row, index, 'sentTime');
      },
    },
    {
      title: '事件时间',
      width: 180,
      ellipsis: true,
      dataIndex: 'createTime',
      render: (text, row, index) => {
        return onColumn(text, row, index, 'createTime');
      },
    },
    {
      title: '公告类型',
      width: 150,
      ellipsis: true,
      dataIndex: 'type',
      render: (text, row, index) => {
        return onColumn(text, row, index, 'type');
      },
    },
    {
      title: '事件发生单位',
      width: 120,
      ellipsis: true,
      dataIndex: 'dept1',
      render: (text, row, index) => {
        return onColumn(text, row, index, 'dept1');
      },
    },
    {
      title: '被引用次数',
      width: 120,
      ellipsis: true,
      dataIndex: 'quoteNum',
      render: (text, row, index) => {
        return onColumn(text, row, index, 'quoteNum');
      },
    },
  ];
};

export const COLUMNS_OPTIONS = function (onColumn, sortObj = {}) {
  return [
    {
      title: '序号',
      dataIndex: 'order',
      sorter: true,
      sortOrder: sortObj.type === 'order' ? sortObj.value : false,
      width: 120,
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'order');
      },
    },
    {
      title: '收件人',
      sorter: true,
      ellipsis: { showTitle: false },
      sortOrder: sortObj.type === 'addressee' ? sortObj.value : false,
      dataIndex: 'addressee',
      width: 180,
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'addressee');
      },
    },
    {
      title: '发送人',
      width: 140,
      ellipsis: true,
      sortOrder: sortObj.type === 'userName' ? sortObj.value : false,
      sorter: true,
      dataIndex: 'userName',
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'userName');
      },
    },
    {
      title: '公告标题',
      width: 200,
      ellipsis: true,
      sortOrder: sortObj.type === 'title' ? sortObj.value : false,
      sorter: true,
      dataIndex: 'title',
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'title');
      },
    },
    {
      title: '发送时间',
      width: 180,
      sortOrder: sortObj.type === 'sentTime' ? sortObj.value : false,
      sorter: true,
      dataIndex: 'sentTime',
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'sentTime');
      },
    },
    {
      title: '公告类型',
      width: 140,
      sortOrder: sortObj.type === 'type' ? sortObj.value : false,
      sorter: true,
      dataIndex: 'type',
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'type');
      },
    },
    {
      title: '状态',
      width: 120,
      sortOrder: sortObj.type === 'state' ? sortObj.value : false,
      sorter: true,
      dataIndex: 'state',
      showSorterTooltip: false,
      render: (text, row, index) => {
        return onColumn(text, row, index, 'state');
      },
    },
  ];
};

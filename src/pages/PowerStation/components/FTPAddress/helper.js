import { Space, Popconfirm } from 'antd';
import { rulesArr } from '@/pages/PowerStation/components/helper';
import TRButton from '#/components/TRButton';
import moment from 'moment';

export const dataSource = [
  {
    id: 5,
    ftpType: '',
    hostName: '',
    port: 21,
    username: '',
    password: '',
    basePath: '/',
    ftpOrder: 1,
    createTime: '',
    createUserName: '',
    updateTime: '',
    updateUserName: '',
  },
  {
    id: 50,
    ftpType: '',
    hostName: '',
    port: 21,
    username: '',
    password: '',
    basePath: '/',
    ftpOrder: 1,
    createTime: '',
    createUserName: '',
    updateTime: '',
    updateUserName: '',
  },
];

export const columns = ({ dataList, deleteFn, editFn, btnPer }) => {
  return [
    {
      title: 'ftp类型',
      dataIndex: 'ftpType',
    },
    {
      title: 'ip地址',
      dataIndex: 'hostName',
    },
    {
      title: '端口',
      dataIndex: 'port',
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '密码',
      dataIndex: 'password',
    },
    {
      title: '路径地址',
      dataIndex: 'basePath',
    },
    {
      title: '顺序',
      dataIndex: 'ftpOrder',
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
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      width: 200,
      render: (text) => {
        return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      align: 'center',
      dataIndex: 'id',
      render: (id) => {
        return (
          <Space>
            <TRButton
              buttonPermissions={btnPer}
              menuCode={'PS-FTP-edit'}
              type="link"
              onClick={() => editFn(dataList?.find((v) => v.id === id))}
            >
              编辑
            </TRButton>
            <Popconfirm
              title="删除该ftp配置有可能会导致短期预测数据抓取或下发失败！是否删除？"
              placement={'topRight'}
              onConfirm={() => deleteFn(id)}
            >
              <TRButton buttonPermissions={btnPer} menuCode={'PS-FTP-delete'} type="link">
                删除
              </TRButton>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
};

export const formMap = [
  {
    title: 'ftp类型',
    dataIndex: 'ftpType',
    rules: rulesArr.lengthRule(255),
  },
  {
    title: 'ip地址',
    dataIndex: 'hostName',
    rules: rulesArr.lengthRule(255),
  },
  {
    title: '端口',
    dataIndex: 'port',
    rules: [...rulesArr.lengthRule(5), ...rulesArr.numRule],
  },
  {
    title: '用户名',
    dataIndex: 'username',
    rules: rulesArr.lengthRule(255),
  },
  {
    title: '密码',
    dataIndex: 'password',
    rules: rulesArr.lengthRule(255),
  },
  {
    title: '路径地址',
    dataIndex: 'basePath',
    rules: rulesArr.lengthRule(255),
  },
  {
    title: '顺序',
    dataIndex: 'ftpOrder',
    rules: [...rulesArr.lengthRule(2), ...rulesArr.numRule],
  },
];

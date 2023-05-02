import styles from './index.less';
import { Divider } from 'antd';
import React from 'react';
import xlsx from '@/assets/img/file/excel.png';
import docx from '@/assets/img/file/world.png';
import other from '@/assets/img/file/other.png';
import image from '@/assets/img/file/file.png';
import moment from 'moment';
import mqtt from '@/pages/IOTData/component/mqtt';
import template from '@/pages/IOTData/component/template';

export const deviceConfigMax = 500;

export const messageWait = '当前操作数据量较大，预计需要5分钟，请耐心等待';

export const modalComp = {
  mqtt,
  template,
};
export const DEPLOY_TYPE = {
  STOP: 'stop',
  INIT: 'init',
  RUN: 'run',
};

export const FILE_TYPE = {
  xlsx,
  xls: xlsx,
  docx,
  other,
  image,
  doc: docx,
};
export const tabs = {
  message: '信息',
  annex: '附件',
};
export const PAGE_TYPE = {
  ADD: 'add',
  EDIT: 'edit',
  READONLY: 'readonly',
};

export const PAGE_TYPE_DESC = {
  [PAGE_TYPE.ADD]: '新建',
  [PAGE_TYPE.EDIT]: '编辑',
  [PAGE_TYPE.READONLY]: '查看',
};

export const pageSizeArray = [10, 20, 50, 100];
const mqttReg = /^[\w#+/]*$/;

const sslTlsProtocolList = [
  { label: 'SSLv1', value: 'SSLv1' },
  { label: 'SSLv2', value: 'SSLv2' },
  { label: 'SSLv3', value: 'SSLv3' },
  { label: 'TLSv1', value: 'TLSv1' },
  { label: 'TLSv1.1', value: 'TLSv1.1' },
  { label: 'TLSv1.2', value: 'TLSv1.2' },
  { label: 'TLSv1.3', value: 'TLSv1.3' },
  { label: 'SSL_TLS', value: 'SSL_TLS' },
];
export const allClear = [
  'trustedKeystoreOnlyPassword',
  'clientKeyPassword',
  'certificateFilesPemFormat',
  'trustedKeystorePassword',
  'clientKeystorePassword',
  'clientKeyPairPassword',
];
export const fileList = [
  'selfCreatedCaFile',
  'trustedKeystoreOnlyFile',
  'caFile',
  'clientCertificateFile',
  'clientKeyFile',
  'trustedKeystoreFile',
  'clientKeystoreFile',
];
export const typeList = [
  { label: '使用服务器签名证书', value: 'useServerSignedCertificate', children: [] },
  { label: '使用自建CA(单个)', value: 'useSelfCreatedCA', children: ['selfCreatedCaFile'] },
  {
    label: '使用可信密钥库(单个)',
    value: 'useTrustedKeystoreFile',
    children: ['trustedKeystoreOnlyFile', 'trustedKeystoreOnlyPassword'],
  },
  {
    label: '使用证书文件(多个)',
    value: 'useCertificateFiles',
    children: [
      'caFile',
      'clientCertificateFile',
      'clientKeyFile',
      'clientKeyPassword',
      'certificateFilesPemFormat',
    ],
  },
  {
    label: '使用密钥库(多个)',
    value: 'useKeystoreFiles',
    children: [
      'trustedKeystoreFile',
      'trustedKeystorePassword',
      'clientKeystoreFile',
      'clientKeystorePassword',
      'clientKeyPairPassword',
    ],
  },
];
const lwtQosList = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
];
export const mqttConnect = [
  {
    title: 'User Credentials',
    id: 'UserCredentials',
    data: [
      { label: '描述', id: 'desc' },
      { label: 'mqtt 用户名', id: 'username' },
      { label: 'mqtt 密码', id: 'password' },
      { label: '服务器host', id: 'host', required: true },
      { label: '端口', id: 'port', required: true },
    ],
  },
  {
    title: 'General',
    id: 'General',
    data: [
      { label: '连接超时', id: 'connectionTimeout' },
      { label: '保活间隔', id: 'keepAliveInterval' },
      { label: '是否清除session', id: 'cleanSession', type: 'checkbox' },
      { label: '是否自动重连', id: 'automaticReconnect', type: 'checkbox' },
      { label: '同时发布消息数量', id: 'maxInflight' },
    ],
  },
  {
    title: 'SSL/TLS',
    id: 'SSLTLS',
    data: [
      { label: '是否开启SSL/TLS', id: 'enableSSLTLS', type: 'checkbox' },
      {
        label: '是否开启hostname校验',
        id: 'enabledHostnameVerification',
        type: 'checkbox',
        boolean: 'enableSSLTLS',
      },
      { label: 'SSL/TSL协议版本', id: 'sslTlsProtocol', type: 'select', list: sslTlsProtocolList },
      { label: '类型', id: 'type', type: 'select', list: typeList },
      //useSelfCreatedCA
      { label: '自建CA文件', id: 'selfCreatedCaFile', show: 'useSelfCreatedCA', type: 'file' },
      // useTrustedKeystoreFile
      {
        label: '可信密钥库文件',
        id: 'trustedKeystoreOnlyFile',
        type: 'file',
        show: 'useTrustedKeystoreFile',
      },
      {
        label: '可信密钥库密码',
        id: 'trustedKeystoreOnlyPassword',
        show: 'useTrustedKeystoreFile',
      },
      // useCertificateFiles
      { label: 'ca文件', id: 'caFile', type: 'file', show: 'useCertificateFiles' },
      {
        label: '客户端证书文件',
        id: 'clientCertificateFile',
        type: 'file',
        show: 'useCertificateFiles',
      },
      { label: '客户端密钥', id: 'clientKeyFile', type: 'file', show: 'useCertificateFiles' },
      { label: '客户端密钥密码', id: 'clientKeyPassword', show: 'useCertificateFiles' },
      {
        label: '是否开始pem格式化',
        id: 'certificateFilesPemFormat',
        show: 'useCertificateFiles',
        type: 'checkbox',
      },
      // useKeystoreFiles
      {
        label: '可信密钥库文件',
        id: 'trustedKeystoreFile',
        type: 'file',
        show: 'useKeystoreFiles',
      },
      { label: '可信密钥库文件密码', id: 'trustedKeystorePassword', show: 'useKeystoreFiles' },
      {
        label: '客户端密钥库文件',
        id: 'clientKeystoreFile',
        type: 'file',
        show: 'useKeystoreFiles',
      },
      { label: '客户端密钥库文件密码', id: 'clientKeystorePassword', show: 'useKeystoreFiles' },
      { label: '客户端密钥对密码', id: ' clientKeyPairPassword', show: 'useKeystoreFiles' },
    ],
  },
  {
    title: 'Proxy',
    id: 'Proxy',
    data: [
      { label: '是否使用http代理', id: 'useProxy', type: 'checkbox' },
      { label: '代理账户名', id: 'httpProxyUser' },
      { label: '代理密码', id: 'httpProxyPassword' },
      { label: '代理host', id: 'httpProxyHost' },
      { label: '代理port', id: 'httpProxyPort' },
      { label: '代理请求的header', id: 'httpProxyHeaderUserAgent' },
    ],
  },
  {
    title: 'LWT',
    id: 'LWT',
    data: [
      { label: '遗嘱', id: 'testament' },
      { label: '最终遗愿目的', id: 'lastWillDestination' },
      { label: '遗愿qos', id: 'lwtQos', type: 'select', list: lwtQosList, defaultValue: 0 },
      { label: '是否保留遗愿', id: 'lwtRetained', type: 'checkbox' },
    ],
  },
];

export const baseForm = [
  {
    label: '项目',
    required: true,
    id: 'datainfoName',
    rules: [{ max: 15, message: '最多可以输入15个字符' }],
  },
  {
    label: 'mqtt TOPIC',
    required: true,
    id: 'mqttTopic',
    rules: [
      {
        validator: (_, value = '', callback) => {
          const valueArr = value.split(',');
          valueArr.forEach((str) => {
            if (!mqttReg.test(str)) {
              return callback("只支持字母数字 '#'、'+'和'/' 字符");
            }
          });
          return callback();
        },
      },
      { max: 200, message: '最多可以输入200个字符' },
    ],
  },
  { label: '类型', required: true, id: 'type', type: 'select', listKey: 'typeList' },
  { label: '使用模板', required: false, id: 'model', modal: 'template' },
  { label: 'mqtt 连接', required: true, id: 'mqttClient', modal: 'mqtt' },
  {
    label: '存储到已存在增强流',
    id: 'tableRedirect',
    type: 'select',
    listKey: 'tableRedirect',
  },
  {
    label: '原始流TOPIC',
    required: true,
    id: 'kafkaSourceTopic',
    rules: [
      { pattern: /^[\w_]*$/, message: "只支持字母数字'_'字符" },
      { max: 200, message: '最多可以输入200个字符' },
    ],
  },
  {
    label: '增强流TOPIC',
    required: true,
    id: 'kafkaEnhanceTopic',
    rules: [
      { pattern: /^[\w_]*$/, message: "只支持字母数字'_'字符" },
      { max: 200, message: '最多可以输入200个字符' },
    ],
  },
  {
    label: 'slaveNode',
    id: 'slaveNode',
    type: 'select',
    listKey: 'slaveNode',
    required: true,
  },
  {
    label: 'TOPIC',
    required: true,
    id: 'topic',
    rules: [{ max: 200, message: '最多可以输入200个字符' }],
  },
  {
    label: 'ksqlNode',
    id: 'ksqlNode',
    type: 'select',
    listKey: 'ksqlNode',
    required: true,
  },
  { label: '创建人', id: 'createBy', readonly: true, valueShow: true },
  { label: '修订时间', id: 'modifyTime', readonly: true, valueShow: true, date: true },
  { label: '创建时间', id: 'createTime', readonly: true, valueShow: true, date: true },
  { label: '取消原因', id: 'remark', readonly: true, valueShow: true },
];

export const getDeviceConfig = () => {
  return [
    {
      label: '设备编号',
      id: 'deviceNum',
      type: 'input',
      span: 5,
      required: true,
      paste: true,
      pasteArr: ['deviceNum', 'deviceName'],
      rules: [],
    },
    {
      label: '设备名称',
      id: 'deviceName',
      type: 'input',
      span: 6,
      required: true,
      paste: true,
      pasteArr: ['deviceName'],
      rules: [],
    },
    {
      label: '场站编码',
      id: 'deptNum',
      type: 'input',
      span: 6,
      required: true,
      rules: [],
    },
    { label: '设备模型', id: 'model', modal: 'template', span: 7 },
  ];
};

export const OPERATION_TYPE = {
  CHOOSE: 'choose',
  SAVE: 'save',
  COPY: 'copy',
  DELETE: 'delete',
};
export const getTemplateLeft = () => {
  return [
    // { label: '序号', id: 'id', span: 8, readonly: true },
    { label: '模型编码', id: 'model', readonly: true, span: 24 },
  ];
};
export const templateRight = [
  { label: '系统点位', id: 'label', type: 'input', span: 8 },
  { label: '系统点位名称', id: 'labelName', type: 'input', span: 8 },
  { label: '原始点位', id: 'tagName', type: 'input', span: 8, paste: true, pasteArr: ['tagName'] },
];
export const handleDate = (time, reset) => {
  if (!time || reset) {
    return null;
  }
  return moment(time).valueOf();
};
export const getMqttColumns = (onEdit) => {
  return [
    { title: '描述', dataIndex: 'desc', key: 'desc' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: 'mqtt密码', dataIndex: 'password', key: 'password' },
    // { title: 'mqtt编码', dataIndex: 'code', key: 'code' },
    { title: 'mqtt host', dataIndex: 'host', key: 'host' },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (val, record) => {
        return (
          <div className={styles.IOTList_operation}>
            <span onClick={() => onEdit(record)}>编辑</span>
          </div>
        );
      },
    },
  ];
};

export const handleResult = (data = [], topic, updateArr) => {
  let repeatArr = [],
    repeatFlag = false,
    resultArr = [],
    recordArr = [],
    recordIndex = 0;
  data.forEach((item) => {
    if (repeatArr.includes(item.deviceNum) || repeatFlag) {
      repeatFlag = true;
      return false;
    }
    let resultObj = { ...item, deleteFlag: item.deleteFlag || false, topic };
    Object.keys(item).forEach((key) => {
      if (item[key] === '同上') {
        if (key === 'model') {
          resultObj.labels = recordArr[recordIndex - 1]?.labels;
        }
        resultObj[key] = (recordArr[recordIndex - 1] && recordArr[recordIndex - 1][key]) || '';
      }
    });
    repeatArr.push(item.deviceNum);
    if (resultObj.add || resultObj.deleteFlag || updateArr.includes(resultObj.id)) {
      if (resultObj.labels && resultObj.labels instanceof Array) {
        resultObj.labels = resultObj.labels.map((label) => {
          return { ...label, deleteFlag: label.deleteFlag || false };
        });
      }
      resultArr.push(resultObj);
    }
    if (!resultObj.deleteFlag) {
      recordArr.push(resultObj);
      recordIndex++;
    }
  });

  if (repeatFlag) {
    return null;
  }
  return resultArr;
};
export const getColumns = (onDelete, onAdd, { stateList, typeList }) => {
  const columns = [
    {
      title: '项目',
      dataIndex: 'datainfoName',
      key: 'datainfoName',
    },
    {
      title: 'TOPIC',
      dataIndex: 'topic',
      key: 'topic',
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (val) => {
        return <div>{moment(val).format('YYYY-MM-DD HH:mm')}</div>;
      },
    },
    {
      title: '修订时间',
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      render: (val) => {
        return <div>{moment(val).format('YYYY-MM-DD HH:mm')}</div>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (val) => {
        const cur = typeList.filter((n) => n.value === val)[0] || {};
        return <div>{cur.title || ''}</div>;
      },
    },
    {
      title: '部署状态',
      dataIndex: 'deployState',
      key: 'deployState',
      render: (val) => {
        const cur = stateList.filter((n) => n.value === val)[0] || {};
        return <div>{cur.title || ''}</div>;
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 160,
      render: (val, record) => {
        const { topic, datainfoId } = record;
        return (
          <div className={styles.IOTList_operation}>
            <span onClick={() => onAdd(PAGE_TYPE.READONLY, { topic, datainfoId })}>查看</span>
            <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
            <span onClick={() => onAdd(PAGE_TYPE.EDIT, { topic, datainfoId })}>编辑</span>
            <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
            <span onClick={() => onDelete(record)}>删除</span>
          </div>
        );
      },
    },
  ];
  return columns;
};

export const handlePastes = (values) => {
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
  let NumReg = /^\D$/;
  let result = data.find((item) => NumReg.test(item));
  if (result) {
    return [];
  }
  let resultData = [];
  data.forEach((n) => {
    if (n.split('\t').filter((y) => y).length) {
      resultData.push(n.split('\t'));
    }
  });
  return resultData;
};
export const ImageTypeList = [
  'bmp',
  'jpg',
  'jpeg',
  'png',
  'tif',
  'gif',
  'pcx',
  'tga',
  'exif',
  'fpx',
  'svg',
  'psd',
  'cdr',
  'pcd',
  'dxf',
  'ufo',
  'eps',
  'ai',
  'raw',
  'WMF',
  'webp',
];

export function dataURLtoFile(dataUrl) {
  //将base64转换为文件
  let str = atob(dataUrl);
  let n = str.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = str.charCodeAt(n);
  }
  return new File([u8arr], 'file', {
    type: '',
  });
}

import React from 'react';
import styles from './index.less';
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Select, message, Modal } from 'antd';
import { MinusCircleOutlined, CloseOutlined, PlusOutlined } from '#/utils/antdIcons';
import PanelTitle from '#/components/PanelTitle';
import { queryAddUser, queryRoleData } from '@/services/usermanage';
import alert from '#/components/Alert';
import AlretModal from '../components/AlretModal';
import { HttpCode, AlertResult } from '#/utils/contacts';
import roleSettleModal from '../components/roleSettleModal';
import TBasePage from '#/base/TBasePage';
import renovate from '#/utils/renovate';
import { connect } from 'dva';
import { isSuperAdmin, getcompanys } from '@/services/roleManage';

@connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))
class Index extends TBasePage {
  constructor() {
    super();
    this.state = {
      dataSource: [
        {
          key: 0,
          name: 'Edward King 0',
          age: '32',
          address: 'London, Park Lane no. 0',
          selectionRes: [],
        },
      ],
      count: 1,
      selection: [],
      partRoleBodyList: [],
      stationList: [],
      stationObj: {},
      alertvisible: false,
      res: {},
      issubmitBtn: true,
      superuser: false,
      companys: [],
      company: '',
    };
    this.formRef = React.createRef();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this._onRenovateClear__();
  }
  componentDidMount() {
    this._getRoleData();
    this._onRenovateSet__();
    this.__onListenerBeforeunload__();
    this.isroot();
    this.getCompanys();
    let result =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'xinJianYongHuTiJiao')
        .length > 0;
    if (!result) {
      this.setState({ issubmitBtn: false });
    }
  }
  _onBeforeunload(e) {
    if (renovate.isRenovate) {
      let confirmationMessage = '当前工作将不被保存，继续执行此操作？';
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
  }
  /*确认是否是超级管理用户*/
  isroot = async () => {
    let params = {
      loginToken: localStorage.token,
    };
    let res = await isSuperAdmin(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.setState({
        superuser: res.data,
      });
    }
  };
  /*获取公司列表 */
  getCompanys = async () => {
    let res = await getcompanys();
    if (res.statusCode === HttpCode.SUCCESS) {
      this.setState({
        companys: res.companyBodyList,
      });
    }
  };
  async _onChangeStation(key, index) {
    //调用弹窗
    const { partRoleBodyList } = this.state;
    this[`_recipientsSelect${index}`] && this[`_recipientsSelect${index}`].blur();

    let reslut = await roleSettleModal.show(partRoleBodyList, key && key.selectionRes);

    if (reslut.index === 1) {
      this.state.dataSource[index].selectionRes = JSON.parse(JSON.stringify(reslut.stationList));
      this.setState({ selection: reslut.stationList, dataSource: this.state.dataSource });
    }
  }

  _onDeselectRecipient(text, index, number) {
    const { dataSource } = this.state;
    let selectionRes = this.state.dataSource[index].selectionRes.filter(
      (n) => n.roleName !== number,
    );
    this.state.dataSource[index].selectionRes = selectionRes;
    this.setState({ dataSource });
  }
  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter((item) => item.key !== key) });
  };
  handleAdd = () => {
    //继续添加
    const { dataSource, count } = this.state;
    const length = dataSource.length;
    const newData = {
      key: count,
      name: `Edward King ${dataSource.length}`,
      age: 32,
      address: `London, Park Lane no. ${dataSource.length}`,
      selectionRes: JSON.parse(JSON.stringify(dataSource[length - 1].selectionRes)),
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };

  //获取角色
  async _getRoleData() {
    let res = await queryRoleData({
      type: 0,
      userId: '',
    });
    if (res && res.statusCode == HttpCode.SUCCESS) {
      this.setState({ partRoleBodyList: res.partRoleBodyList });
    }
  }
  async _getAddUser(data) {
    //添加用户接口

    let res = await queryAddUser({ addUserInfoBodyList: data });
    await this.setState({ res });
    if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success('创建成功');
      this.props.onCloseDetails();
    } else if (res && res.statusCode === '2600') {
      if (JSON.stringify(res) !== '{}') {
        this.setState({ alertvisible: true });
      }
    }
  }
  _disposeData(values) {
    const { partRoleBodyList, dataSource } = this.state;
    let name = Object.keys(values)
      .filter((item) => item.indexOf('name') >= 0)
      .map((n) => values[n]);
    let description = Object.keys(values)
      .filter((item) => item.indexOf('description') >= 0)
      .map((n) => values[n]);
    let email = Object.keys(values)
      .filter((item) => item.indexOf('email') >= 0)
      .map((n) => values[n]);
    let mobile = Object.keys(values)
      .filter((item) => item.indexOf('mobile') >= 0)
      .map((n) => values[n]);
    let companyNum = Object.keys(values)
      .filter((item) => item.indexOf('companyNum') >= 0)
      .map((n) => values[n]);
    let arr = [];
    name.forEach((item, index) => {
      let strArr = dataSource && dataSource[index].selectionRes.map((_item) => _item.roleName);

      let newArr = partRoleBodyList.filter((n) => strArr.indexOf(n.roleName) >= 0);

      let flatArr = newArr.map((_item) => _item.roleId);

      let obj = {
        description: description[index] || '',
        email: email[index] || '',
        mobile: mobile[index] || '',
        companyNum: companyNum[index] || '',
        name: item || '',
        roleIds: flatArr,
      };
      arr.push(obj);
    });
    return arr;
  }
  _submitFn = async () => {
    const { issubmitBtn } = this.state;
    //提交
    if (!issubmitBtn) {
        message.config({ top: '50%' });
      return message.info('请联系管理员获取相关权限');
    }

    try {
      const values = await this.formRef.current.validateFields();
      this._getAddUser(this._disposeData(values));
    } catch (errorInfo) {
      // errorInfo
    }
  };

  clons = async () => {
    let obj = await alert.show('当前工作将不被保存，继续执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      this.props.onCloseDetails();
    }
  };
  onCloseDetails = () => {
    this.setState({ alertvisible: false });
  };
  //选择公司
  selected = (val) => {
    this.setState({
      company: val,
    });
  };
  render() {
    const { dataSource, res, issubmitBtn, superuser, companys } = this.state;
    const columns = superuser
      ? [
          {
            title: (
              <span>
                <b className={styles.IconXing}>*</b> 姓名
              </span>
            ),
            dataIndex: 'name',
            editable: true,
            className: `${styles.columuColor}`,
            width: '15%',
            render: (text, w) => {
              return (
                <Form.Item
                  rules={[{ required: true, message: '姓名不能为空' }]}
                  name={`name[${w.key}]`}
                  validateTrigger="onBlur"
                  getValueFromEvent={(event) => {
                    return event.target.value.substring(0, 10);
                  }}
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            title: (
              <span>
                <b className={styles.IconXing}>*</b> 手机号
              </span>
            ),
            dataIndex: 'mobile',
            className: `${styles.columuColor}`,
            width: '15%',
            render: (text, w) => {
              return (
                <Form.Item
                  name={`mobile[${w.key}]`}
                  validateTrigger="onBlur"
                  getValueFromEvent={(event) => {
                    return event.target.value.substring(0, 11);
                  }}
                  rules={[
                    {
                      validator: (_w, y, callback) => {
                        const reg = /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/;
                        let mobileArr = [];
                        let objArr = this.formRef.current.getFieldValue();
                        Object.keys(objArr).forEach((item) => mobileArr.push(objArr[item]));
                        let arr = mobileArr.filter((item) => item === y);
                        if (y === '') {
                          return callback('手机号不能为空');
                        }
                        if (!reg.test(y)) {
                          return callback('请录入正确的手机号');
                        }
                        if (arr && arr.length >= 2) {
                          return callback('手机号重复');
                        }
                        callback();
                      },
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            title: (
              <span>
                <b className={styles.IconXing}>*</b> 公司
              </span>
            ),
            dataIndex: 'companyNum',
            editable: true,
            className: `${styles.columuColor}`,
            width: '20%',
            render: (text, w) => {
              return (
                <Form.Item
                  rules={[{ required: true, message: '公司不能为空' }]}
                  name={`companyNum[${w.key}]`}
                  validateTrigger="onBlur"
                  getValueFromEvent={(event) => {
                    return event.substring(0, 10);
                  }}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    onChange={this.selected}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {companys.map((item) => {
                      return (
                        <Select.Option
                          value={item.companyNum}
                          key={item.id}
                          label={item.companyName}
                        >
                          {item.companyNum}-{item.companyName}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              );
            },
          },
          {
            title: '邮箱',
            dataIndex: ' email',
            className: `${styles.columuColor}`,
            render: (text, w) => {
              return (
                <Form.Item
                  name={`email[${w.key}]`}
                  rules={[
                    {
                      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                      message: '请录入正确的邮箱',
                    },
                  ]}
                  validateTrigger="onBlur"
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            title: '角色',
            className: `${styles.columuColordan}`,
            render: (text, w, y) => {
              return (
                <Select
                  mode="multiple"
                  maxTagCount={1}
                  style={{ marginRight: '16px', width: '100%', marginBottom: '24px' }}
                  ref={(node) => {
                    this['_recipientsSelect' + y] = node;
                  }}
                  open={false}
                  value={
                    this.state.dataSource &&
                    this.state.dataSource[y] &&
                    this.state.dataSource[y].selectionRes.map((item) => item.roleName)
                  }
                  showSearch={false}
                  onSearch={this._onChangeStation.bind(this, text, y)}
                  onFocus={this._onChangeStation.bind(this, text, y)}
                  onDeselect={this._onDeselectRecipient.bind(this, text, y)}
                />
              );
            },
          },
          {
            title: '备注',
            dataIndex: 'description',
            className: `${styles.columuColor}`,
            render: (text, w) => {
              return (
                <Form.Item
                  name={`description[${w.key}]`}
                  rules={[
                    {
                      max: 50,
                      message: '字数限制50',
                    },
                  ]}
                  getValueFromEvent={(event) => {
                    return event.target.value.substring(0, 50);
                  }}
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            className: `${styles.columuColors}`,
            dataIndex: 'option',
            render: (text, record) =>
              dataSource.length >= 2 ? (
                <Popconfirm
                  overlayClassName={styles.roleUserPopconfirm}
                  title="确认删除?"
                  onConfirm={() => this.handleDelete(record.key)}
                >
                  <MinusCircleOutlined />
                </Popconfirm>
              ) : null,
          },
        ]
      : [
          {
            title: (
              <span>
                <b className={styles.IconXing}>*</b> 姓名
              </span>
            ),
            dataIndex: 'name',
            editable: true,
            className: `${styles.columuColor}`,
            width: '15%',
            render: (text, w) => {
              return (
                <Form.Item
                  rules={[{ required: true, message: '姓名不能为空' }]}
                  name={`name[${w.key}]`}
                  validateTrigger="onBlur"
                  getValueFromEvent={(event) => {
                    return event.target.value.substring(0, 10);
                  }}
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            title: (
              <span>
                <b className={styles.IconXing}>*</b> 手机号
              </span>
            ),
            dataIndex: 'mobile',
            className: `${styles.columuColor}`,
            width: '15%',
            render: (text, w) => {
              return (
                <Form.Item
                  name={`mobile[${w.key}]`}
                  validateTrigger="onBlur"
                  getValueFromEvent={(event) => {
                    return event.target.value.substring(0, 11);
                  }}
                  rules={[
                    {
                      validator: (_w, y, callback) => {
                        const reg = /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/;
                        let mobileArr = [];
                        let objArr = this.formRef.current.getFieldValue();
                        Object.keys(objArr).forEach((item) => mobileArr.push(objArr[item]));
                        let arr = mobileArr.filter((item) => item === y);
                        if (y === '') {
                          return callback('手机号不能为空');
                        }
                        if (!reg.test(y)) {
                          return callback('请录入正确的手机号');
                        }
                        if (arr && arr.length >= 2) {
                          return callback('手机号重复');
                        }
                        callback();
                      },
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            title: '邮箱',
            dataIndex: ' email',
            className: `${styles.columuColor}`,
            render: (text, w) => {
              return (
                <Form.Item
                  name={`email[${w.key}]`}
                  rules={[
                    {
                      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                      message: '请录入正确的邮箱',
                    },
                  ]}
                  validateTrigger="onBlur"
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            title: '角色',
            className: `${styles.columuColordan}`,
            render: (text, w, y) => {
              return (
                <Select
                  mode="multiple"
                  maxTagCount={1}
                  style={{ marginRight: '16px', width: '100%', marginBottom: '24px' }}
                  ref={(node) => {
                    this['_recipientsSelect' + y] = node;
                  }}
                  open={false}
                  value={
                    this.state.dataSource &&
                    this.state.dataSource[y] &&
                    this.state.dataSource[y].selectionRes.map((item) => item.roleName)
                  }
                  showSearch={false}
                  onSearch={this._onChangeStation.bind(this, text, y)}
                  onFocus={this._onChangeStation.bind(this, text, y)}
                  onDeselect={this._onDeselectRecipient.bind(this, text, y)}
                />
              );
            },
          },
          {
            title: '备注',
            dataIndex: 'description',
            className: `${styles.columuColor}`,
            render: (text, w) => {
              return (
                <Form.Item
                  name={`description[${w.key}]`}
                  rules={[
                    {
                      max: 50,
                      message: '字数限制50',
                    },
                  ]}
                  getValueFromEvent={(event) => {
                    return event.target.value.substring(0, 50);
                  }}
                >
                  <Input />
                </Form.Item>
              );
            },
          },
          {
            className: `${styles.columuColors}`,
            dataIndex: 'option',
            render: (text, record) =>
              dataSource.length >= 2 ? (
                <Popconfirm
                  overlayClassName={styles.roleUserPopconfirm}
                  title="确认删除?"
                  onConfirm={() => this.handleDelete(record.key)}
                >
                  <MinusCircleOutlined />
                </Popconfirm>
              ) : null,
          },
        ];

    return (
      <Form ref={this.formRef}>
        <div className={styles.adduserBox}>
          <div className={styles.nav}>
            <div>
              <Breadcrumb>
                <Breadcrumb.Item>后台管理</Breadcrumb.Item>
                <Breadcrumb.Item>用户管理</Breadcrumb.Item>
                <Breadcrumb.Item>新建</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div>
              <CloseOutlined
                type="close"
                style={{ color: '#ACB1C1' }}
                onClick={() => {
                  this.clons();
                }}
              />
            </div>
          </div>
          <div className={styles.title}>
            <PanelTitle title="新建用户" />
          </div>
          <div className={styles.forms}>
            <Table
              pagination={false}
              rowClassName={() => 'editable-row'}
              bordered={false}
              dataSource={dataSource}
              columns={columns}
            />
            <div
              onClick={this.handleAdd}
              style={{ marginBottom: 16, cursor: 'pointer', paddingLeft: '16px', width: '100px' }}
            >
              <PlusOutlined style={{ color: '#1E7CE8' }} />
              <span style={{ color: '#1E7CE8' }}> 继续添加</span>
            </div>
          </div>

          <div className={styles.btns}>
            <Button
              onClick={() => {
                this.clons();
              }}
              style={{ width: '83px' }}
            >
              取消
            </Button>
            <Button
              type="primary"
              style={
                issubmitBtn
                  ? { width: '83px' }
                  : {
                      background: '#f5f5f5',
                      borderColor: '#d9d9d9',
                      color: 'rgba(0,0,0,.25)',
                      width: '83px',
                    }
              }
              onClick={() => {
                this._submitFn();
              }}
            >
              提交
            </Button>
          </div>
          <Modal
            closable={false}
            open={this.state.alertvisible}
            onOk={this.alertvisibleOk}
            footer={null}
            width={500}
            centered={true}
          >
            <AlretModal message={res} onCloseDetails={this.onCloseDetails} type="adduser" />
          </Modal>
        </div>
      </Form>
    );
  }
}
export default Index;

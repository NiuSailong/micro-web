import React from 'react';
import styles from './index.less';
import PanelTitle from '#/components/PanelTitle';
import alert from '#/components/Alert';
import { Button, Breadcrumb, Switch, Spin, Select, Input, Form, message } from 'antd';
import roleSettleModal from '../components/roleSettleModal';
import { HttpCode, AlertResult } from '#/utils/contacts';
import { queryRoleData, queryInfoById, queryChangeUser } from '@/services/usermanage';
import TBasePage from '#/base/TBasePage';
import renovate from '#/utils/renovate';
import { connect } from 'dva';
import { CloseOutlined } from '#/utils/antdIcons';
import menuModal from './menuModal';

const { TextArea } = Input;

@connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))
class Index extends TBasePage {
  formRef = React.createRef();
  state = {
    nameList: ['姓名', '手机号', '邮箱', '角色', '备注'],
    textareaText: this.props.text.description || '',
    partRoleBodyList: [],
    stationList: [],
    userMsgBody: {},
    isLoading: true,
    issubmitBtn: true,
    issubmitBtnBianji: true,
    issubmitBtnLook: true,
    originalRoleIds: [],
  };

  async _getData() {
    const { text } = this.props;
    let [resRoll = {}, resYear = {}] = await Promise.all([
      queryRoleData({ type: 1, userId: text.userId }),
      queryInfoById(text.userId),
    ]);
    if (
      resRoll &&
      resRoll.statusCode == HttpCode.SUCCESS &&
      resYear &&
      resYear.statusCode == HttpCode.SUCCESS
    ) {
      this.setState(
        {
          partRoleBodyList: resRoll.partRoleBodyList,
          userMsgBody: resYear.userMsgBody,
          originalRoleIds: resYear?.userMsgBody?.roleIds || [],
          isLoading: false,
        },
        () => {
          this._changeData();
        },
      );
    }
  }

  _transition() {
    const { partRoleBodyList, stationList } = this.state;
    let arrids = [];
    let stationListArr = stationList.map((item) => item.roleName);
    let newArr = partRoleBodyList.filter((n) => stationListArr.indexOf(n.roleName) >= 0);
    newArr.forEach((item) => arrids.push(item.roleId));
    return arrids;
  }

  _onDeselectRecipient(number) {
    const { stationList } = this.state;
    let selectionRes = stationList.filter((n) => n.roleName !== number);
    this.setState({ stationList: selectionRes });
  }

  async _onChangeStation() {
    const { partRoleBodyList, stationList } = this.state;
    this._recipientsSelect && this._recipientsSelect.blur();
    let reslut = await roleSettleModal.show(partRoleBodyList, stationList);
    if (reslut.index === 1) {
      this.setState({ stationList: reslut.stationList });
    }
  }

  onChange = (checked) => {
    if (checked) {
      this.props.operationBtnFn('startusing', this.props.text);
    } else {
      this.props.operationBtnFn('blockup', this.props.text);
    }
  };
  componentDidMount() {
    const { text } = this.props;
    this.setState({ isLoading: true });
    if (text.status == 1) {
      this.props.IscheckedTrues();
    }
    let result1 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'chaKanYongHuTiJiao').length >
      0;
    let result2 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'bianJiYongHuTiJiao').length >
      0;
    if (!result1) {
      this.setState({ issubmitBtnLook: false });
    }
    if (!result2) {
      this.setState({ issubmitBtnBianji: false });
    }

    this._getData();
    this._onRenovateSet__();
    this.__onListenerBeforeunload__();
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    this._onRenovateClear__();
  }
  _onBeforeunload(e) {
    if (renovate.isRenovate) {
      let confirmationMessage = '当前工作将不被保存，继续执行此操作？';
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
  }

  _changeData() {
    //处理数据
    const { partRoleBodyList, userMsgBody } = this.state;
    if (userMsgBody.roleIds.length >= 0) {
      let newArr = partRoleBodyList.filter((n) => userMsgBody.roleIds.indexOf(n.roleId) >= 0);

      this.setState({ stationList: newArr });
    }
  }

  _submitFn = async () => {
    //提交
    const { type, onCloseDetails } = this.props;
    const {
      userMsgBody,
      textareaText,
      stationList,
      issubmitBtnLook,
      issubmitBtnBianji,
      originalRoleIds,
    } = this.state;

    if (type === 'look') {
      if (!issubmitBtnLook) {
        message.config({ top: '50%' });
        return message.info('请联系管理员获取相关权限');
      }
      let arr = [];
      stationList.forEach((item) => arr.push(item.roleId));
      this.setState({ isLoading: true });
      const deleteArr = this.handleArr(originalRoleIds, arr);
      queryChangeUser({
        description: textareaText,
        email: userMsgBody.email,
        mobile: userMsgBody.mobile,
        name: userMsgBody.name,
        type: 0,
        userId: userMsgBody.userId,
        selectRoleList: arr,
        deleteRoleList: deleteArr,
      }).then((res) => {
        this.setState({ isLoading: false });
        if (res && res.statusCode == HttpCode.SUCCESS) {
            message.config({ top: '50%' });
            message.success('修改成功');
          onCloseDetails();
        } else if (res.statusCode === '2316') {
            message.error(res.message);
        }
      });
    } else {
      if (!issubmitBtnBianji) {
          message.config({ top: '50%' });
        return message.info('请联系管理员获取相关权限');
      }
      try {
        const values = await this.formRef.current.validateFields();
        const deleteArr = this.handleArr(originalRoleIds, this._transition());
        queryChangeUser({
          description: values.description,
          email: values.email,
          mobile: values.mobile,
          name: values.name,
          selectRoleList: this._transition(),
          type: 1,
          userId: userMsgBody.userId,
          deleteRoleList: deleteArr,
        }).then((res) => {
          this.setState({ isLoading: false });
          if (res && res.statusCode == HttpCode.SUCCESS) {
              message.success('修改成功');
            onCloseDetails();
          } else {
              message.error(res?.message || '修改失败');
          }
        });
      } catch (errorInfo) {
        // errorInfo
      }
    }
  };

  /**
   * 对比数据
   * @param {*} arr1 原数据
   * @param {*} arr2 操作后的数据
   * @returns
   */
  handleArr = (arr1, arr2) => {
    const _arr1 = new Set(arr1);
    const _arr2 = new Set(arr2);
    const someArr = [...new Set([..._arr1].filter((x) => _arr2.has(x)))];
    const deleteArr = [];
    arr1.map((item) => {
      if (someArr.indexOf(item) === -1) {
        deleteArr.push(item);
      }
    });
    return deleteArr;
  };

  changeValue(type, value) {
    this.formRef.current.setFieldsValue({
      type: [value],
    });
  }

  clons = async () => {
    let obj = await alert.show('当前工作将不被保存，继续执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      this.props.onCloseDetails();
    }
  };
  render() {
    const { type } = this.props;
    const {
      nameList,
      textareaText,
      stationList,
      userMsgBody,
      isLoading,
      issubmitBtnBianji,
      issubmitBtnLook,
    } = this.state;
    if (JSON.stringify(userMsgBody) === '{}') {
      return (
        <div style={{ position: 'relative' }}>
          {' '}
          <Spin style={{ position: 'absolute', top: '80px', left: '50%' }} />{' '}
        </div>
      );
    }
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 6 },
    };

    return (
      <Form ref={this.formRef}>
        <div className={styles.box}>
          <div className={styles.nav}>
            <div>
              <Breadcrumb>
                <Breadcrumb.Item>后台管理</Breadcrumb.Item>
                <Breadcrumb.Item>用户管理</Breadcrumb.Item>
                <Breadcrumb.Item>用户信息</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div>
              <CloseOutlined
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.clons();
                }}
              />
            </div>
          </div>
          <div className={styles.title}>
            <PanelTitle title="用户信息" style={{ flex: 1 }} />
            {type === 'look' ? (
              <React.Fragment>
                <div
                  className={styles.menu_button}
                  onClick={async () => {
                    const res = await menuModal.show({
                      roleIds: this.state.partRoleBodyList ?? [],
                      userId: this.state.userMsgBody.userId,
                    });
                  }}
                >
                  查看菜单权限
                </div>
                <div className={styles.titleRight}>
                  <span>{this.props.Ischecked ? '已启用' : '已停用'}</span>&nbsp;
                  <Switch checked={this.props.Ischecked} onChange={this.onChange} />{' '}
                </div>
              </React.Fragment>
            ) : null}
          </div>
          <Spin spinning={isLoading}>
            <div className={styles.content}>
              {type === 'look' ? (
                <div className={styles.lookBox}>
                  <div className={styles.left}>
                    {nameList.map((item, ind) => {
                      return <p key={ind}>{item}</p>;
                    })}
                  </div>
                  <div className={styles.right}>
                    <p>{userMsgBody.name || '-'}</p>
                    <p>{userMsgBody.mobile || '-'}</p>
                    <p>{userMsgBody.email || '-'}</p>
                    <p>
                      <Select
                        mode="multiple"
                        maxTagCount={1}
                        style={{ marginRight: '16px', minWidth: '100%' }}
                        ref={(node) => {
                          this._recipientsSelect = node;
                        }}
                        value={stationList.map((n) => n.roleName)}
                        open={false}
                        showSearch={false}
                        onSearch={this._onChangeStation.bind(this)}
                        onFocus={this._onChangeStation.bind(this)}
                        onDeselect={this._onDeselectRecipient.bind(this)}
                      />
                    </p>
                    <p>
                      <TextArea
                        style={{ width: '100%', height: '70px' }}
                        value={textareaText === '-' ? '' : textareaText}
                        onChange={(e) => {
                          this.setState({ textareaText: e.target.value.substring(0, 50) });
                        }}
                      />
                    </p>
                  </div>
                </div>
              ) : (
                <div className={styles.redactBox}>
                  <Form.Item
                    {...formItemLayout}
                    label="姓名"
                    colon={false}
                    name="name"
                    initialValue={userMsgBody.name}
                    rules={[
                      {
                        required: true,
                        message: '姓名不能为空',
                      },
                    ]}
                    validateTrigger="onBlur"
                  >
                    <Input
                      style={{ marginLeft: '15px' }}
                      onChange={(e) => {
                        this.changeValue('name', e.target.value);
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...formItemLayout}
                    label="手机号"
                    colon={false}
                    name="mobile"
                    initialValue={userMsgBody.mobile}
                    rules={[
                      {
                        required: true,
                        message: '手机号不能为空',
                      },
                      {
                        pattern: /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/, //缺少校验手机号唯一
                        message: '请录入正确的手机号',
                      },
                    ]}
                    validateTrigger="onBlur"
                    getValueFromEvent={(event) => {
                      return event.target.value.substring(0, 11);
                    }}
                  >
                    <Input
                      style={{ marginLeft: '15px' }}
                      onChange={(e) => {
                        this.changeValue('mobile', e.target.value);
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...formItemLayout}
                    label="邮箱"
                    colon={false}
                    name="email"
                    initialValue={userMsgBody.email}
                    rules={[
                      {
                        pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                        message: '请录入正确的邮箱',
                      },
                    ]}
                    validateTrigger="onBlur"
                  >
                    <Input
                      style={{ marginLeft: '15px' }}
                      onChange={(e) => {
                        this.changeValue('email', e.target.value);
                      }}
                    />
                  </Form.Item>

                  <Form.Item {...formItemLayout} label="角色" colon={false}>
                    <Select
                      mode="multiple"
                      maxTagCount={1}
                      style={{ marginRight: '16px', width: '100%', marginLeft: '15px' }}
                      ref={(node) => {
                        this._recipientsSelect = node;
                      }}
                      open={false}
                      showSearch={false}
                      value={stationList.map((n) => n.roleName)}
                      onSearch={this._onChangeStation.bind(this)}
                      onFocus={this._onChangeStation.bind(this)}
                      onDeselect={this._onDeselectRecipient.bind(this)}
                    />
                  </Form.Item>

                  <Form.Item
                    {...formItemLayout}
                    label="备注"
                    colon={false}
                    initialValue={textareaText}
                    name="description"
                    getValueFromEvent={(event) => {
                      return event.target.value.substring(0, 50);
                    }}
                  >
                    <Input.TextArea
                      style={{ height: '70px', marginLeft: '15px' }}
                      onChange={(e) => {
                        this.changeValue('description', e.target.value);
                      }}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </Spin>
          {this.props.type === 'look' ? (
            <div className={styles.btns}>
              <Button
                onClick={() => {
                  this.clons();
                }}
                style={{ width: '83px' }}
              >
                取消
              </Button>
              {issubmitBtnLook ? (
                <Button
                  onClick={() => {
                    this._submitFn();
                  }}
                  type="primary"
                  style={{ width: '83px' }}
                  loading={isLoading}
                >
                  提交
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    this._submitFn();
                  }}
                  style={{
                    background: '#f5f5f5',
                    borderColor: '#d9d9d9',
                    color: 'rgba(0,0,0,.25)',
                    width: '83px',
                  }}
                  loading={isLoading}
                >
                  提交
                </Button>
              )}
            </div>
          ) : (
            <div className={styles.btns}>
              <Button
                onClick={() => {
                  this.clons();
                }}
                style={{ width: '83px' }}
              >
                取消
              </Button>
              {issubmitBtnBianji ? (
                <Button
                  onClick={() => {
                    this._submitFn();
                  }}
                  type="primary"
                  style={{ width: '83px' }}
                  loading={isLoading}
                >
                  提交
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    this._submitFn();
                  }}
                  style={{
                    background: '#f5f5f5',
                    borderColor: '#d9d9d9',
                    color: 'rgba(0,0,0,.25)',
                    width: '83px',
                  }}
                  loading={isLoading}
                >
                  提交
                </Button>
              )}
            </div>
          )}
        </div>
      </Form>
    );
  }
}

export default Index;

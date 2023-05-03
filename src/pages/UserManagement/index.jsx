import React from 'react';
import styles from './index.less';
import { HttpCode, AlertResult } from '#/utils/contacts';
import { Button, Select, Input, Drawer, Spin, Modal, Message } from 'antd';
import { styleOption, getColumns } from './helper.js';
import Table from './components/Table';
import RedactAndLook from './RedactAndLook';
import AddUser from './AddUser';
import alert from '#/components/Alert';
import { queryStatus, queryuserList, queryChangeStatus } from '@/services/usermanage';
import TBasePage from '#/base/TBasePage';
import AlretModal from './components/AlretModal';
import { connect } from 'dva';
import { onCheckFeed } from '#/utils/interactive';

@connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))
export default class index extends TBasePage {
  state = {
    status: '', //状态
    allstatus: '', //全部
    isStatus: true,
    searchText: '', //搜索框
    userDetailsVisible: false,
    RedactAndLookDetailsVisible: false,
    tableMessage: { total: 0, size: 10, current: 1 },
    userStatusBodies: [],
    dropDownBoxes: [],
    userInfoBodyObj: {}, //表格数据
    text: {},
    type: '',
    checkBoxValue: [],
    checkBoxText: [],
    isLoading: true,
    isSearchClick: false,
    tableLoading: false,
    res: {},
    alertvisible: false,
    Ischecked: false,
    disabledBtns: {
      //权限按钮
      inviteBtn: true,
      blockupBtn: true,
      startusingBtn: true,
      againIviteBtn: true,
      deleteBtn: true,
    },
    currentText: '',
  };
  componentDidMount() {
    const { disabledBtns } = this.state;
    this._getStauts();
    let result1 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'yaoQingAnNiu').length > 0;
    let result2 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'tingYongYongHuAnNiu')
        .length > 0;
    let result3 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'qiYongYongHuAnNiu').length >
      0;
    let result4 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'delYongHuAnNiu').length > 0;
    let result5 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'zaiCiYaoQingAnNiu').length >
      0;
    if (!result1) {
      //邀请
      disabledBtns.inviteBtn = false;
      this.setState({ disabledBtns });
    }
    if (!result2) {
      //禁用
      disabledBtns.blockupBtn = false;
      this.setState({ disabledBtns });
    }
    if (!result3) {
      //启用
      disabledBtns.startusingBtn = false;
      this.setState({ disabledBtns });
    }
    if (!result4) {
      //删除
      disabledBtns.deleteBtn = false;
      this.setState({ disabledBtns });
    }
    if (!result5) {
      //再次邀请
      disabledBtns.againIviteBtn = false;
      this.setState({ disabledBtns });
    }
  }

  _flatArray = (arr) => {
    let newArr = [];
    let arrId = [];
    if (arr.length > 0) {
      newArr = arr;
      newArr.flat();
    } else {
      newArr.push(arr);
    }
    newArr.forEach((item) => {
      arrId.push(item.userId);
    });
    return arrId;
  };

  async _getStauts() {
    //下拉框
    let res = await queryStatus();
    const { status } = this.state;
    if (res && res.statusCode == HttpCode.SUCCESS) {
      onCheckFeed();
      this.setState(
        {
          userStatusBodies: res.userStatusBodies,
          dropDownBoxes: res.dropDownBoxes,
          isStatus: res.dropDownBoxes?.[0]?.type === 'select' || status === 'status',
        },
        () => {
          this._getuserList();
        },
      );
    }
  }
  _getuserList = async () => {
    //用户列表
    this.setState({ tableLoading: true });
    const {
      allstatus,
      status,
      tableMessage,
      searchText,
      isSearchClick,
      dropDownBoxes,
    } = this.state;
    let paramValue = '';
    if (isSearchClick) {
      paramValue = allstatus == 5 ? '' : allstatus || searchText || '';
    } else {
      paramValue = allstatus == 5 ? '' : allstatus || '';
    }
    let res = await queryuserList({
      size: tableMessage.size,
      current: tableMessage.current,
      paramType: status || dropDownBoxes?.[0]?.code || 'name',
      paramValue,
    });
    if (res && res.statusCode == HttpCode.SUCCESS) {
      this.setState({
        userInfoBodyObj: res,
        isLoading: false,
        tableMessage: { ...this.state.tableMessage, total: res.total },
      });
    }
    this.setState({ tableLoading: false });
  };

  _getChangeStatus = async (type, ids) => {
    //单次修改和批量修改

    let res = await queryChangeStatus({
      operationType: JSON.stringify(type),
      userIds: this._flatArray(ids),
    });
    this.setState({ res });
    if (res && res.statusCode == HttpCode.SUCCESS) {
      this._getStauts();

      Message.config({ top: '50%' });
      Message.success(res.message);
    } else if (res && res.statusCode == '2601') {
      this.setState({ alertvisible: true });
    }
    this._getuserList();
  };

  _statusFn = (current) => {
    current !== 'status'
      ? this.setState({ isStatus: false, allstatus: '' })
      : this.setState({ isStatus: true });
    this.setState({ status: current, searchText: '' });
  };

  _allstatusFn(e) {
    this.setState({ allstatus: e });
  }
  _handelPage = (current, size) => {
    //改变页数
    this.setState(
      { tableMessage: { ...this.state.tableMessage, current, size }, checkBoxValue: [] },
      () => {
        this._getuserList();
      },
    );
  };

  async _search() {
    //查询
    if (this.state.isStatus) {
      await this.setState({ searchText: '' });
    }
    this.setState(
      { checkBoxValue: [], tableMessage: { total: 0, size: 10, current: 1 }, isSearchClick: true },
      () => {
        this._getuserList();
      },
    );
  }

  async _KeyDownFn(e) {
    //回车
    if (e.keyCode === 13) {
      this._search();
    }
  }
  _reset() {
    //重置
    this.setState(
      {
        tableMessage: { total: 0, size: 10, current: 1 },
        status: '',
        allstatus: '',
        isStatus: true,
        searchText: '',
        isSearchClick: false,
      },
      () => {
        this._getuserList();
        this._onCheckBox([]);
      },
    );
  }

  IscheckedTrues = () => {
    this.setState({ Ischecked: true });
  };

  IscheckedTrue = () => {
    //查看页面启用
    const { disabledBtns } = this.state;

    if (!disabledBtns.againIviteBtn) {
      Message.config({ top: '50%' });
      return Message.info('请联系管理员获取相关权限');
    }
    this.setState({ Ischecked: true });
  };
  IscheckedFalse = () => {
    //查看页面停用
    const { disabledBtns } = this.state;
    if (!disabledBtns.blockupBtn) {
      Message.config({ top: '50%' });
      return Message.info('请联系管理员获取相关权限');
    }
    this.setState({ Ischecked: false });
  };

  operationBtnFn = async (type, text) => {
    const { disabledBtns } = this.state;
    if (type !== 'look' && type !== 'redact') {
      if (
        !disabledBtns.inviteBtn ||
        !disabledBtns.blockupBtn ||
        !disabledBtns.startusingBtn ||
        !disabledBtns.deleteBtn ||
        !disabledBtns.againIviteBtn
      ) {
        Message.config({ top: '50%' });
        return Message.info('请联系管理员获取相关权限');
      }
    }

    if (type === 'invite' || type === 'delete' || type === 'againIvite') {
      //邀请+删除+再次邀请
      let obj = await alert.show('确定执行此操作？');

      if (obj.index === AlertResult.SUCCESS) {
        this._getChangeStatus(type === 'invite' ? 3 : type === 'delete' ? 2 : 3, text);
      }
    } else if (type === 'blockup' || type === 'startusing') {
      //停用+启用

      let obj = await alert.show('确定执行此操作？');
      if (obj.index === AlertResult.SUCCESS) {
        this._getChangeStatus(type === 'blockup' ? 0 : type === 'startusing' ? 1 : null, text);
        type === 'blockup' ? this.IscheckedFalse() : this.IscheckedTrue();
      }
    } else if (type === 'look' || type === 'redact') {
      //查看+编辑
      type === 'look'
        ? this.setState({ text, RedactAndLookDetailsVisible: true, type: 'look' })
        : type === 'redact'
        ? this.setState({ text, RedactAndLookDetailsVisible: true, type: 'redact' })
        : null;
    }
  };

  batchbtn = async (item) => {
    //批量操作
    const { checkBoxText } = this.state;
    if (!item.isjurisdiction) {
      Message.config({ top: '50%' });
      return Message.info('请联系管理员获取相关权限');
    }
    let obj = await alert.show('确定执行此操作？');

    if (obj.index === AlertResult.SUCCESS) {
      this._getChangeStatus(
        item.type == 'invite' ? 3 : item.type == 'start' ? 1 : item.type == 'out' ? 0 : 2,
        checkBoxText,
      );
      this._onCheckBox([]);
    }
  };

  _onCheckBox = (checkBoxValue, texts) => {
    //多选框
    this.setState({ checkBoxValue, checkBoxText: texts });
  };

  onOpenAddUser = () => {
    this.setState({ userDetailsVisible: true });
  };
  onCloseDetails = () => {
    this.setState(
      { RedactAndLookDetailsVisible: false, userDetailsVisible: false, alertvisible: false },
      () => {
        this._getStauts();
      },
    );
  };
  alertvisibleOk = () => {
    this.setState({ alertvisible: false });
  };
  render() {
    const {
      status,
      allstatus,
      isStatus,
      searchText,
      userStatusBodies,
      dropDownBoxes,
      userInfoBodyObj,
      text,
      type,
      size,
      isLoading,
      tableLoading,
      res,
      Ischecked,
    } = this.state;
    const columns = getColumns(this.operationBtnFn, this.state.disabledBtns);
    if (isLoading) {
      return (
        <div style={{ position: 'relative' }}>
          <Spin style={{ position: 'absolute', left: '50%', top: '100px' }} />
        </div>
      );
    }
    return (
      <div className={styles.wrop}>
        {/* 头部搜索 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Select
              value={
                status.length > 0 ? status : dropDownBoxes.length > 0 ? dropDownBoxes[0].name : ''
              }
              style={{
                width: '140px',
              }}
              onChange={this._statusFn}
            >
              {dropDownBoxes.map((item) => {
                return (
                  <Select.Option key={item.id} value={item.code}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>

            {isStatus ? (
              <Select
                value={
                  allstatus.length > 0
                    ? allstatus
                    : userStatusBodies[0].name + '  ' + userStatusBodies[0].count + '条'
                }
                style={{
                  width: '280px',
                  marginLeft: '16px',
                }}
                onChange={(e) => {
                  this._allstatusFn(e);
                }}
              >
                {userStatusBodies.map((item) => {
                  return (
                    <Select.Option key={item.id} value={item.code} style={styleOption}>
                      <span>{item.name}</span>&nbsp;<span>{item.count + '条'}</span>
                    </Select.Option>
                  );
                })}
              </Select>
            ) : (
              <Input
                type="text"
                placeholder="搜索"
                value={searchText}
                style={{ width: '280px', marginLeft: '16px' }}
                onChange={(e) => {
                  this.setState({ searchText: e.target.value });
                }}
                onKeyDown={(e) => {
                  this._KeyDownFn(e);
                }}
              />
            )}
          </div>
          <div className={styles.headerRight}>
            <Button
              type="primary"
              onClick={() => {
                this._search();
              }}
            >
              查询
            </Button>
            <Button
              onClick={() => {
                this._reset();
              }}
            >
              重置
            </Button>
          </div>
        </div>
        <Table
          onOpenAddUser={this.onOpenAddUser}
          userInfoBodyList={userInfoBodyObj}
          batchbtn={this.batchbtn}
          currentText={this.state.currentText}
          onCheckBox={this._onCheckBox}
          checkBoxValue={this.state.checkBoxValue}
          size={size}
          columns={columns}
          getuserList={this._getuserList}
          handelPage={this._handelPage}
          tableMessage={this.state.tableMessage}
          loading={tableLoading}
        />

        <Drawer
          placement="right"
          closable={false}
          onClose={this.onCloseDetails}
          getContainer={false}
          open={this.state.userDetailsVisible}
          width="90%"
          destroyOnClose={true}
        >
          {this.state.userDetailsVisible ? <AddUser onCloseDetails={this.onCloseDetails} /> : null}
        </Drawer>
        <Drawer
          placement="right"
          closable={false}
          getContainer={false}
          onClose={this.onCloseDetails}
          open={this.state.RedactAndLookDetailsVisible}
          width="90%"
          destroyOnClose={true}
        >
          {this.state.RedactAndLookDetailsVisible ? (
            <RedactAndLook
              onCloseDetails={this.onCloseDetails}
              text={text}
              type={type}
              operationBtnFn={this.operationBtnFn}
              IscheckedFalse={this.IscheckedFalse}
              IscheckedTrue={this.IscheckedTrue}
              Ischecked={Ischecked}
              IscheckedTrues={this.IscheckedTrues}
            />
          ) : null}
        </Drawer>
        <Modal
          closable={false}
          open={this.state.alertvisible}
          onOk={this.alertvisibleOk}
          footer={null}
          width={500}
          centered={true}
        >
          <AlretModal message={res} onCloseDetails={this.onCloseDetails} />
        </Modal>
      </div>
    );
  }
}

import React, { Component } from 'react';
import { Modal, Button, Checkbox, Empty, Tooltip, Spin } from 'antd';
import style from './index.less';
import SearchInput from '../SearchInput';
import Message from '#/components/Message';
import TRNotification from '#/utils/notification';
import { AlertResult } from '#/utils/contacts';
import { CloseOutlined } from '#/utils/antdIcons';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { HttpCode } from '#/utils/contacts';
import { relationUserList } from '@/services/roleManage';
import { getRelationSelectList } from '../../helper';
import VirtualList from '../VirtualList';

import phoneImg from '@/assets/img/roleManage/phone.png';
import emailImg from '@/assets/img/roleManage/email.png';
import people_icon from '@/assets/img/people_icon.png';

class RelationUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectUser: [],
      searchValue: '',
      userList: [],
      visible: true,
      isfilter: true,
      rawData: [], // 原始数据
    };
    this.arr = [];
  }
  componentDidMount() {
    this.getUserData();
    // this.inputSearch && this.inputSearch._onInit();
  }

  getUserData = async () => {
    const { roleIds, isUserIds } = this.props;
    let { selectUser } = this.state;
    this.setState({ loading: true });
    let res = await relationUserList(isUserIds ? { roleIds: [''] } : { roleIds });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (isUserIds) {
        selectUser = this._findUsers(roleIds, res?.relationUserBodyList || []);
      } else {
        selectUser = res.selectUserId
          ? getRelationSelectList(res.relationUserBodyList, res.selectUserId).filter((n) => !!n)
          : [];
      }
      const rawData = res.selectUserId
        ? getRelationSelectList(res.relationUserBodyList, res.selectUserId).filter((n) => !!n)
        : [];
      this.setState({
        loading: false,
        selectUser,
        userList: res.relationUserBodyList,
        rawData,
      });
    }
  };

  componentWillUnmount() {
    this.setState({ visible: false });
  }

  /* 根据userid回显 */
  _findUsers = (userIds, array) => {
    return array.reduce((t, v) => {
      if (userIds.includes(v.userId)) {
        return [...t, v];
      } else {
        return t;
      }
    }, []);
  };

  /* 选中用户 isCheckAll是否全选 isChecked选中状态*/
  _onSelectUser = (isCheckAll, item, isChecked) => {
    let { selectUser } = this.state;
    if (isCheckAll) {
      if (isChecked) {
        this.setState({ selectUser: this._onGetShowUserList(isCheckAll) });
      } else {
        this.setState({ selectUser: this._isCheckedClear() });
      }
      return;
    }

    if (isChecked) {
      selectUser.push(item);
    } else {
      selectUser = selectUser.filter((n) => n.userId !== item.userId);
    }
    this.setState({ selectUser });
  };
  _onChangeAll(isCheckAll, filterUser) {
    const { selectUser } = this.state;
    let array = [];
    if (!isCheckAll) {
      array = _.uniq([...selectUser, ...filterUser]);
    } else {
      array = selectUser.filter((n) => filterUser.filter((m) => m.userId == n.userId).length === 0);
    }
    this.setState({ selectUser: array });
  }
  /* 删除用户 isClearAll是否全部清空*/
  _onDeleteUser = (isClearAll, userId) => {
    let { selectUser } = this.state;
    if (isClearAll) {
      this.setState({ selectUser: [] });
      return;
    }
    selectUser = selectUser.filter((n) => n.userId !== userId);
    this.setState({
      selectUser,
    });
  };
  /* 设置多选框checked状态 */
  _setCheckboxChecked = (userId) => {
    return !!this.state.selectUser.filter((n) => n.userId === userId).length;
  };
  /* 搜索函数 */
  _onSearch = (value) => {
    this.setState({ searchValue: value });
  };

  /* 提交 */
  _onSubmit = () => {
    // 关联用户无权限
    let result =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'guanLianYongHuTiJiaoAnNiu')
        .length > 0;
    if (!result) {
      return Message.info('请联系管理员获取相关权限');
    }
    if (this.props.isObject) {
      this.props._onFn(AlertResult.SUCCESS, this.state.selectUser, this.state.rawData);
      return this.setState({ visible: false });
    }
    let selectUserId = this.state.selectUser.map((n) => n.userId);
    let rawData = this.state.rawData.map((n) => n.userId);
    this.props._onFn(AlertResult.SUCCESS, selectUserId, rawData);
    this.setState({ visible: false });
  };
  _onGetShowUserList = () => {
    const { searchValue } = this.state;

    /* if (isCheckAll) {
    *   this.arr = this.state.userList.filter(item => {
    *     return (
    *       (item.name + '').includes(searchValue) ||
    *       (item.mobile + '').includes(searchValue) ||
    *       (item.email + '').includes(searchValue)
    //     );
    *   });

    *   let arrs = this.arr.map(item => {
    *     return item.name;
    *   });
    *   let arrone = this.state.userList.filter(n => arrs.includes(n.name));

    *   //是否重复
    *   let selectArr = selectUser.map(res => {
    *     return res.name;
    *   });

    *   let crr = arrone.filter(res => {
    *     return !selectArr.includes(res.name);
    *   });

    *   if (this.arr.length !== crr.length) {
    *     //判断是否有值重复
    *     this.setState({ isfilter: false });
    *   } else {
    *     this.setState({ isfilter: true });
    *   }
    *   let boxArr = [crr, selectUser];

    *   return boxArr.flat();
    * } else {*/
    return this.state.userList.filter((item) => {
      return (
        (item.name + '').includes(searchValue) ||
        (item.mobile + '').includes(searchValue) ||
        (item.email + '').includes(searchValue)
      );
    });
    // }
  };

  //点击全选清除
  _isCheckedClear = () => {
    let selectLists = this.state.selectList;

    if (this.state.isfilter) {
      this.arr = [];
    } else {
      selectLists = [];
      this.arr = [];
    }
    let arr = [selectLists, this.arr];
    return arr.flat();
  };
  _onClose = () => {
    this.setState({
      visible: false,
    });
    this.props._onFn(AlertResult.CANCEL);
  };
  _onGetSelectUserIsAllShow = (selectUser, showList) => {
    let flag = true;
    selectUser.forEach((item) => {
      let showItem = showList.filter((n) => item.userId === n.userId);
      if (!showItem.length) {
        flag = false;
      }
    });
    return flag;
  };
  renderNode = (data, item, index, bool) => {
    return (
      <div className={style.msgBox} key={index}>
        {bool ? (
          <Checkbox
            checked={this._setCheckboxChecked(item.userId)}
            onChange={(e) => this._onSelectUser(false, item, e.target.checked)}
          >
            {item.name}
          </Checkbox>
        ) : (
          <div>
            <CloseOutlined
              className={style.rightClose}
              onClick={() => this._onDeleteUser(false, item.userId)}
            />
            &nbsp;&nbsp;
            {item.name}
          </div>
        )}
        <div className={style.msg}>
          <div className={style.phone}>
            <img src={phoneImg} style={{ marginRight: 5 }} alt="" className={style.phoneImg} />
            {item.mobile}
          </div>
          {item.email ? (
            <div className={style.email}>
              <img src={emailImg} style={{ marginRight: 5 }} alt="" className={style.emailImg} />
              <div className={style.emailText}>
                <Tooltip placement="topLeft" overlayClassName="overtoop" title={item.email}>
                  {item.email}
                </Tooltip>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  render() {
    const { selectUser, userList, loading } = this.state;
    let showList = this._onGetShowUserList();
    let filterUser = selectUser.filter(
      (n) => showList.filter((item) => item.userId === n.userId).length > 0,
    );
    let selectUserIsAllShow = this._onGetSelectUserIsAllShow(selectUser, showList);
    // let indeterminate = filterUser.length > 0 ? !(selectUser.length === showList.length) : false;
    let indeterminate = filterUser.length > 0 ? selectUserIsAllShow : false;

    let checked = filterUser.length > 0 && filterUser.length === showList.length;
    let okDisabled =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'guanLianYongHuTiJiaoAnNiu')
        .length > 0;
    return (
      <Modal
        centered
        closable={false}
        visible={this.state.visible}
        onCancel={this._onClose}
        width={780}
        maskClosable={false}
        className={`${style.roleRoleUserBox} modalWraps`}
        footer={[
          <Button key={'canle'} onClick={this._onClose}>
            取消
          </Button>,
          <Button
            key={'done'}
            onClick={this._onSubmit}
            type={!okDisabled ? '' : 'primary'}
            className={!okDisabled ? style.disableBtn : ''}
          >
            提交
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <div className={style.roleUserModal}>
            <div className={style.title}>
              <div className={style.titleTextBox}>
                <img src={people_icon} alt="" />
                关联用户
              </div>
              <CloseOutlined onClick={this._onClose} className={style.close} />
            </div>
            <div className={style.content}>
              <div className={style.left}>
                <div className={style.search}>
                  <SearchInput
                    userList={userList}
                    search={this._onSearch}
                    ref={(e) => (this.inputSearch = e)}
                  />
                </div>
                <Checkbox
                  indeterminate={indeterminate}
                  checked={checked}
                  onChange={() => this._onChangeAll(checked, showList)}
                >
                  全选
                </Checkbox>
                <div style={{ height: 239 }}>
                  {!showList.length ? (
                    <div className={style.noData}>
                      <Empty
                        imageStyle={{ height: 80 }}
                        style={{ color: 'rgba(0, 0, 0, 0.65)' }}
                        description={'暂无数据'}
                      />
                    </div>
                  ) : null}
                  {showList.length ? (
                    <VirtualList
                      data={showList}
                      count={showList.length}
                      size={8}
                      viewSize={5}
                      rowHeight={47.8}
                      renderNode={this.renderNode}
                      isleft={true}
                    />
                  ) : null}
                </div>
              </div>
              <div className={style.right}>
                <div className={style.rightHeader}>
                  <div>已选{selectUser.length}项</div>
                  <div className={style.clear} onClick={() => this._onDeleteUser(true)}>
                    清空
                  </div>
                </div>
                <div className={style.rightContent}>
                  {showList.length ? (
                    <VirtualList
                      data={selectUser}
                      count={selectUser.length}
                      size={8}
                      viewSize={5}
                      rowHeight={52.4}
                      renderNode={this.renderNode}
                      isleft={false}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}
RelationUser.propTypes = {
  roleIds: PropTypes.array,
  isObject: PropTypes.bool,
  buttonPermissions: PropTypes.array,
  _onFn: PropTypes.func,
  isUserIds: PropTypes.bool,
};

class RelationUserModal {
  __key__ = '';
  show = (roleIds, buttonPermissions, isObject = false, isUserIds = false) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      const that = this;
      this.__key__ = String(Date.now());
      let fn = (index, selectUserId, rawData) => {
        that.__key__ = '';
        resolve({ index, selectUserId, rawData });
      };
      TRNotification.add({
        key: this.__key__,
        content: (
          <RelationUser
            isObject={isObject}
            roleIds={roleIds}
            buttonPermissions={buttonPermissions}
            _onFn={fn}
            isUserIds={isUserIds}
          />
        ),
        duration: null,
      });
    });
  };
  dismiss = () => {
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
}

const relationUser = new RelationUserModal();
export default relationUser;

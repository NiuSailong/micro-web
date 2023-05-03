import React, { Component } from 'react';
import TRNotification from '#/utils/notification';
import { Checkbox, Empty, Modal, Spin, Input, Tooltip, Button } from 'antd';
import style from './index.less';
import { relationUserList } from '@/services/roleManage';
import { setPositionList } from '@/services/staffing';
import people_icon from '@/assets/img/people_icon.png';
import { CloseOutlined } from '#/utils/antdIcons';
import { HttpCode } from '#/utils/contacts';
import Message from '#/components/Message';
import alert from '#/components/Alert';
import phoneImg from '@/assets/img/roleManage/phone.png';
import emailImg from '@/assets/img/roleManage/email.png';
import VList from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import PLoading from '#/components/PLoading';
import TRStaff from '../../staff';

class UserComponent extends Component {
  constructor(props) {
    super(props);
    let checkIds = (props.checkUsers || []).map((m) => m.userId);
    this.state = {
      selectUser: [...checkIds],
      originUserList: [...checkIds],
      searchValue: '',
      userList: [],
      visible: true,
    };
    this.userObj = {};
    this.arr = [];
  }
  componentDidMount() {
    this.getUserData();
  }
  /* 搜索函数 */
  _onSearch = (value) => {
    this.setState({ searchValue: value });
  };
  _onClose() {
    this.props.onClose && this.props.onClose();
  }
  async onDone() {
    const { originUserList, selectUser } = this.state;
    const { params = {} } = this.props;
    const uaids = selectUser.filter((n) => !originUserList.includes(n));
    const dids = originUserList.filter((n) => !selectUser.includes(n));
    if (uaids.length === 0 && dids.length === 0) return Message.info('请选择您要操作的项');
    let res = await alert.show(`本次操作新增${uaids.length}人,删除${dids.length}人,是否继续?`);
    if (res?.index === 1) {
      PLoading.show('请求中...');
      res = await setPositionList({ ...params, userIds: uaids, delIds: dids });
      if (res?.statusCode === HttpCode.SUCCESS) {
        PLoading.dismiss();
        this.props.onClose && this.props.onClose({ index: 1 });
      } else {
        PLoading.dismiss();
        Message.error(res?.message || '保存失败');
      }
    }
  }
  onCheckAllAction(isAll, ulist) {
    const { selectUser } = this.state;
    let arr = [...selectUser];
    let uls = ulist.map((m) => m.userId);
    if (isAll) {
      arr = arr.filter((m) => !uls.includes(m));
    } else {
      arr = _.uniq([...arr, ...uls]);
    }
    this.setState({
      selectUser: arr,
    });
  }
  getUserData = async () => {
    const { roleIds } = this.props;
    this.setState({ loading: true });
    if (TRStaff.userList.length > 0) {
      (TRStaff.userList || []).forEach((m) => {
        this.userObj[m.userId] = m;
      });
      this.setState({ loading: false, userList: TRStaff.userList });
    } else {
      let res = await relationUserList({ roleIds });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        (res?.relationUserBodyList || []).forEach((m) => {
          this.userObj[m.userId] = m;
        });
        TRStaff.userList = [...(res?.relationUserBodyList || [])];
        this.setState({ loading: false, userList: res?.relationUserBodyList || [] });
      } else {
        Message.error(res?.message || '获取用户列表失败');
        this.setState({ loading: false });
      }
    }
  };
  _onGetShowUserList = () => {
    const { searchValue } = this.state;
    return this.state.userList.filter((item) => {
      return (
        (item.name + '').includes(searchValue) ||
        (item.mobile + '').includes(searchValue) ||
        (item.email + '').includes(searchValue)
      );
    });
  };
  onClickItem(isCheck, userId) {
    const { selectUser } = this.state;
    let arr = [...selectUser];
    if (isCheck) {
      arr = arr.filter((m) => m !== userId);
    } else {
      arr.push(userId);
    }
    this.setState({
      selectUser: arr,
    });
  }
  onItemRender({ m, index, sty = {}, isCheck, isLook = false }) {
    return (
      <div
        key={`${isLook ? 'd' : 'r'}${m.userId}${index}`}
        style={sty}
        className={style.list_content_cell}
      >
        {isLook ? (
          <div className={style.rightrow}>
            <CloseOutlined
              className={style.rightClose}
              onClick={() => {
                this.onClickItem(true, m.userId);
              }}
            />
            <div>{m.name}</div>
          </div>
        ) : (
          <Checkbox
            checked={isCheck}
            onClick={() => {
              this.onClickItem(isCheck, m.userId);
            }}
          >
            {m.name}
          </Checkbox>
        )}
        <div className={style.list_content_info}>
          <div className={style.phone}>
            <img src={phoneImg} style={{ marginRight: 5 }} alt="" />
            {m.mobile}
          </div>
          {m.email ? (
            <div className={style.email}>
              <img src={emailImg} style={{ marginRight: 5 }} alt="" />
              <div className={style.emailText}>
                <Tooltip placement="topLeft" overlayClassName="overtoop" title={m.email}>
                  {m.email}
                </Tooltip>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  onRenderList(list) {
    const { selectUser } = this.state;
    return (
      <div className={style.list_content}>
        <AutoSizer>
          {({ height, width }) => (
            <VList
              height={height}
              rowCount={list.length}
              rowHeight={54}
              rowRenderer={(e) => {
                const m = list[e.index];
                const isCheck = selectUser.includes(m.userId);
                return this.onItemRender({ m: m, index: e.index, sty: e.style, isCheck: isCheck });
              }}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
  render() {
    const { loading, selectUser } = this.state;
    let showList = this._onGetShowUserList();
    let ck = selectUser.filter((n) => showList.filter((m) => m.userId === n).length > 0);
    const isIndeterminate = showList.length > 0 && ck.length > 0 && ck.length !== showList.length;
    const isAllCheck = showList.length > 0 && ck.length === showList.length;
    return (
      <Modal
        centered
        closable={false}
        open={this.state.visible}
        onCancel={this._onClose.bind(this)}
        width={700}
        footer={null}
        maskClosable={false}
      >
        <Spin spinning={loading}>
          <div className={style.roleUserModal}>
            <div className={style.title}>
              <div className={style.titleTextBox}>
                <img src={people_icon} alt="" />
                关联用户
              </div>
              <CloseOutlined onClick={this._onClose.bind(this)} className={style.close} />
            </div>
            <div className={style.content}>
              <div className={style.left}>
                <div className={style.search}>
                  <Input.Search
                    onSearch={(e) => {
                      this.setState({ searchValue: e });
                    }}
                  />
                </div>
                <Checkbox
                  checked={isAllCheck}
                  onClick={() => {
                    this.onCheckAllAction(isAllCheck, showList);
                  }}
                  indeterminate={isIndeterminate}
                >
                  全选
                </Checkbox>
                {!showList.length ? (
                  <div className={style.noData}>
                    <Empty
                      imageStyle={{ height: 80 }}
                      style={{ color: 'rgba(0, 0, 0, 0.65)' }}
                      description={'暂无数据'}
                    />
                  </div>
                ) : (
                  this.onRenderList(showList)
                )}
              </div>
              <div className={style.right}>
                <div className={style.colrs}>
                  <div>{`已选${selectUser.length}项`}</div>
                  <div
                    onClick={() => {
                      this.setState({ selectUser: [] });
                    }}
                    className={style.clear}
                    style={{ cursor: 'pointer', color: '#ACB1C1', fontSize: '12px' }}
                  >
                    清空
                  </div>
                </div>
                {this.state.userList.length > 0 ? (
                  <div className={style.rightcontent}>
                    <AutoSizer>
                      {({ height, width }) => (
                        <VList
                          height={height}
                          rowCount={selectUser.length}
                          rowHeight={54}
                          rowRenderer={(e) => {
                            const m = this.userObj[selectUser[e.index]] || {};
                            const isCheck = selectUser.includes(m.userId);
                            return this.onItemRender({
                              m: m,
                              index: e.index,
                              sty: e.style,
                              isCheck: isCheck,
                              isLook: true,
                            });
                          }}
                          width={width}
                        />
                      )}
                    </AutoSizer>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className={style.footer}>
            <Button
              onClick={() => {
                this._onClose();
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={this.onDone.bind(this)}>
              确定
            </Button>
          </div>
        </Spin>
      </Modal>
    );
  }
}

class UserModal {
  __key__ = '';
  show = (params) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <UserComponent
            {...params}
            onClose={(res) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(res || {});
            }}
          />
        ),
        dismiss: this.dismiss,
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

const relationUser = new UserModal();
export default relationUser;

import React, { Component } from 'react';
import { Button, Spin, Dropdown, Menu, Drawer } from 'antd';
import {
  queryRoleList,
  getRelationAppList,
  batchDeleteRole,
  copyRole,
  relationUser,
} from '@/services/roleManage';
import style from './index.less';
import RoleTable from './components/RoleTable';
import PanelTitle from '#/components/PanelTitle';
import Search from './components/Search';
import CreateRole from './RoleForm';
import { connect } from 'dva';
import { HttpCode, AlertResult } from '#/utils/contacts';
import alert from '#/components/Alert';
import { getColumns, roleModalType as RoleModalType } from './helper';
import Message from '#/components/Message';
import titleEditAlert from '@/components/TitleEditAlert';
import tAlert from '#/components/Alert';
import ploading from '#/components/PLoading';
import RelationUserModal from './components/RelationUser'; //管理用户
import scrollTo from 'antd/lib/_util/scrollTo';
import PropTypes from 'prop-types';
import { onCheckFeed } from '#/utils/interactive';

const batchType = { relation: 1, delete: 2 };

@connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))
class RoleManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableLoading: false,
      initLoading: true,
      searchData: { selectTypeList: [], relationAppBodyList: [] },
      tableList: [],
      tableMessage: { total: 0, size: 10, current: 1, sort: 'desc' },
      appCode: '',
      keyWord: '',
      checkBoxValue: [],
      createRoleVisible: false,
      look: false,
      relationUserVisible: false,
      /* 关联用户数据 */
      relationUserBodyList: [],
      relationUserSelectList: [],
      roleIds: [],
      roleModalType: RoleModalType.new,
      roleId: '',
      type: '',
      first: true,
    };
  }

  _onBatchTab = (item) => {
    if (item.key === batchType.delete + '') {
      this._onDelete();
    } else {
      this._onRelationUser(true);
    }
  };
  componentDidMount = async () => {
    await this._getRelationAppList();
    this._onSearch({ appCode: '', keyWord: '' });
  };
  componentWillUnmount() {
    titleEditAlert.dismiss();
    RelationUserModal.dismiss();
  }
  /* 获取头部搜索下拉框内容 */
  _getRelationAppList = async () => {
    let res = await getRelationAppList();
    if (res && res.statusCode === HttpCode.SUCCESS) {
      this.setState({
        searchData: {
          selectTypeList: res.selectTypeList,
          relationAppBodyList: res.relationAppBodyList,
        },
      });
    }
  };
  /* 点击搜索 */
  _onSearch = (params) => {
    this.setState(
      {
        ...params,
        tableMessage: { ...this.state.tableMessage, current: 1 },
        checkBoxValue: [],
      },
      () => {
        this._getTableList();
      },
    );
  };
  /* 获取表格数据 */
  _getTableList = async () => {
    this.setState({ tableLoading: true });
    const { appCode, keyWord, tableMessage, type } = this.state;
    let res = await queryRoleList({
      appCode,
      keyWord,
      size: tableMessage.size,
      current: tableMessage.current,
      sort: tableMessage.sort,
      type,
    });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      onCheckFeed();
      scrollTo(0);
      this.setState({
        tableList: res.dataResults || [],
        tableMessage: { ...this.state.tableMessage, total: res.total },
      });
    }
    if (this.state.first) {
      this.setState({ initLoading: false, first: false });
    }
    this.setState({ tableLoading: false });
  };
  /* 页数改变 */
  _handelPage = (current, size, sort) => {
    this.setState(
      { checkBoxValue: [], tableMessage: { ...this.state.tableMessage, current, size, sort } },
      () => {
        this._getTableList();
      },
    );
  };
  /* 多选框改变 */
  _onCheckBox = (arr) => {
    this.setState({ checkBoxValue: arr });
  };
  /* 点击重置 */
  _onReset = async () => {
    this._onCheckBox([]);
    this._onSearch({ appCode: '', keyWord: '' });
  };
  /* 点击删除接口 */
  _onDelete = async (roleId) => {
    // 删除无权限
    let result =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'piLiangShanChuJiaoSeAnNiu')
        .length > 0;
    if (!result) {
      return Message.info('请联系管理员获取相关权限');
    }
    let obj = await alert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      this.setState({ tableLoading: true });
      const roleIds = roleId ? [roleId] : this.state.checkBoxValue;
      let res = await batchDeleteRole({ roleIds });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        this._getTableList();
        Message.success(res?.message);
      }
      this.setState({ tableLoading: false, checkBoxValue: [] });
    }
  };

  /* 点击复制接口 */
  _onCopy = async (item) => {
    // 复制无权限
    let result =
      this.props.buttonPermissions.filter((_item) => _item.menuCode === 'jueSeFuZhiAnNiu').length >
      0;
    if (!result) {
      return Message.info('请联系管理员获取相关权限');
    }

    titleEditAlert.show(
      `将“${item.roleName}”所有角色信息复制给`,
      item.roleName + '1',
      async (obj) => {
        if (obj.index === AlertResult.SUCCESS) {
          ploading.show('loading...');
          let res = await copyRole({ newRoleName: obj.inputValue, oriRoleId: item.roleId });
          ploading.dismiss();
          if (res && res.statusCode === HttpCode.SUCCESS) {
            Message.success('复制成功！');
            titleEditAlert.dismiss();
            this._getTableList();
          } else {
            Message.error(res?.message || '接口报错');
          }
        } else {
          titleEditAlert.dismiss();
        }
      },
    );
  };
  /* 关闭 */
  _onCloseBtn = async (flag) => {
    if (!flag) {
      if (this.state.roleModalType !== RoleModalType.look) {
        let obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
        if (obj.index === 1) {
          this.setState({ createRoleVisible: false, relationUserVisible: false });
        }
        return;
      }
    }
    this._getTableList();
    this.setState({ createRoleVisible: false, relationUserVisible: false });
  };
  /* 查看 */
  _onLook = async (roleType, roleId) => {
    this.setState({ roleModalType: roleType, roleId, createRoleVisible: true });
  };
  /* 关联用户弹框展示数据 */
  _onRelationUser = async (isBatch, item) => {
    let roleIds = [];
    if (isBatch) {
      roleIds = this.state.checkBoxValue;
    } else {
      roleIds = [item.roleId];
    }
    this.setState({ roleIds });
    let obj = await RelationUserModal.show(roleIds, this.props.buttonPermissions);
    if (obj.index === AlertResult.SUCCESS) {
      this._onSubmitRelationUser(obj.selectUserId, obj.rawData);
    }
  };
  /* 关联用户提交 */
  _onSubmitRelationUser = async (selectUserList, rawData) => {
    const { deleteArr, addArr } = this.handleArr(rawData, selectUserList);
    this.setState({ tableLoading: true, relationUserVisible: false });
    const params = {
      flag: 'role',
      selectUserList: addArr,
      deleteUserList: deleteArr,
      selectRoleList: this.state.roleIds,
    };
    let res = await relationUser(params);
    this.setState({ tableLoading: false });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      this._getTableList();
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
    const addArr = [];
    arr2.map((item) => {
      if (someArr.indexOf(item) === -1) {
        addArr.push(item);
      }
    });
    return { deleteArr, addArr };
  };
  /* 新建 */
  _onCreateRole = () => {
    this.setState({
      roleId: '',
      createRoleVisible: true,
      roleModalType: RoleModalType.new,
    });
  };
  render() {
    const { buttonPermissions } = this.props;
    const {
      roleId,
      roleModalType,
      searchData,
      tableLoading,
      tableList,
      tableMessage,
      checkBoxValue,
    } = this.state;
    if (this.state.initLoading) return <Spin style={{ marginTop: 40 }}> </Spin>;
    let copyPower =
      buttonPermissions.filter((item) => item.menuCode === 'jueSeFuZhiAnNiu').length > 0;
    let deletePower =
      buttonPermissions.filter((item) => item.menuCode === 'piLiangShanChuJiaoSeAnNiu').length > 0;

    const columns = getColumns(
      this._onDelete,
      this._onCopy,
      this._onLook,
      this._onRelationUser,
      copyPower,
      deletePower,
    );
    return (
      <div className={style.roleBox}>
        <div className={style.roleBoxContent}>
          <Search
            data={searchData}
            _onSearch={this._onSearch}
            _onReset={this._onReset}
            buttonPermissions={buttonPermissions}
          />
          <div className={style.tableHeader}>
            <PanelTitle title="角色列表" />
            <div className={style.tableHeaderRight}>
              {checkBoxValue.length > 0 ? (
                <div className={style.message}>
                  已选中<span>{checkBoxValue.length}</span>项
                </div>
              ) : null}
              {checkBoxValue.length > 0 ? (
                <Dropdown
                  overlay={
                    <Menu onClick={this._onBatchTab}>
                      <Menu.Item key={batchType.relation}>
                        <span style={{ textAlign: 'center' }}>关联用户</span>
                      </Menu.Item>
                      <Menu.Item
                        key={batchType.delete}
                        style={{
                          color: deletePower ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        <span style={{ textAlign: 'center' }}>删除</span>
                      </Menu.Item>
                    </Menu>
                  }
                  placement="bottomCenter"
                >
                  <Button>批量操作</Button>
                </Dropdown>
              ) : null}
              <Button type="primary" onClick={this._onCreateRole}>
                新建
              </Button>
            </div>
          </div>

          {/* 表格 */}
          <RoleTable
            tableMessage={tableMessage}
            loading={tableLoading}
            tableList={tableList}
            _handelPage={this._handelPage}
            checkBoxValue={this.state.checkBoxValue}
            _onCheckBox={this._onCheckBox}
            _getTableList={this._getTableList}
            columns={columns}
          />
        </div>

        {/* 新建, 编辑， 查看 */}
        <Drawer
          placement="right"
          visible={this.state.createRoleVisible}
          width="90%"
          getContainer={false}
          className={'over_hidden_draw'}
          closable={false}
          destroyOnClose={true}
          maskClosable={false}
        >
          {this.state.createRoleVisible ? (
            <CreateRole
              roleId={'' + (roleId || '')}
              type={roleModalType}
              _onCloseBtn={this._onCloseBtn}
              _getTableList={this._getTableList}
            />
          ) : null}
        </Drawer>
      </div>
    );
  }
}
RoleManage.propTypes = {
  buttonPermissions: PropTypes.array,
};
export default RoleManage;

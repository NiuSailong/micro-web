import React from 'react';
import TBasePage from '#/base/TBasePage';
import { Form, Input, Button, Breadcrumb, Empty, Spin, Select, Row, Switch } from 'antd';
import styles from './index.less';
import { connect } from 'dva';
import { CloseOutlined } from '#/utils/antdIcons';
import TabCompont, { tabsList } from './TabCompont';
import {
  queryRoleMaxMenuList,
  roleDataPowerMenus,
  roleDataPowerList,
  submitRoleInfo,
  isSuperAdmin,
  getcompanys,
  submitBaseInfo,
} from '@/services/roleManage';
import PanelTitle from '#/components/PanelTitle';
import { roleModalType, getNewMenuData } from '../helper';
import { HttpCode } from '#/utils/contacts';
import talert from '#/components/Alert';
import Message from '#/components/Message';
import { TAB_ENUM } from './helper';
import RoleTable from './RoleTable';
import roleAlert, { handleNodes } from './RoleTable/roleDialog';
import roleUpdate from './WindowIntegration';

import update from '@/assets/img/update.png';
const { Option } = Select;
@connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))
class RoleForm extends TBasePage {
  formRef = React.createRef();
  treeCol = 1;
  constructor(props) {
    super(props);
    this.state.roleType = props.type || roleModalType.look;
    this.state.roleId = props.roleId || '';
    // this.state.roleType = roleModalType.edit;
    // this.state.roleId = '644';
    this.state.menuObj = {}; //菜单数据
    this.state.checkMenuList = []; //选中菜单数据
    this.state.checkDataList = []; //选中数据菜单
    this.state.menuList = [];
    this.state.treeCheckList = []; //树形选中结构
    this.state.spinLoading = true; //全局请求标识
    this.state.dataLoading = false; //数据请求标识
    this.state.tabActiveCode = TAB_ENUM.TAB_ENUM_MENU; // 选中的菜单
    this._MnueData = {}; //菜单请求数据
    this.state.createlessee = '否';
    this.state.checked = false;
    this.state.companys = [];
    this.state.company = '';
    this.state.roletypestatus = false;
    this.state.selectcompany = [];
  }
  componentDidMount() {
    this.onFetchData(true);
    this.isroot();
    this.getCompanys();
    if (document.getElementById('root-master')) {
      document.getElementById('root-master').style.overflow = 'hidden';
    }
  }
  componentWillUnmount() {
    roleAlert.dismiss();
    roleUpdate.dismiss();
    if (document.getElementById('root-master')) {
      document.getElementById('root-master').removeAttribute('style');
    }
  }
  onFetchData = async (isMessage = false) => {
    const { roleType, roleId, menuObj } = this.state;
    let params = {},
      treeCheckList = [];
    if (roleId?.length > 0) {
      params.roleId = roleId;
    }
    if (roleType !== roleModalType.new) {
      this.setState({ spinLoading: true });
    }
    let res = await queryRoleMaxMenuList(params); ///////////////////
    if (res?.statusCode === HttpCode.SUCCESS) {
      const { maxMenuBody = {} } = res;
      treeCheckList = [0, 0, 0];
      if (roleType !== roleModalType.new) {
        this.formRef.current?.setFieldsValue({
          roleName: maxMenuBody?.roleName || '',
          remark: maxMenuBody?.description || '',
        });
      }
      this.setState({
        spinLoading: false,
        menuObj: { ...menuObj, [TAB_ENUM.TAB_ENUM_MENU]: handleNodes(maxMenuBody?.appNodes || []) },
        checkMenuList: (maxMenuBody?.selectMenuBodyList || []).map((n) => {
          return { ...n, menuId: String(n.menuId || '0') };
        }),
        treeCheckList,
        roletypestatus: res?.maxMenuBody?.roleType === 'saasAdmin' ? true : false,
        createlessee: res?.maxMenuBody?.roleType === 'saasAdmin' ? '是' : '否',
        selectcompany: res.companyBodyList || [],
        company: res?.companyBodyList?.[0]?.companyNum || '',
      });
    } else {
      if (isMessage) {
        talert.show(res?.message || '获取菜单数据失败');
      }
      this.setState({
        spinLoading: false,
      });
    }
  };
  roleUpdate = async () => {
    roleUpdate.show({
      title: '角色菜单同步',
      width: 408,
      refname: 'RoleUpdate',
      currentRoleId: this.props.roleId,
    });
  };

  /*确认是否是超级管理用户*/
  isroot = async () => {
    let params = {
      loginToken: localStorage.token,
    };
    let res = await isSuperAdmin(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.setState({
        checked: res.data,
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
  onSubmit = async () => {
    const { spinLoading, roleId, createlessee, company, checked, roleType } = this.state;
    let params = await this.formRef.current.validateFields();
    /* if (!company) {
      Message.error('请选择公司');
      return;
    } */
    if (params.errorFields) return;
    if (spinLoading) return;
    this.setState({ spinLoading: true });
    let obj = {};
    if (roleId.length > 0) {
      obj.roleId = Number(roleId);
    }
    const requestUrl =
      roleType === roleModalType.new
        ? !checked
          ? submitRoleInfo
          : roleId
          ? submitRoleInfo
          : submitBaseInfo
        : submitRoleInfo;
    const res = await requestUrl({
      ...this._MnueData,
      ...params,
      ...obj,
      companyNum: company,
      tenantAdministrator: createlessee === '是' ? true : false,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      if (checked && !roleId && roleType === roleModalType.new) {
        this.setState({ roleId: res.message || '' }, () => {
          Message.success('添加成功');
          this.onFetchData();
        });
        return;
      }
      this.props && this.props._onCloseBtn(true);
      Message.success('添加成功');
    } else {
      talert.show(res?.message || '提交失败');
      this.setState({ spinLoading: false });
    }
  };
  onHandleDataList = async () => {
    const { menuObj, roleId, dataLoading, createlessee, company } = this.state;
    if (dataLoading) return;
    this.setState({ dataLoading: true });
    let res = {};
    let cRoleId = roleId;
    if (Object.keys(this._MnueData).length > 0) {
      const fromData = this.formRef.current.getFieldValue();
      let obj = {};
      if (roleId.length > 0) {
        obj.roleId = Number(roleId);
      }
      res = await submitRoleInfo({
        ...this._MnueData,
        ...fromData,
        ...obj,
        companyNum: company,
        tenantAdministrator: createlessee === '是' ? true : false,
      });
      if (res?.statusCode === HttpCode.SUCCESS) {
        cRoleId = res.message;
        this.setState({ roleId: res.message });
        this._MnueData = {};
      } else {
        talert.show(res?.message || '菜单权限提交失败');
        return this.setState({ dataLoading: false });
      }
    }
    res = await roleDataPowerList(cRoleId);
    if (res?.statusCode === HttpCode.SUCCESS) {
      const mList = handleNodes(res.roleAppMenuList || []);
      const mItem = mList[0]?.children?.[0]?.children?.[0];
      if (mItem) {
        res = await roleDataPowerMenus({
          source: mItem.source,
          tableName: mItem.tableName,
          menuCode: mItem.menuCode,
          roleId: cRoleId,
        });
        if (res?.statusCode === HttpCode.SUCCESS) {
          this.setState({
            menuObj: { ...menuObj, [TAB_ENUM.TAB_ENUM_DATA]: mList },
            checkDataList: res.source,
            tabActiveCode: TAB_ENUM.TAB_ENUM_DATA,
            dataLoading: false,
            treeCheckList: [0, 0, 0, 0],
          });
        } else {
          talert.show(res?.message || '获取数据权限失败');
          this.setState({ dataLoading: false });
        }
      } else {
        this.setState({
          menuObj: { ...menuObj, [TAB_ENUM.TAB_ENUM_DATA]: mList },
          checkDataList: [],
          tabActiveCode: TAB_ENUM.TAB_ENUM_DATA,
          dataLoading: false,
          treeCheckList: [0, 0, 0, 0],
        });
      }
    } else {
      talert.show(res?.message || '获取数据权限失败');
      this.setState({ dataLoading: false });
    }
  };
  onChangeDataMenus = async (checkArr) => {
    const { roleId, menuObj, dataLoading, tabActiveCode } = this.state;
    if (dataLoading) return;
    this.setState({ dataLoading: true });
    try {
      const mList = menuObj[tabActiveCode] || [];
      const mItem = mList[checkArr[0]]?.children?.[checkArr[1]]?.children?.[checkArr[2]];
      if (mItem) {
        const res = await roleDataPowerMenus({
          roleId: roleId,
          source: mItem.source,
          tableName: mItem.tableName,
          menuCode: mItem.menuCode,
        });
        if (res?.statusCode === HttpCode.SUCCESS) {
          this.setState({
            checkDataList: res.source,
            dataLoading: false,
            treeCheckList: checkArr,
          });
        } else {
          talert.show(res?.message || '获取数据权限失败');
          this.setState({ dataLoading: false });
        }
      }
    } catch (e) {
      talert.show('获取数据权限失败,切换失败');
      this.setState({ dataLoading: false });
    }
  };
  tabChange = (type, slide = {}) => {
    const { checkMenuList = [] } = this.state;
    if (type === 'tab') {
      if (this.state.tabActiveCode !== slide?.code) {
        if (slide.code === TAB_ENUM.TAB_ENUM_DATA && checkMenuList.length !== 0) {
          const fromData = this.formRef.current.getFieldValue();
          if (Object.keys(this._MnueData).length > 0 && (fromData.roleName?.length || 0) === 0)
            return Message.warning('请填写角色名称');
          this.onHandleDataList();
        } else {
          this.setState({
            tabActiveCode: slide?.code || tabsList[0]?.code,
            treeCheckList: slide?.code === TAB_ENUM.TAB_ENUM_MENU ? [0, 0, 0] : [0, 0, 0, 0],
          });
        }
      }
    } else if (type === 'bianji') {
      this.onRelation();
    }
  };
  onTableColChange = (sliderIndex, value) => {
    const { treeCheckList, tabActiveCode } = this.state;
    const treeList = treeCheckList.map((n, index) => {
      if (index === sliderIndex) {
        return value;
      }
      if (index > sliderIndex) {
        return 0;
      }
      return n;
    });
    if (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU) {
      this.setState({ treeCheckList: treeList });
    } else {
      this.onChangeDataMenus(treeList);
    }
  };
  onRelation = async () => {
    const { tabActiveCode, menuObj, checkMenuList, roleId } = this.state;
    const fromData = this.formRef.current.getFieldValue();
    if (tabActiveCode === TAB_ENUM.TAB_ENUM_DATA) {
      if (checkMenuList.length === 0) return Message.warning('请先配置菜单权限');
    }
    let res = await roleAlert.show({
      roleId,
      ...fromData,
      tabActiveCode,
      menuObj,
      checkMenuList,
    });
    if (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU) {
      if (res.index === 1) {
        const { menuData = {} } = res;
        this._MnueData = menuData.requestData || {};
        this.setState({
          checkMenuList: menuData.checkMenuList || [],
        });
      }
    } else if (tabActiveCode === TAB_ENUM.TAB_ENUM_DATA) {
      if (res.index === 1) {
        this.onChangeDataMenus([0, 0, 0, 0]);
      }
    }
  };
  selected = (val) => {
    if (val) {
      this.setState({
        createlessee: '是',
        roletypestatus: true,
      });
    } else {
      this.setState({
        createlessee: '否',
        roletypestatus: false,
      });
    }
  };
  onselect = (val) => {
    this.setState({
      company: val,
    });
  };
  _renderTable() {
    const {
      treeCheckList = [],
      menuObj = {},
      tabActiveCode,
      checkMenuList = [],
      checkDataList = [],
      dataLoading,
    } = this.state;
    const menuList = getNewMenuData(menuObj[tabActiveCode] || []);
    if (
      (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU && checkMenuList.length === 0) ||
      menuList.length === 0
    ) {
      return (
        <div
          className={`${styles.table} ${styles.flex_center}`}
          style={{ justifyContent: 'center' }}
        >
          <Empty
            description={checkMenuList.length === 0 ? '暂未关联相关权限' : '暂无菜单'}
            style={{ color: 'rgba(0, 0, 0, 0.65)' }}
          >
            {tabActiveCode === TAB_ENUM.TAB_ENUM_MENU ? (
              <Button
                onClick={() => {
                  this.onRelation();
                }}
                style={{ width: 80 }}
              >
                关联
              </Button>
            ) : null}
          </Empty>
        </div>
      );
    }
    return (
      <RoleTable
        isRead
        checkDataList={checkDataList}
        dataLoading={dataLoading}
        menuList={menuList}
        onRelation={this.onRelation.bind(this)}
        tabActiveCode={tabActiveCode}
        checkMenuList={checkMenuList}
        treeCheckList={treeCheckList}
        onTableColChange={this.onTableColChange.bind(this)}
      />
    );
  }

  _renderContent = () => {
    const { roleType, tabActiveCode } = this.state;
    return (
      <div className={styles.container_tabs}>
        <TabCompont
          type={roleType}
          onChange={this.tabChange.bind(this)}
          tabActiveCode={tabActiveCode}
        />
        {this._renderTable()}
      </div>
    );
  };

  render() {
    const {
      spinLoading,
      roleType,
      roleId,
      createlessee,
      checked,
      companys,
      roletypestatus,
      selectcompany,
    } = this.state;
    const isRead = roleType === roleModalType.look;
    let selectitem = selectcompany?.[0]?.companyNum;
    return (
      <Spin spinning={spinLoading}>
        <div className={styles.container}>
          <div className={styles.container_header}>
            <Breadcrumb>
              <Breadcrumb.Item>后台管理</Breadcrumb.Item>
              <Breadcrumb.Item>角色管理</Breadcrumb.Item>
              <Breadcrumb.Item>角色信息</Breadcrumb.Item>
            </Breadcrumb>
            <CloseOutlined
              onClick={() => this.props._onCloseBtn(false)}
              className={styles.container_header_close}
            />
          </div>
          <div className={styles.container_content}>
            <div className={styles.container_content_header}>
              <PanelTitle title="角色信息" />
              {roleId?.length > 0 ? (
                <div className={styles.container_content_header_role} onClick={this.roleUpdate}>
                  <img src={update} />
                  <span>角色菜单同步</span>
                </div>
              ) : null}
            </div>
            <Form ref={this.formRef} labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[{ required: true, message: '角色名称不能为空' }]}
              >
                {isRead ? (
                  <div className={styles.container_content_text}>
                    {this.formRef.current?.getFieldValue('roleName') || '-'}
                  </div>
                ) : (
                  <Input maxLength={30} placeholder={'请输入角色名称'} />
                )}
              </Form.Item>
              <Form.Item name="remark" label="角色描述">
                {isRead ? (
                  <div className={styles.container_content_text}>
                    {this.formRef.current?.getFieldValue('remark') || '-'}
                  </div>
                ) : (
                  <Input.TextArea maxlength="50" rows={3} placeholder={'请输入角色描述'} />
                )}
              </Form.Item>
              {checked && this.props.type == '3' ? (
                <Form.Item label="选择公司">
                  <Row>
                    {selectitem ? (
                      <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="请选择公司"
                        optionFilterProp="label"
                        onChange={this.onselect}
                        defaultValue={[selectitem]}
                        filterOption={(input, option) =>
                          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {companys.map((item) => {
                          return (
                            <Option value={item.companyNum} key={item.id} label={item.companyName}>
                              {item.companyNum}--{item.companyName}
                            </Option>
                          );
                        })}
                      </Select>
                    ) : null}
                  </Row>
                </Form.Item>
              ) : null}
              {checked && this.props.type == '1' ? (
                <Form.Item label="选择公司">
                  <Row>
                    <Select
                      showSearch
                      style={{ width: 200 }}
                      placeholder="请选择公司"
                      optionFilterProp="label"
                      onChange={this.onselect}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {companys.map((item) => {
                        return (
                          <Option value={item.companyNum} key={item.id} label={item.companyName}>
                            {item.companyNum}--{item.companyName}
                          </Option>
                        );
                      })}
                    </Select>
                  </Row>
                </Form.Item>
              ) : null}
              {checked ? (
                <Form.Item name="checkbox-group" style={{ paddingLeft: '28%' }}>
                  <Row>
                    <label>创建租户管理员:</label>&nbsp;&nbsp;
                    <Switch onChange={this.selected} checked={roletypestatus} />
                    &nbsp;&nbsp;{createlessee}
                  </Row>
                </Form.Item>
              ) : null}
            </Form>
            <div style={{ height: '30px' }} />
          </div>
          {/* 超管且新增下则展示 */}
          {roleType === roleModalType.new
            ? !checked
              ? this._renderContent()
              : roleId
              ? this._renderContent()
              : null
            : this._renderContent()}
          <div className={styles.button_comp}>
            <Button
              onClick={() => {
                this.props._onCloseBtn(false);
              }}
            >
              返回
            </Button>
            <Button
              type="primary"
              onClick={() => {
                this.onSubmit();
              }}
            >
              提交
            </Button>
          </div>
          <div style={{ height: '30px' }} />
        </div>
      </Spin>
    );
  }
}
export default RoleForm;

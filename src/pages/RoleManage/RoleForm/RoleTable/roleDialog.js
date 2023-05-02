import React from 'react';
import TRNotification from '#/utils/notification';
import { Modal, Button } from 'antd';
import styles from './index.less';
import { TAB_ENUM, BUTTON_CODE } from '../helper';
import { getNewMenuData } from '../../helper';
import RoleList from './index';
import _ from 'lodash';
import Message from '#/components/Message';
import pLoading from '#/components/PLoading';
import {
  roleDataPowerMenusEidt,
  submitRoleDataPowerList,
  batchUpdate,
  batchEdit,
} from '@/services/roleManage';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';

import lock_icon from '@/assets/img/look_icon.png';

const handleNodes1 = (item, mes = [], nodes = [], child = []) => {
  return item.map((m) => {
    let array = [];
    let node = [...nodes];
    let q = [];
    if (m?.menuId) {
      mes.push(m.menuId);
      node.push(m.menuId);
      child.push(m.menuId);
    }
    if (m?.code) {
      mes.push(m.code);
    }
    if (m?.children?.length > 0) {
      array = handleNodes1(m.children, mes, node, q);
      q = q.concat(_.flattenDeep(array.map((p) => p.child)));
    }

    return { ...m, children: array, menus: mes, nodes: node, child: q };
  });
};

export const handleNodes = (item) => {
  return item.map((m) => {
    let array = [];
    let menus = [];
    let nodes = [];
    let tmp = [];
    if (m?.menuId) {
      nodes.push(m.menuId);
      tmp.push(m.menuId);
    }
    if (m?.children?.length > 0) {
      array = handleNodes1(m.children, menus, nodes);
    }
    return { ...m, children: array, menus: [...tmp, ...menus], child: [...menus] };
  });
};

class RoleAlertComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      dataLoading: false,
      roleId: props.roleId || '',
      isShowTab: true,
      tabActiveCode: props.tabActiveCode,
      checkMenuList:
        props.tabActiveCode === TAB_ENUM.TAB_ENUM_MENU ? _.cloneDeep(props.checkMenuList) : [],
      origCheckList: [],
      powerSelObj: {},
      checkDataList: [],
      treeCheckList: props.tabActiveCode === TAB_ENUM.TAB_ENUM_MENU ? [0, 0, 0] : [0, 0, 0, 0],
      isActive: 0,
      selectList: [],
    };
    this._PowerCheckDataObj = {};
    this._CheckMenuCode = '';
  }
  componentDidMount() {
    if (this.state.tabActiveCode === TAB_ENUM.TAB_ENUM_DATA) {
      this.onHandleDataList();
    }
  }
  onSubmit = async () => {
    const { tabActiveCode, checkMenuList } = this.state;
    const { roleId = '' } = this.props;
    const origList = _.cloneDeep(this.props.checkMenuList || []);
    try {
      if (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU || tabActiveCode === TAB_ENUM.TAB_ENUM_DATA) {
        const isTabMenu = tabActiveCode === TAB_ENUM.TAB_ENUM_MENU;
        if (checkMenuList.length === 0)
          return Message.warning(isTabMenu ? '请选择菜单权限' : '请选择数据权限');
        pLoading.show();
        let obj = {};
        let res = {};
        if (isTabMenu) {
          let rml = _.remove([...origList], (n) => {
            return checkMenuList.filter((m) => m.menuId === n.menuId).length === 0;
          });
          let upL = _.filter([...checkMenuList], (n) => {
            return (
              origList.filter((m) => m.menuId === n.menuId && m.operable !== n.operable).length > 0
            );
          });
          let addL = _.filter([...checkMenuList], (n) => {
            return origList.filter((m) => m.menuId === n.menuId).length === 0;
          });
          if ([...rml, ...upL, ...addL].length === 0) {
            pLoading.dismiss();
            return this.onCancel(true);
          }
          obj.removeMenuIds = rml.map((n) => n.menuId);
          obj.updateMenuIds = upL;
          obj.addMenuIds = addL;
          res = { statusCode: HttpCode.SUCCESS };
        } else {
          if (roleId.length > 0) {
            obj.roleId = Number(roleId);
          }
          const changeList = Object.values(this._PowerCheckDataObj)
            .map((d) => {
              const oig = _.uniq([...d.og]);
              const cIds = _.uniq(d.ck.map((n) => n.menuId));
              let rml = _.uniq(
                _.remove([...oig], (n) => {
                  return !cIds.includes(n);
                }),
              );
              let addL = _.filter([...cIds], (n) => {
                return oig.filter((m) => m === n).length === 0;
              });
              if (String(addL) === String(oig)) return undefined;
              if (rml.length > 0 || addL.length > 0) {
                return { ...d.pm, deleteIds: rml, ids: addL };
              }
              return undefined;
            })
            .filter((m) => m);
          pLoading.dismiss();
          if (
            changeList.length === 0 &&
            this.state.checkMenuList.length === 0 &&
            this.state.selectList.length === 0
          ) {
            //没有任何改变 退出
            pLoading.dismiss();
            return this.onCancel(true);
          }
          obj.data = changeList;
          res = await submitRoleDataPowerList({ ...obj });
        }
        pLoading.dismiss();
        if (res?.statusCode === HttpCode.SUCCESS) {
          this.setState(
            {
              visible: false,
            },
            () => {
              this.props.onPress &&
                this.props.onPress({
                  index: 1,
                  tabActiveCode: tabActiveCode,
                  isAdd: roleId.length === 0,
                  roleId: String(res.message),
                  menuData: { requestData: obj, checkMenuList: checkMenuList },
                });
            },
          );
        } else {
          tAlert.show(res?.message || '保存失败');
        }
      }
    } catch (e) {
      pLoading.dismiss();
    }
  };
  onHandleDataList = async (checkArr = [0, 0, 0, 0], type) => {
    try {
      const { menuObj = {} } = this.props;
      const { roleId, dataLoading, tabActiveCode } = this.state;
      const mList = menuObj[tabActiveCode] || [];
      const mItem = mList[checkArr[0]]?.children?.[checkArr[1]]?.children?.[checkArr[2]];
      if (mItem) {
        this._dataItem = { ...mItem };
        if (type) {
          //批量操作 不请求
          this.setState(
            {
              dataLoading: false,
              treeCheckList: checkArr,
              isActive: type,
              isShowTab: false,
            },
            () => {
              this.setState({ isShowTab: true });
            },
          );
          return;
        }

        if (dataLoading) return;
        this.setState({ dataLoading: true });
        const res = await roleDataPowerMenusEidt({
          roleId: roleId,
          source: mItem.source,
          tableName: mItem.tableName,
          menuCode: mItem.menuCode,
        });
        if (res?.statusCode === HttpCode.SUCCESS) {
          let sList = this._PowerCheckDataObj[mItem.menuCode + '-' + mItem.tableName]
            ? this._PowerCheckDataObj[mItem.menuCode + '-' + mItem.tableName].ck
            : (res.selectIds || []).map((m) => {
                return { menuId: String(m.sourceId) };
              });
          this._PowerCheckDataObj[mItem.menuCode + '-' + mItem.tableName] = {
            pm: { source: mItem.source, tableName: mItem.tableName, menuCode: mItem.menuCode },
            og: _.cloneDeep((res.selectIds || []).map((m) => String(m.sourceId))),
            ck: _.cloneDeep(sList),
          };
          this._CheckMenuCode = mItem.menuCode + '-' + mItem.tableName;
          this.setState(
            {
              dataLoading: false,
              origCheckList: (res.selectIds || []).map((m) => String(m.sourceId)),
              checkMenuList: _.cloneDeep(sList),
              checkDataList: handleNodes(res.source || []),
              treeCheckList: checkArr,
              isShowTab: false,
              powerSelObj: { selectKey: res.asSelectId, selectName: res.asShowName },
              isActive: type,
            },
            () => {
              this.setState({ isShowTab: true });
            },
          );
        } else {
          tAlert.show(res?.message || '获取数据权限失败');
          this.setState({ dataLoading: false });
        }
      }
    } catch (e) {
      tAlert.show('获取数据权限失败,切换失败');
      this.setState({ dataLoading: false });
    }
  };
  onCancel = async (type = false) => {
    const { checkMenuList, selectList } = this.state;
    if (!type) {
      if (checkMenuList.length || selectList.length) {
        let obj = await tAlert.show('当前工作将不被保存');
        if (obj.index === 1) {
          this.setState(
            {
              visible: false,
            },
            () => {
              this.props.onPress && this.props.onPress({ index: 0 });
            },
          );
        }
        return;
      }
    }
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onPress && this.props.onPress({ index: 0 });
      },
    );
  };
  onTableColChange = async (sliderIndex, value) => {
    const { treeCheckList, tabActiveCode, isActive } = this.state;
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
      this.setState({ treeCheckList: treeList, isShowTab: false }, () => {
        this.setState({ isShowTab: true });
      });
    } else {
      this.onHandleDataList(treeList, isActive);
    }
  };
  onChangeCheckArray(array) {
    if (
      this.state.tabActiveCode === TAB_ENUM.TAB_ENUM_DATA &&
      this._CheckMenuCode.length > 0 &&
      !this.state.isActive
    ) {
      this._PowerCheckDataObj[this._CheckMenuCode].ck = _.cloneDeep(array);
    }
    this.setState({ checkMenuList: array });
  }
  setChildrenAttribute(val, id, name) {
    return val.map((t) => {
      if (t?.children?.length) {
        t.children = this.setChildrenAttribute(t.children, id, name);
      }
      return {
        ...t,
        menuId: name.toLocaleLowerCase() + '-' + t[id] + '',
        menuName: t[name],
      };
    });
  }
  async onTagChange(type) {
    if (this.state.isActive === type) return;
    if (type) {
      const { roleId, tabActiveCode } = this.state;
      const menuList = this.props.menuObj[tabActiveCode];
      const menuTableMappingBodies = [];
      menuList.forEach((x) => {
        (x?.children || []).forEach((y) => {
          (y?.children || []).forEach((z) => {
            menuTableMappingBodies.push({
              menuCode: z.menuCode,
              source: z.source,
              tableName: z.tableName,
            });
          });
        });
      });
      this.setState({ dataLoading: true });
      const res = await batchEdit({
        menuTableMappingBodies,
        roleId,
      });
      const _temp = res?.[0] ? res : [];
      _temp.forEach((t, i) => {
        if (t?.statusCode === HttpCode.SUCCESS) {
          _temp[i].source = handleNodes(
            this.setChildrenAttribute(t.source, t.asSelectId, t.asShowName),
          );
          this.setState({ dataLoading: false });
        } else {
          tAlert.show(t?.message);
          return this.setState({ dataLoading: false });
        }
      });
      this._PowerCheckDataObj = {}; //清空 逐一配置的数据
      this.setState({
        checkMenuList: [], //选中权限id
        selectList: [], //选中菜单id
        checkDataList: _temp, //权限数据
        isActive: type,
      });
    } else {
      this.onHandleDataList([0, 0, 0, 0], type);
    }
    // this.setState({
    //   isActive: type,
    // });
  }

  getSelectPowerData(val, options, id) {
    let data = [];
    val.forEach((t) => {
      if (options.includes(t.menuId)) {
        data.push(t[id]);
      }
      if (t?.children && t.children?.length) {
        data = data.concat(this.getSelectPowerData(t.children, options, id));
      }
    });
    return data;
  }
  async setSelectList(val) {
    // const menuTableMappingBodies = [];
    // const menuList = this.props.menuObj[this.state.tabActiveCode] || [];
    // menuList.forEach((x) => {
    //   (x?.children || []).forEach((y) => {
    //     (y?.children || []).forEach((z) => {
    //       if (val.includes(z.menuId)) {
    //         menuTableMappingBodies.push({
    //           menuCode: z.menuCode,
    //           source: z.source,
    //           tableName: z.tableName,
    //         });
    //       }
    //     });
    //   });
    // });
    // this.setState({ dataLoading: true });
    // const res = await batchEdit({
    //   menuTableMappingBodies,
    //   roleId: this.state.roleId,
    // });
    // const _temp = res?.[0] ? res : [];
    // _temp.forEach((t, i) => {
    //   if (t?.statusCode === HttpCode.SUCCESS) {
    //     res[i].source = this.setChildrenAttribute(t.source, t.asSelectId, t.asShowName);
    //     this.setState({ dataLoading: false });
    //   } else {
    //     tAlert.show(t?.message);
    //     return this.setState({ dataLoading: false });
    //   }
    // });
    this.setState({
      selectList: val,
      // checkDataList: _temp,
      //  dataLoading: false
    });
  }
  async allUpdate(type) {
    const menuTableMappingBodies = [],
      { tabActiveCode, selectList, checkDataList, checkMenuList } = this.state;
    if (!selectList.length) {
      tAlert.show('请至少勾选一个菜单');
      return;
    }
    const menuList = this.props.menuObj[tabActiveCode] || [];
    menuList.forEach((x) => {
      (x?.children || []).forEach((y) => {
        (y?.children || []).forEach((z) => {
          if (selectList.includes(z.menuId)) {
            menuTableMappingBodies.push({
              menuCode: z.menuCode,
              source: z.source,
              tableName: z.tableName,
            });
          }
        });
      });
    });
    const _temp = checkDataList
      .map((t) => ({
        tableName: t.tableName,
        ids: this.getSelectPowerData(
          t.source,
          checkMenuList.map((t) => t.menuId),
          t.asSelectId,
        ),
      }))
      .filter((t) => t.ids.length);
    const res = await batchUpdate({
      data: menuTableMappingBodies,
      roleId: this.state.roleId,
      tableDatas: _temp,
      updateType: BUTTON_CODE[type],
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.onSubmit();
    }
  }
  render() {
    const {
      visible,
      tabActiveCode,
      dataLoading,
      checkMenuList,
      isShowTab,
      treeCheckList,
      checkDataList,
      isActive,
      selectList,
    } = this.state;
    const { menuObj = {} } = this.props;
    const menuList = getNewMenuData(menuObj[tabActiveCode] || []);

    return (
      <div className={styles.container_modal}>
        <Modal
          maskClosable={false}
          className="modalWraps"
          style={{ overflow: 'hidden' }}
          width={tabActiveCode === TAB_ENUM.TAB_ENUM_MENU ? 1024 : 1280}
          // okText="提交"
          // cancelText="取消"
          footer={[
            <Button key="back" style={{ fontSize: 12 }} onClick={this.onCancel}>
              取消
            </Button>,
            !isActive ? (
              <Button key="submit" type="primary" style={{ fontSize: 12 }} onClick={this.onSubmit}>
                提交
              </Button>
            ) : (
              <>
                <Button
                  key="allUpdate"
                  type="primary"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    this.allUpdate('BTN_ALL');
                  }}
                >
                  全量更新
                </Button>
                <Button
                  key="addUpdate"
                  type="primary"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    this.allUpdate('BTN_ADD');
                  }}
                >
                  增量更新
                </Button>
                <Button
                  key="reduceUpdate"
                  type="primary"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    this.allUpdate('BTN_REDUCE');
                  }}
                >
                  减量更新
                </Button>
              </>
            ),
          ]}
          // onOk={() => {
          //   this.onSubmit();
          // }}
          onCancel={() => {
            this.onCancel();
          }}
          visible={visible}
          centered
        >
          <div className={styles.container_modal_content}>
            <div className={styles.container_modal_content_header}>
              <img src={lock_icon} />
              <div className={styles.container_modal_content_header_title}>
                {tabActiveCode === TAB_ENUM.TAB_ENUM_MENU ? '菜单权限' : '数据权限'}
              </div>
            </div>
            {tabActiveCode === TAB_ENUM.TAB_ENUM_DATA ? (
              <div className={styles.tagCell}>
                <div
                  className={`${styles.tag} ${!isActive ? styles.tag_active : ''}`}
                  onClick={() => {
                    this.onTagChange(0);
                  }}
                >
                  逐一配置
                </div>
                <div
                  className={`${styles.tag} ${isActive ? styles.tag_active : ''}`}
                  onClick={() => {
                    this.onTagChange(1);
                  }}
                >
                  批量配置
                </div>
              </div>
            ) : (
              ''
            )}

            <RoleList
              isShowTab={isShowTab}
              tabActiveCode={tabActiveCode}
              menuList={menuList}
              checkDataList={checkDataList}
              onChangeCheckArray={this.onChangeCheckArray.bind(this)}
              treeCheckList={treeCheckList}
              checkMenuList={checkMenuList}
              dataLoading={dataLoading}
              selectList={selectList}
              setSelectList={this.setSelectList.bind(this)}
              isBatch={isActive}
              onTableColChange={this.onTableColChange.bind(this)}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

class roleDialog {
  __key__ = '';
  show = (params) => {
    if (this.__key__ === '') {
      return new Promise((resolve) => {
        this.__key__ = String(Date.now());
        TRNotification.add({
          key: this.__key__,
          dismiss: this.dismiss,
          content: (
            <RoleAlertComp
              {...params}
              onPress={(res) => {
                TRNotification.remove(this.__key__);
                this.__key__ = '';
                resolve(res);
              }}
            />
          ),
        });
      });
    }
  };
  dismiss = () => {
    TRNotification.remove(this.__key__);
    this.__key__ = '';
  };
}

const roleAlert = new roleDialog();
export default roleAlert;

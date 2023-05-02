import React from 'react';
import TRNotification from '#/utils/notification';
import { Modal, Spin, Input, Empty } from 'antd';
import styles from './index.less';
import { useStaticState, useTRState } from '#/utils/trHooks';
import cls from 'classnames';
import { CloseOutlined } from '#/utils/antdIcons';
import { getDataPowerByRoleIdList, getMenusByUserId } from '@/services/usermanage';
import { HttpCode } from '#/utils/contacts';
import request from '#/utils/requestAbort';
import ShineoutTree from 'shineout/lib/Tree/Tree.js';
import SearchRoles from '@/pages/RoleManage/RoleForm/RoleList/components/SearchRoles';
import { convertTreeToArray } from '@/utils/utils';
import { isTRArray } from '#/utils/attribute';

function MenuComponent(props) {
  const { onPress, roleIds = [], userId } = props;
  const staticState = useStaticState({
    tempObj: {},
    rightCoverList: {},
    tagObj: {},
    rightData: {},
  });
  const [state, setState] = useTRState({
    isVisible: true,
    menuList: [],
    isFist: true,
    filterList: [],
    loading: true,
    selectItem: {},
    rightId: undefined,
    rIds: [],
    errorMsg: '',
  });
  const handleCancel = (res = { index: 0 }) => {
    staticState.tempObj = res;
    setState({ isVisible: false });
  };
  React.useEffect(() => {
    if (!state.isVisible) {
      onPress(staticState.tempObj);
    }
  }, [state.isVisible]);
  React.useEffect(() => {
    onFetchMenus();
  }, []);
  const onFetchMenus = async () => {
    const ids = roleIds.map((j) => j.roleId);
    if (ids.length === 0) return;
    const [res] = await Promise.all([getMenusByUserId({ userId })]);
    if (res?.statusCode !== HttpCode.SUCCESS) {
      return setState({ loading: false, isFist: false, errorMsg: res?.message ?? '请求错误' });
    }
    const array = res?.data.filter((j) => {
      return ['0', '3'].includes(j.type);
    });
    setState({
      rIds: ids,
      loading: false,
      isFist: false,
      menuList: array,
      filterList: array,
      errorMsg: '',
    });
  };
  const onFetchData = async (mCell) => {
    if ((mCell.menuCode ?? '').length > 0) {
      if (staticState.rightData[mCell.menuId]) {
        setState({ selectItem: mCell, rightId: undefined, loading: false });
      } else {
        const res = await request(`/power/dataPower/getCommonPowerByUser`, {
          method: 'POST',
          data: {
            menuCode: mCell.menuCode,
            userId: userId,
            source: mCell.source,
          },
        });
        if (res?.statusCode === HttpCode.SUCCESS) {
          let arr = [];
          (res.powers ?? []).forEach((jPower) => {
            if (isTRArray(jPower?.json)) {
              arr = arr.concat(filterList(jPower?.json, jPower.asSelectId, jPower.asShowName));
            } else if (jPower?.json?.manageList) {
              arr = arr.concat(
                filterList(jPower?.json?.manageList ?? [], jPower.asSelectId, jPower.asShowName),
              );
            }
          });
          staticState.rightData[mCell.menuId] = arr;
          staticState.rightCoverList[mCell.menuId] = convertTreeToArray(arr);
          setState({
            selectItem: mCell,
            rightId: undefined,
            loading: false,
          });
        } else {
          setState({ selectItem: mCell, rightId: undefined, loading: false });
        }
      }
    } else {
      setState({ selectItem: mCell, rightId: undefined, loading: false });
    }
  };
  const onFetchTag = async (tCell) => {
    const dataKey = `${state.selectItem.component}${tCell.deptId}`;
    if (staticState.tagObj[dataKey] === undefined) {
      setState({ loading: true });
      const res = await request(`/power/role/queryRoleByDataPower`, {
        method: 'POST',
        data: {
          menuCode: state.selectItem.component,
          dataPowerId: tCell.deptId,
        },
      });
      if (res?.statusCode === HttpCode.SUCCESS) {
        const str = (res.data ?? []).map((j) => j.roleName).join('、');
        if (str.length > 0) {
          staticState.tagObj[dataKey] = str;
        }
      }
      setState({ loading: false });
    }
  };
  const onRightContent = () => {
    const array = staticState.rightData[state.selectItem.menuId] ?? [];
    if (array.length === 0)
      return (
        <div className={styles.flex_content}>
          <Empty description={'暂无数据'} />
        </div>
      );
    return (
      <React.Fragment>
        <div className={styles.input}>
          <SearchRoles
            onChange={(menuId) => {
              if (menuId > 0) {
                const classId = `node-id-${menuId}`;
                const ele = document.querySelector(`.so-tree-text [${classId}]`);
                if (ele) {
                  ele.scrollIntoView(true);
                  setState({
                    rightId: menuId,
                  });
                }
              } else {
                setState({
                  rightId: undefined,
                });
              }
            }}
            searchKey={'deptName'}
            relKey={'deptId'}
            trFlatList={staticState.rightCoverList[state.selectItem.menuId] ?? []}
          />
        </div>
        <ShineoutTree
          data={array}
          className={styles.tree}
          line={false}
          id={'drTree'}
          onClick={(e) => {
            onFetchTag(e);
          }}
          defaultExpandAll={true}
          style={{ height: '520px' }}
          keygen="deptId"
          renderItem={(node) => {
            let obj = { [`node-id-${node.deptId}`]: node.deptId };
            const dataKey = `${state.selectItem.component}${node.deptId}`;
            const tagStr = staticState.tagObj[dataKey];
            return (
              <span
                {...obj}
                className={cls({
                  [styles.right_cell]: true,
                  [styles.right_cell_click]: state.rightId === node.deptId,
                })}
              >
                {node.deptName}
                {tagStr ? <span className={styles.right_tag}>{tagStr}</span> : null}
              </span>
            );
          }}
        />
      </React.Fragment>
    );
  };
  const onContent = () => {
    if (state.errorMsg.length > 0)
      return (
        <div className={styles.flex_content}>
          <Empty description={state.errorMsg} />
        </div>
      );
    if (state.menuList.length === 0)
      return (
        <div className={styles.flex_content}>
          <Empty description={'暂无数据'} />
        </div>
      );
    return (
      <React.Fragment>
        <div
          className={cls({
            [styles.sidebar]: true,
            [styles.sidebar_box]: true,
          })}
        >
          <div className={styles.input}>
            <Input.Search
              placeholder={'输入检索内容'}
              onSearch={(e) => {
                let ar = [...state.menuList];
                if (e.length > 0) {
                  ar = state.menuList.filter((m) => m.menuName.includes(e));
                }
                setState({
                  filterList: ar,
                });
              }}
            />
          </div>
          <div className={styles.sidebar}>
            {state.filterList.map((j) => {
              return (
                <div
                  className={cls({
                    [styles.cell]: true,
                    [styles.cell_click]: state.selectItem.menuId === j.menuId,
                  })}
                  key={j.menuId}
                  onClick={(e) => {
                    e.stopPropagation();
                    setState({ loading: true });
                    onFetchData(j);
                  }}
                >
                  <div className={styles.cell_title}>{j.menuName}</div>
                  <div className={styles.cell_tag}>{j.source}</div>
                </div>
              );
            })}
            {state.filterList.length === 0 ? (
              <div className={styles.flex_content}>
                <Empty description={'暂无数据'} />
              </div>
            ) : null}
          </div>
        </div>
        {state.selectItem.menuId ? (
          <div
            className={cls({
              [styles.sidebar]: true,
              [styles.sidebar_box]: true,
            })}
            style={{ flex: 2 }}
          >
            {onRightContent()}
          </div>
        ) : null}
      </React.Fragment>
    );
  };
  return (
    <Modal
      wrapClassName={cls({
        [styles.modal_wrap]: true,
      })}
      visible={state.isVisible}
      maskClosable={false}
      footer={null}
      closable={null}
      centered
      width={'100%'}
    >
      <div className={styles.container}>
        <CloseOutlined
          className={styles.container_close}
          onClick={(e) => {
            e.stopPropagation();
            handleCancel();
          }}
        />
        <div className={styles.container_header}>
          <div className={styles.container_header_title}>菜单权限</div>
        </div>
        {state.isFist ? null : <div className={styles.container_panel}>{onContent()}</div>}
        {state.loading ? (
          <div className={styles.flex_loading}>
            <Spin />
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

const filterList = function (array, aKey, aNam) {
  let list = [];
  array.forEach((item) => {
    let obj = { ...item };
    if (item.value) {
      obj.deptId = item.value;
    }
    if (item.lable) {
      obj.deptName = item.lable;
    }
    if (item[aKey]) {
      obj.deptId = item[aKey];
    }
    if (item[aNam]) {
      obj.deptName = item[aNam];
    }
    if (item.children) {
      obj.children = filterList(item.children || [], aKey, aNam);
    }

    list.push(obj);
  });
  return list;
};

class MenuModal {
  __key__ = '';
  show = (params) => {
    if (this.__key__ !== '') {
      return;
    }
    this.__key__ = String(Date.now());
    return new Promise((resolve) => {
      TRNotification.add({
        key: this.__key__,
        content: (
          <MenuComponent
            {...params}
            onPress={(result) => {
              resolve(result);
              this.dismiss(this.__key__);
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

const menuModal = new MenuModal();
export default menuModal;

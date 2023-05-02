import style from './components/RoleTable/index.less';
import React from 'react';
import { Tooltip } from 'antd';

export const checkAllStr = '全选';

export const tabData = { menu: 1, data: 2 };

export const roleModalType = { new: 1, look: 2, edit: 3 };

/* 数组去重 */
export const deleteRepeat = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (arr.indexOf(item) === -1 && item !== '-1') {
      arr.push(item);
    }
  });
  return arr;
};

/* 找到所有父节点的menuId */
export const diffFc = (searchNode = {}, node = {}) => {
  let stack = [];
  const dfs = (tree) => {
    if (tree.children) {
      //通过Object.assign创建新对象同时合并旧对象属性
      stack = [...stack, tree.menuId];
      // stack.push(Object.assign({}, { ...tree }, { ch: [] }));
      //处理父节点
      //如果找到该节点，就退出递归
      //此时stack中的内容就是由从根节点出发，到该节点沿途所经过的节点组成。
      if (tree.menuId == searchNode.menuId) {
        return false;
      }
      const children = tree.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const flag = dfs(child);
        if (!flag) {
          return false;
        }
      }
    } else {
      stack.push(tree.menuId);
      // stack.push(Object.assign({}, { ...tree }));
      //处理叶子节点
      if (tree.menuId == searchNode.menuId) {
        return false;
      }
    }
    stack.pop();
    return true;
  };
  dfs(node);
  return stack.filter((n) => n);
};

const getOperationIdList = (arr = []) => {
  let operationArr = [];
  arr.forEach((item) => {
    operationArr.push(item);
    if (item.children && item.children.length) {
      operationArr = [...operationArr, ...getOperationIdList(item.children)];
    }
  });
  return operationArr;
};

/* 获取每个item所有子节点集合  */
const getChildrenMenuIdList = (arr) => {
  let idList = [];
  arr.forEach((item) => {
    if (item.menuId) {
      idList.push(item.menuId);
    }
    if (item.children && item.children.length) {
      idList = [...idList, ...getChildrenMenuIdList(item.children)];
    }
  });
  return idList;
};

/* 处理树状数据每个item上带有下面所有子节点集合 */
export const getChildrenIdList = (data) => {
  let lintData = data;
  lintData = JSON.parse(JSON.stringify(lintData));
  lintData.forEach((item) => {
    if (item.children && item.children.length && item.menuId) {
      item.childrenMenuIdList = [item.menuId, ...getChildrenMenuIdList(item.children)];
    }
    if (item.children && item.children.length) {
      item.children = getChildrenIdList(item.children);
    }
  });
  return lintData;
};

/* 获取当前可操作的按钮数据 */
export const handelOperationId = (menuId, treedata = []) => {
  let operationArr = [];
  treedata.forEach((item) => {
    if (item.menuId === menuId) {
      operationArr.push(item);
      if (item.children && item.children.length) {
        operationArr = [...operationArr, ...getOperationIdList(item.children)];
      }
    } else if (item.children && item.children.length) {
      operationArr = [...operationArr, ...handelOperationId(menuId, item.children)];
    }
  });
  return operationArr;
};

/* 获取当前树下面被展示的数据menuId集合 */
export const handelShowSelectData = (data, selectList) => {
  let arr = [];
  data.forEach((item) => {
    if (item && selectList.indexOf(item.menuId) !== -1) {
      arr.push(item.menuId);
    }
    if (item && item.children && item.children.length) {
      arr = [...arr, ...handelShowSelectData(item.children, selectList)];
    }
  });
  return arr;
};

export const handleRepeat = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (arr.indexOf(item) === -1) {
      arr.push(item);
    }
  });
  return arr;
};

/* 所有带展示项menuId（包括父id） */
// export const getParentIdByMenuId = (menuId, menuData, list) => {
//   let arr = [];
//   menuData.forEach(item=>{
//     if (item && item.menuId+'' === menuId+'') {
//       arr.push(menuId+'');
//       if (item.parentId) {
//         // arr = [...arr,...getParentIdByMenuId(item.parentId, list, list)]
//       }
//     }else if (item && item.children && item.children.length){
//       // arr = [...arr,...getParentIdByMenuId(menuId, item.children, list)]
//     }
//   });
//   return arr
// };

/* 获取管理用户选中的列表 */
export const getRelationSelectList = (data, idList) => {
  if (!idList) return;
  return idList.map((item) => {
    return data.filter((n) => n.userId === item)[0];
  });
};

/**
 * 获取表格Columns数据
 * @param  {function} _onDelete 删除
 * @param  {function} _onCopy 复制
 * @param  {function} _onLook 查看
 * @param  {function} _onRelationUser 关联用户
 * @param  {boolean} copyPower 赋值权限
 * @param  {boolean} deletePower 关联用户
 * @return {[]}      返回Columns数据
 */
export const getColumns = (
  _onDelete,
  _onCopy,
  _onLook,
  _onRelationUser,
  copyPower,
  deletePower,
) => {
  return [
    {
      title: '角色ID',
      dataIndex: 'roleId',
      width: 120,
      ellipsis: true,
      render(roleId) {
        return (
          <div style={{ display: 'flex' }}>
            <div className={style.describe}>
              <Tooltip placement="topLeft" overlayClassName="overtoop" title={roleId}>
                {roleId}
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      width: 200,
      ellipsis: true,
      render(roleName, item) {
        return (
          <div style={{ display: 'flex' }}>
            <div className={style.describe}>
              <Tooltip placement="topLeft" overlayClassName="overtoop" title={roleName}>
                {roleName}
              </Tooltip>
            </div>
            {item.defaultManager ? <span className={style.tag}>默认</span> : null}
          </div>
        );
      },
    },
    {
      title: '角色描述',
      dataIndex: 'remark',
      width: 225,
      // ellipsis:true,
      render(text) {
        return (
          <div className={style.describe}>
            {text ? (
              <Tooltip placement="topLeft" overlayClassName="overtoop" title={text}>
                {text}
              </Tooltip>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      title: '关联用户数',
      dataIndex: 'relatedUsers',
      sorter: true,
      ellipsis: true,
      width: 133,
      showSorterTooltip: false,
    },
    {
      title: '关联应用',
      dataIndex: 'relatedApps',
      width: 200,
      // ellipsis:true,
      render(text) {
        return (
          <div className={style.describe}>
            {text ? (
              <Tooltip placement="topLeft" overlayClassName="overtoop" title={text}>
                {text}
              </Tooltip>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 240,
      render(text, item) {
        return (
          <div className={style.action}>
            <span onClick={() => _onRelationUser(false, item)}>关联用户</span>|
            {item.defaultManager ? (
              <span onClick={() => _onLook(roleModalType.look, item.roleId)}>查看</span>
            ) : (
              <span onClick={() => _onLook(roleModalType.edit, item.roleId)}>编辑</span>
            )}
            |
            <span
              style={{ color: copyPower ? '#1E7CE8' : 'rgba(0, 0, 0, 0.25)' }}
              onClick={() => _onCopy(item)}
            >
              复制
            </span>
            {!item.defaultManager ? (
              <>
                |
                <span
                  style={{ color: deletePower ? '#1E7CE8' : 'rgba(0, 0, 0, 0.25)' }}
                  onClick={() => _onDelete(item.roleId)}
                >
                  删除
                </span>
              </>
            ) : null}
          </div>
        );
      },
    },
  ];
};
/*菜单添加menuId 定位*/
export const getNewMenuData = (val, parentId) => {
  return val.map((t, i) => {
    const menuId = t.menuId ? t.menuId : `${parentId}-${i}`;
    if (t?.children?.length) {
      t.children = getNewMenuData(t.children, menuId);
    }
    return {
      ...t,
      menuId,
    };
  });
};

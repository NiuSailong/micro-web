import React from 'react';
import styles from './index.less';
import { Button, Empty, Tree, Checkbox, Input } from 'antd';
import { convertTreeToArray } from '@/utils/utils';
import _ from 'lodash';
import { TAB_ENUM } from '../helper';
import { ArrowUpOutlined, ArrowDownOutlined } from '#/utils/antdIcons';
import role_check_all from '@/assets/img/roleManage/role_check_all.png';
import role_check_cancel from '@/assets/img/roleManage/role_check_cancel.png';

export default function ({
  menuDataList,
  checkMenuList,
  tabActiveCode,
  checkDataList,
  onRelation,
  onChangeCheckArray,
  checkMenuListId,
  isRead = false,
}) {
  let array = [];
  const isTabMenu = tabActiveCode === TAB_ENUM.TAB_ENUM_MENU;
  if (isRead) {
    array = !isTabMenu
      ? [...checkDataList]
      : menuDataList.filter((n) => {
          let arr1 = n.menus || [];
          const menus = _.uniq([...arr1, ...checkMenuListId]);
          return menus.length !== checkMenuListId.length + arr1.length;
        });
  } else {
    array = isTabMenu ? [...menuDataList] : [...checkDataList];
  }
  if (array.length === 0) {
    return (
      <div className={`${styles.container} ${styles.container_empty}`}>
        <Empty description={'暂未关联相关权限'} style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
          {isTabMenu && isRead ? (
            <Button
              onClick={() => {
                onRelation && onRelation();
              }}
              style={{ width: 80 }}
            >
              关联
            </Button>
          ) : (
            <div style={{ height: 32 }}> </div>
          )}
        </Empty>
      </div>
    );
  }

  /*************************   分割线  下面是 节点渲染   *************************/
  const onTreeNodeList = (list, isCheck = false) => {
    const ald = isRead ? checkMenuList.filter((n) => n.operable) : [];
    let isCheckAll = false;
    let childTreeList = [];
    let childCheckList = [];
    if (!isTabMenu && isCheck) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      childCheckList = flatCheckList.map((n) => n.menuId);
    }
    if (isCheck) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      isCheckAll = flatCheckList.length > 0 ? flatCheckList.length >= trFlatList.length : false;
      childTreeList = isTabMenu
        ? // eslint-disable-next-line @typescript-eslint/no-use-before-define
          getChildTreeList(trFlatList, checkMenuListId).map((n) => String(n.parentId))
        : // eslint-disable-next-line @typescript-eslint/no-use-before-define
          getPowerList(trFlatList, checkMenuListId); //获取所有子树数组
    }
    return list.map((n) => {
      const isHas = isRead
        ? ald.filter((m) => String(m.menuId) === String(n.menuId)).length > 0
        : false; //只读模式下判断是否选中可操作
      let checkItem = {}; //编辑模式下
      let obj = {};
      let cCheck = false;
      const isFist = ['app', 'web'].includes(n.parentId);
      if (isCheck) {
        checkItem = checkMenuList.filter((m) => String(m.menuId) === String(n.menuId))[0] || {};
        cCheck = isFist ? isCheckAll : checkItem.menuId;
        if (!cCheck && childTreeList.includes(n.menuId)) {
          obj.indeterminate = true;
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!cCheck && isFist && flatCheckList.length > 0) {
          obj.indeterminate = true;
        }
      }
      const TreeNodeItem = (isFather) => {
        let isUpCheck = false;
        let upStr = '';
        if (!isTabMenu && isFather && isCheck) {
          const fuseNum = _.uniq(childCheckList.concat(n.child)).length;
          isUpCheck = childCheckList.length > 0 ? fuseNum === childCheckList.length : false;
          upStr = !isUpCheck ? '向下全选' : '向下取消';
          if (isUpCheck && !cCheck) {
            isUpCheck = false;
            upStr = '选中此项';
          }
        }
        return (
          <div className={styles.tree_node}>
            {isCheck ? (
              <Checkbox
                checked={cCheck}
                {...obj}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-use-before-define
                  onClickPress(n, false, cCheck, isFist, isTabMenu ? false : true);
                }}
                className={styles.tree_node_check}
              />
            ) : null}
            <div className={styles.tree_node_text}>{n.menuName}</div>
            {!isTabMenu && isFather && isCheck ? (
              <div
                className={styles.tree_node_up_button}
                onClick={(e) => {
                  e.preventDefault();
                  // eslint-disable-next-line @typescript-eslint/no-use-before-define
                  onClickPress(n, false, isUpCheck, isFist, false, !isUpCheck && cCheck);
                }}
              >
                <img src={!isUpCheck ? role_check_all : role_check_cancel} />
                <div
                  className={
                    !isUpCheck
                      ? styles.tree_node_up_button_check_title
                      : styles.tree_node_up_button_cancel_title
                  }
                >{`${upStr}`}</div>
              </div>
            ) : null}
            {isCheck && n.button ? (
              <Checkbox
                disabled={!cCheck}
                checked={checkItem.operable}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-use-before-define
                  onClickPress(n, true, cCheck, isFist, isTabMenu ? false : true);
                }}
                className={styles.tree_node_operate_check}
              >
                可操作
              </Checkbox>
            ) : null}
            {!isCheck && isHas ? <div className={styles.tree_node_operate}>可操作</div> : null}
          </div>
        );
      };
      if (n?.children?.length === 0)
        return <Tree.TreeNode checkable={false} title={TreeNodeItem()} key={String(n.menuId)} />;
      return (
        <Tree.TreeNode checkable={false} title={TreeNodeItem(true)} key={String(n.menuId)}>
          {n?.children?.length > 0 ? onTreeNodeList(n.children, isCheck) : null}
        </Tree.TreeNode>
      );
    });
  };

  /*************************   分割线  下面是 查看   *************************/

  if (isRead) {
    //  b 值变化 用于useEffect执行
    let a = convertTreeToArray(menuDataList);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const b = getChildTreeList(a, checkMenuListId);

    const [dataList, setDataList] = React.useState([]);
    React.useEffect(() => {
      let filterList = convertTreeToArray(menuDataList);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      filterList = getChildTreeList(filterList, checkMenuListId);
      const roots = filterList.filter(
        (m) => filterList.filter((n) => n.menuId === m.parentId).length == 0,
      );
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setDataList(convertArrayToTree(roots, filterList));
    }, [JSON.stringify(b)]);

    return (
      <div className={styles.container} style={{ paddingLeft: '10px' }}>
        <div style={{ height: '10px' }} />
        <Tree autoExpandParent height={415} virtual={true}>
          {onTreeNodeList(!isTabMenu ? array : dataList)}
        </Tree>
      </div>
    );
  }
  /*************************   分割线  下面是 编辑   *************************/
  const treeRef = React.useRef();
  const [trFlatList, setTrFlatList] = React.useState([]); //平铺list

  React.useEffect(() => {
    if (!isTabMenu) return;
    setTrFlatList(
      convertTreeToArray(menuDataList).filter((m) => !['web', 'app'].includes(m.parentId)),
    ); //选中数据平铺
  }, [menuDataList]);
  React.useEffect(() => {
    if (isTabMenu) return;
    setTrFlatList(convertTreeToArray(checkDataList));
  }, [checkDataList]);

  //isForce 强制向下全选
  const onClickPress = (item, isOperate, checkState, isFist, isUp = false, isForce = false) => {
    let cArr = [...checkMenuList];
    if (isOperate) {
      cArr = cArr.map((n) => {
        if (String(n.menuId) === String(item.menuId)) {
          return { ...n, operable: !n.operable };
        }
        return { ...n };
      });
      return onChangeCheckArray && onChangeCheckArray(cArr);
    }
    let ob = {};
    if (isFist && checkState) {
      cArr = isTabMenu ? cArr.filter((n) => !(item.child || []).includes(String(n.menuId))) : [];
    } else {
      const flt = convertTreeToArray([item]).map((n) => {
        if (n.button) {
          ob[n.menuId] = n.button;
        }
        return String(n.menuId);
      });
      if (!isForce && cArr.filter((n) => String(n.menuId) === String(item.menuId)).length > 0) {
        //已存在
        cArr = cArr.filter((n) => !flt.includes(String(n.menuId)));
      } else {
        if (isUp) {
          cArr.push({ menuId: String(item.menuId), operable: false });
        } else {
          const tl = isTabMenu ? item.nodes || [] : [];
          _.uniq([...tl, ...flt]).forEach((m) => {
            cArr.push({ menuId: String(m), operable: ob[m] || false });
          });
        }
      }
      cArr = _.uniqBy(cArr, 'menuId');
      cArr = cArr.filter((n) => !String(n.menuId).includes('全选'));
    }
    onChangeCheckArray && onChangeCheckArray(cArr);
  };
  const onChangeSearch = (menuId = '') => {
    if (menuId.length > 0) {
      treeRef.current?.scrollTo({ key: menuId, align: 'top' });
    }
    // setTimeout(()=>{
    //   setSearchId(menuId);
    // },50)
  };
  const flatCheckList = checkMenuList.filter(
    (n) => trFlatList.filter((m) => String(n.menuId) === String(m.menuId)).length > 0,
  ); //选中数据中的选中项
  return (
    <div className={styles.container} style={{ paddingLeft: '10px' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
      <SearchFuc onChange={onChangeSearch} trFlatList={trFlatList} />
      <Tree ref={treeRef} checkable={false} virtual={true} height={375} defaultExpandAll={true}>
        {onTreeNodeList(array, true)}
      </Tree>
    </div>
  );
}

const SearchFuc = ({ onChange, trFlatList }) => {
  const [searchIndex, setSearchIndex] = React.useState(0);
  const [searchArray, setSearchArray] = React.useState([]);

  const onChangeSearch = (inputKey = '') => {
    if (trFlatList.length > 0 && inputKey.length > 0) {
      const arr = _.filter(trFlatList, function (n) {
        return _.includes(n.menuName, inputKey);
      });
      if (arr.length > 0) {
        onChange && onChange(arr[0]?.menuId || '0');
      }
      setSearchArray(arr);
      setSearchIndex(0);
    } else {
      onChange && onChange('');
      setSearchArray([]);
      setSearchIndex(0);
    }
  };
  const onUpOrDown = (isDown) => {
    if (searchArray.length > 0) {
      let nexIndex = isDown ? searchIndex + 1 : searchIndex - 1;
      nexIndex = Math.min(Math.max(0, nexIndex), searchArray.length - 1);
      setSearchIndex(nexIndex);
      onChange && onChange(searchArray[nexIndex]?.menuId || '0');
    }
  };

  return (
    <div className={styles.search}>
      <Input.Search
        onSearch={(e) => {
          onChangeSearch(e);
        }}
      />
      <div className={styles.search_tip}>{`${searchArray.length > 0 ? searchIndex + 1 : 0}/${
        searchArray.length
      }`}</div>
      <ArrowDownOutlined
        className={styles.search_button}
        onClick={() => {
          onUpOrDown(true);
        }}
      />
      <ArrowUpOutlined
        className={styles.search_button}
        onClick={() => {
          onUpOrDown(false);
        }}
      />
    </div>
  );
};

const getPowerList = (array, ld) => {
  let li = [];
  let fl = array.filter((m) => ld.includes(m.menuId));
  fl.forEach((m) => {
    li = [...li, ...(m.nodes || [])];
  });
  return _.uniq(li);
};

const getChildTreeList = (array, list) => {
  const allTreeNode = [];
  _.cloneDeep(array).forEach((m) => {
    if (list.includes(m.menuId)) {
      allTreeNode.push(m.parentId);
    }
  });
  return array.filter(
    (m) => list.includes(String(m.menuId)) || allTreeNode.includes(String(m.menuId)),
  );
};

const convertArrayToTree = (array, dataList) => {
  return array.map((m) => {
    let li = dataList.filter((n) => n.parentId === m.menuId);
    if (li.length > 0) {
      li = convertArrayToTree(li, dataList);
    }
    return { ...m, children: li };
  });
};

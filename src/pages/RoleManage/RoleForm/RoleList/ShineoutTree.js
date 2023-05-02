/* eslint-disable */
import { useState, useMemo, useEffect } from 'react';
import styles from './index.less';
import { convertTreeToArray } from '@/utils/utils';
import { Checkbox, Tabs } from 'antd';
import _ from 'lodash';
import ShineoutTree from 'shineout/lib/Tree/Tree.js';
import { TAB_ENUM } from '../helper';
import {
  NOT_LINE,
  MODE_FULL,
  keygenID,
  getChildTreeList,
  convertArrayToTree,
  MODE_FREEDOM,
  eleParam,
} from './helper';
// 搜索子组件
import SearchRoles from './components/SearchRoles';
// 空状态组件
import EmptyState from './components/EmptyState';
import role_check_all from '@/assets/img/roleManage/role_check_all.png';
import role_check_cancel from '@/assets/img/roleManage/role_check_cancel.png';
import classNames from 'classnames';
import { flatten } from './helper';

const objParam = {
  name: 'menuName',
  id: 'menuId',
};

export default function ({
  menuDataList, // menu数据（[]）
  checkMenuList, // 选中的menuID值（长数组）
  tabActiveCode, // 类型(对应的是“菜单权限”还是“数据权限”)
  checkDataList, // 公司数据（主数组）
  onRelation, // undefined
  onChangeCheckArray, // 改变选择数据的方法（Function）
  checkMenuListId, // 被选中项的ID（长数组）
  isRead = false, // 是否为只读（Boolean）
  isBatch = false, //是否批量配置（Boolean）
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
  } else if (isBatch) {
    array = checkDataList?.[0]?.source || [];
  } else {
    array = isTabMenu ? [...menuDataList] : [...checkDataList];
  }
  const expandArray = (flatten(array).length && flatten(array).map((item) => item.menuId)) || [];
  const [expandKeys, setExpandKeys] = useState(expandArray);
  const [trFlatList, setTrFlatList] = useState([]), //平铺list
    // [tabSsSelectId, setTabSsSelectId] = useState(''), //批量配置 切换查询的节点SsSelectId
    [activeKey, setActiveKey] = useState('1'); //批量配置 切换tab

  // 渲染角色树状组件的项
  const renderRolesItem = (node) => {
    const treeIds = _.cloneDeep(node?.child || []).concat(node.menuId);
    const intersection = _.intersection(checkMenuListNums, node.child);
    const intersectionTree = _.intersection(checkMenuListNums, treeIds);
    const keyId = { [`data-id${node[objParam['id']]}`]: node[objParam['id']] };
    const ele = <span {...keyId}>{node[objParam['name']]}</span>;
    let type = '';
    if (intersectionTree?.length === treeIds?.length) {
      type = 'cancelDown'; // 向下取消
    } else if (intersection?.length === node.child?.length) {
      type = 'checkThis'; // 选中此项
    } else {
      type = 'allDown'; //向下全选
    }
    return _.isEmpty(node.child) ? ele : _renderTreeNode(node, ele, type);
  };
  // 渲染角色树状组件的项
  const renderIsBatchRolesItem = (node, id, name) => {
    const treeIds = _.cloneDeep(node?.child || []).concat(node.menuId + '');
    const intersection = _.intersection(checkMenuListNums, node.child);
    const intersectionTree = _.intersection(checkMenuListNums, treeIds);
    const keyId = { [`data-id-${node.menuId}`]: node.menuId };
    const ele = <span {...keyId}>{node[name]}</span>;
    let type = '';
    if (intersectionTree?.length === treeIds?.length) {
      type = 'cancelDown'; // 向下取消
    } else if (intersection?.length === node.child?.length) {
      type = 'checkThis'; // 选中此项
    } else {
      type = 'allDown'; //向下全选
    }
    return _.isEmpty(node.child) ? ele : _renderTreeNode(node, ele, type);
  };
  // 有子节点的渲染
  const _renderTreeNode = (node, ele, type) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{ele}</span>
        {_renderChildrmenNode(node, type)}
      </div>
    );
  };
  // 子节点操作按钮
  const _renderChildrmenNode = (node, type) => {
    switch (type) {
      case 'allDown':
        return (
          <div
            className={classNames(styles.tree_node_customize, styles.allDown)}
            onClick={() => _hanldeNodeClick(node, 'allDown')}
          >
            <img className={styles.tree_node_img} src={role_check_all} />
            <span>向下全选</span>
          </div>
        );
      case 'cancelDown':
        return (
          <div
            className={classNames(styles.tree_node_customize, styles.cancelDown)}
            onClick={() => _hanldeNodeClick(node, 'cancelDown')}
          >
            <img className={styles.tree_node_img} src={role_check_cancel} />
            <span>向下取消</span>
          </div>
        );
      case 'checkThis':
        return (
          <div
            className={classNames(styles.tree_node_customize, styles.allDown)}
            onClick={() => _hanldeNodeClick(node, 'checkThis')}
          >
            <img className={styles.tree_node_img} src={role_check_all} />
            <span>选中此项</span>
          </div>
        );
      default:
        return null;
    }
  };

  const _hanldeNodeClick = (node, type) => {
    const checkThisArr = _.cloneDeep(checkMenuListNums || []).concat(node.menuId);
    const allTreeArr = _.cloneDeep(node?.child || []).concat(node.menuId);
    switch (type) {
      case 'allDown':
        const allArr = _.union(allTreeArr, checkMenuListNums);
        isBatch ? onChecked(allArr) : handleRolesChange(allArr);
        break;
      case 'cancelDown':
        const cancelArr = _.filter(checkMenuListNums, (_o) => {
          return !allTreeArr.includes(_o);
        });
        isBatch ? onChecked(cancelArr) : handleRolesChange(cancelArr);
        break;
      case 'checkThis':
        isBatch ? onChecked(checkThisArr) : handleRolesChange(checkThisArr);
        break;
    }
  };

  /*************************   分割线  下面是 查看   *************************/

  const onChangeSearch = (menuId = '', parentClass = '') => {
    if (menuId.length > 0) {
      const classId = `data-id${menuId}`;
      const ele = document.querySelector(`.${parentClass}   .so-tree-text [${classId}]`);
      if (ele) {
        setExpandKeys(expandArray);
        ele.scrollIntoView(true);
      }
    }
  };

  // useMemo(() => {
  //   if (!isTabMenu) return;
  //   const trFlatArr = convertTreeToArray(menuDataList).filter(
  //     (m) => !['web', 'app'].includes(m.parentId),
  //   );
  //   //选中数据平铺
  //   setTrFlatList(trFlatArr);
  // }, [menuDataList]);

  // useMemo(() => {
  //   if (isTabMenu) return;
  //   const convertTreeArr = convertTreeToArray(checkDataList);
  //   setTrFlatList(convertTreeArr);
  // }, [checkDataList]);

  if (isRead) {
    // const [dataList, setDataList] = useState([]);
    /* useEffect(() => {
      let filterList = convertTreeToArray(menuDataList);
      filterList = getChildTreeList(filterList, checkMenuListId);
      const roots = filterList.filter(
        m => filterList.filter(n => n.menuId === m.parentId).length == 0,
      );
      setDataList(convertArrayToTree(roots, filterList));
    }, [menuDataList]); */

    // console.log(dataList);
    useMemo(() => {
      let filterList = convertTreeToArray(checkDataList);
      // filterList = getChildTreeList(filterList, checkMenuListId);
      // const roots = filterList.filter(
      //   (m) => filterList.filter((n) => n.menuId === m.parentId).length == 0,
      // );

      setTrFlatList(filterList);
    }, [checkDataList]);
    // 如果没有数据，则展示空状态组件
    if (array.length === 0) {
      return <EmptyState isTabMenu={isTabMenu} isRead={isRead} onRelation={onRelation} />;
    }
    return (
      <div className={styles.container}>
        <SearchRoles
          onChange={(e) => {
            onChangeSearch(e, styles.rolesTree);
          }}
          trFlatList={trFlatList}
        />
        <div className={styles.rolesTree}>
          <ShineoutTree
            // className={styles.rolesTree}
            keygen={objParam['id']}
            line={NOT_LINE}
            data={array}
            renderItem={renderRolesItem}
          />
        </div>
      </div>
    );
  }
  /*************************   分割线  下面是 编辑   *************************/
  // const [trFlatList, setTrFlatList] = useState([]); //平铺list

  // const onChangeSearch = (menuId = '') => {
  //   if (menuId.length > 0) {
  //     const classId = `data-id${menuId}`;
  //     const ele = document.querySelector(`.so-checkinput + .so-tree-text [${classId}]`);
  //     if (ele) {
  //       setExpandKeys(expandArray);
  //       ele.scrollIntoView(true);
  //     }
  //   }
  // };

  useMemo(() => {
    if (!isTabMenu) return;
    const trFlatArr = convertTreeToArray(menuDataList).filter(
      (m) => !['web', 'app'].includes(m.parentId),
    );
    //选中数据平铺
    setTrFlatList(trFlatArr);
  }, [menuDataList]);

  // 处理角色树状组件改变
  const handleRolesChange = (sltArr) => {
    //
    // let _temp = sltArr.filter((t) => !checkMenuListNums.includes(t));
    // if (!_temp.length) {
    //   //取消勾选
    //   const _none = trFlatList.map((t) => t.menuId).filter((t) => !sltArr.includes(t)); //未勾选
    //   _temp = checkMenuListNums.filter((t) => !_none.includes(t));
    // } else {
    //   _temp = [...checkMenuListNums, ..._temp];
    // }
    // 处理为所需数据格式
    const menuIdArr = _.map(sltArr, (item) => ({
      menuId: String(item),
    }));
    //未选中的
    // 执行父组件数据选择改变时触发的方法
    onChangeCheckArray(menuIdArr);
  };
  // 将选中的ID由字符串改为数字型（后台返回字符串后可以取消条转换）
  const checkMenuListNums = checkMenuListId;

  //全选
  const _onCheckAllChange = (e) => {
    let _temp = [];
    _temp = trFlatList.map((t) => t.menuId);
    if (!e.target.checked) {
      handleRolesChange([...checkMenuListNums.filter((t) => !_temp.includes(t))]);
      return;
    }
    handleRolesChange([...checkMenuListNums.filter((t) => !_temp.includes(t)), ..._temp]);
  };
  //反选
  const onInvertHanlder = () => {
    const _options = trFlatList.map((t) => t.menuId);
    //未选中的
    const _temp = _options.filter((t) => !checkMenuListNums.includes(t));
    //先删除全部 再加上反选
    const data = [...checkMenuListNums.filter((t) => !_options.includes(t)), ..._temp];
    handleRolesChange(data);
  };
  //多选
  const onChecked = (val) => {
    const _options = trFlatList.map((t) => t.menuId);

    //先删除全部 再加上
    const data = [...checkMenuListNums.filter((t) => !_options.includes(t)), ...val];
    handleRolesChange(data);
  };
  useMemo(() => {
    if (isTabMenu) return;
    const convertTreeArr = convertTreeToArray(
      !isBatch ? checkDataList : checkDataList?.[activeKey - 1]?.source || [],
    );
    setTrFlatList(convertTreeArr);
  }, [checkDataList, isBatch, activeKey]);

  if (isBatch) {
    const onTabChange = (index) => {
      setActiveKey(index);
      const _data = checkDataList[index - 1];
      const _asSelectId = _data.asSelectId;
      // setTabSsSelectId(_asSelectId);
      // const _temp = _data?.source.map((t) => ({
      //   ...t,
      //   // menuName: t[_data.asShowName],
      //   // menuId: t[_asSelectId] + '',
      // }));
      // setTrFlatList(_temp);
    };
    const onChangeSearch_batch = (menuId = '') => {
      if (menuId.length > 0) {
        const classId = `data-id-${menuId}`;

        const ele = document.querySelector(`.so-checkinput + .so-tree-text [${classId}]`);
        if (ele) {
          setExpandKeys(trFlatList.map((t) => t.menuId));
          ele.scrollIntoView(true);
        }
      }
    };

    // 如果没有数据，则展示空状态组件
    if (array.length === 0) {
      return <EmptyState isTabMenu={isTabMenu} isRead={isRead} onRelation={onRelation} />;
    }
    return (
      <div
        className={styles.container}
        style={{
          marginLeft: '10px',
          border: '1px solid #d9d9d9',
          borderRight: 'none',
          borderRadius: 4,
        }}
      >
        <SearchRoles onChange={onChangeSearch_batch} trFlatList={trFlatList} />
        <Tabs defaultActiveKey="1" onChange={onTabChange}>
          {checkDataList.map((t, i) => {
            return (
              <Tabs.TabPane tab={t.powerName} key={i + 1}>
                <div className={styles.space}>
                  <Checkbox
                    indeterminate={
                      !trFlatList.every((t) => checkMenuListNums.includes(t.menuId)) &&
                      trFlatList.some((t) => checkMenuListNums.includes(t.menuId))
                    }
                    onChange={(e) => {
                      _onCheckAllChange(e, t.asSelectId);
                    }}
                    checked={trFlatList.every((t) => checkMenuListNums.includes(t.menuId))}
                    className={styles.selectAll}
                  >
                    <div className={styles.checkLabel}>
                      <span style={{ flex: 1 }}>全选</span>
                      <span
                        className={styles.last}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onInvertHanlder();
                        }}
                      >
                        反选
                      </span>
                    </div>
                  </Checkbox>
                </div>
                <ShineoutTree
                  className={styles.rolesTree_modal}
                  style={{ height: 275 }}
                  line={NOT_LINE}
                  keygen={objParam['id']}
                  mode={MODE_FREEDOM}
                  data={t.source}
                  value={checkMenuListNums}
                  onChange={onChecked}
                  onClick={(e) => {}}
                  renderItem={(e) => renderIsBatchRolesItem(e, t.asSelectId, t.asShowName)}
                  expanded={expandKeys}
                  defaultExpandAll
                  onExpand={(keys) => {
                    setExpandKeys(keys);
                  }}
                />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
  // 如果没有数据，则展示空状态组件
  if (array.length === 0) {
    return <EmptyState isTabMenu={isTabMenu} isRead={isRead} onRelation={onRelation} />;
  }
  return (
    <div className={styles.container} style={{ paddingLeft: '10px', borderLeft: 'none' }}>
      <SearchRoles
        onChange={(e) => {
          onChangeSearch(e, styles.rolesTree_modal);
        }}
        trFlatList={trFlatList}
      />
      <div className={styles.space}>
        <Checkbox
          indeterminate={checkMenuListNums.length && checkMenuListNums.length < trFlatList.length}
          onChange={_onCheckAllChange}
          checked={checkMenuListNums.length === trFlatList.length}
          className={styles.selectAll}
        >
          <div className={styles.checkLabel}>
            <span style={{ flex: 1 }}>全选</span>
            <span
              className={styles.last}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onInvertHanlder();
              }}
            >
              反选
            </span>
          </div>
        </Checkbox>
      </div>
      <ShineoutTree
        className={styles.rolesTree_modal}
        line={NOT_LINE}
        keygen={objParam['id']}
        mode={MODE_FREEDOM}
        data={array}
        value={checkMenuListNums}
        onChange={handleRolesChange}
        onClick={(e) => {}}
        renderItem={renderRolesItem}
        expanded={expandKeys}
        onExpand={(keys) => {
          setExpandKeys(keys);
        }}
      />
    </div>
  );
}

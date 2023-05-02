import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import RoleList from '../RoleList';
import styles from './index.less';
import { Spin, Checkbox } from 'antd';
import { TAB_ENUM } from '../helper';
import { RightOutlined } from '#/utils/antdIcons';
import ShineoutTree from '../RoleList/ShineoutTree';
import SearchRoles from '../RoleList/components/SearchRoles';
const CheckboxGroup = Checkbox.Group;

const getMenuData = (array = [], sliderIndex, index) => {
  let temp = [];
  temp = array[sliderIndex]?.children || [];
  // if (temp.length) {
  //   temp = temp.map((t, i) => ({
  //     ...t,
  //     menuId: `${index}-${i}`,
  //   }));
  // }
  return temp;
};

const handleMenu = (checkList, menData, index) => {
  if (index === 0) {
    return menData;
    // .map((t, i) => ({ ...t, menuId: `${index}-${i}` }));
  }
  let arr = [];
  for (let i = 0; i < index; i++) {
    let sliderIndex = checkList[i];
    arr = getMenuData(i === 0 ? menData : arr, sliderIndex, index);
  }
  return arr;
};

export default function ({
  onTableColChange,
  dataLoading,
  treeCheckList = [],
  onRelation,
  menuList = [],
  tabActiveCode,
  checkMenuList = [],
  onChangeCheckArray,
  checkDataList = [],
  isRead,
  isShowTab = true,
  isBatch = false,
  selectList = [],
  setSelectList,
}) {
  const checkMenuListId = _.map(checkMenuList || [], (_t) => String(_t?.menuId));
  const onChangeSearch = (menuId = '') => {
    if (menuId.length > 0) {
      const classId = `data-id-${menuId}`;
      const ele = document.querySelector(
        `${isRead ? `.${styles.draw}` : `.${styles.model}`} [${classId}]`,
      );
      if (ele) {
        ele.scrollIntoView(true);
      }
    }
  };
  const checkedChildren = (val, type, index, parentId = null) => {
    const arr = [];
    menuList.forEach((x) => {
      if (index === 0 && val.includes(x.menuId)) {
        arr.push(x.menuId);
        (x?.children || []).forEach((y) => {
          arr.push(y.menuId);
          (y?.children || []).forEach((z) => {
            arr.push(z.menuId);
          });
        });
      } else {
        (x?.children || []).forEach((y) => {
          if (index === 1 && val.includes(y.menuId)) {
            //子集全选 勾选父级
            if (type && val.length === x.children.length) {
              //需要勾选的父ID
              arr.push(x.menuId);
            } else if (!type) {
              //需要取消的父ID
              arr.push(x.menuId);
            }
            arr.push(y.menuId);
            (y?.children || []).forEach((z) => {
              arr.push(z.menuId);
            });
          } else {
            (y?.children || []).forEach((z) => {
              if (index === 2 && val.includes(z.menuId)) {
                //子集全选 勾选父级
                if (type && val.length === y.children.length) {
                  arr.push(y.menuId);
                  const newVal = [...selectList, y.menuId];
                  const isCheckedAll = x.children.every((t) => newVal.includes(t.menuId)); //勾选后 父级全选
                  if (isCheckedAll) {
                    //勾选祖级
                    arr.push(x.menuId);
                  }
                } else if (!type) {
                  arr.push(y.menuId);
                  arr.push(x.menuId);
                }
                if (val.includes(z.menuId)) {
                  arr.push(z.menuId);
                }
              }
            });
          }
        });
      }
    });
    return arr;
  };
  //全选
  const _onCheckAllChange = (e, options, index) => {
    let _temp = options.map((t) => t.menuId);
    _temp = checkedChildren(_temp, true, index);
    if (!e.target.checked) {
      setSelectList && setSelectList([...selectList.filter((t) => !_temp.includes(t))]);
      return;
    }

    setSelectList && setSelectList([...selectList.filter((t) => !_temp.includes(t)), ..._temp]);
    // const _options = options.map((t) => t.menuId);
    // //未选中的
    // const _temp = _options.filter((t) => !selectList.includes(t));
    // let data = [];
    // // const data = e.target.checked
    // //   ? [...selectList, ..._temp]
    // //   : selectList.filter((t) => !_options.includes(t));
    // if (e.target.checked) {
    //   data = checkedChildren(_options, true, index);
    // } else {
    //   data = checkedChildren(_options, false, index);
    // }
    // setSelectList && setSelectList(data);
  };
  //多选
  const _groupChange = async (list, options, index) => {
    //bug
    let _list = list;
    if (list.filter((t) => t === list[0]).length > 1) {
      _list = [];
    }
    //bug

    const _options = options.map((t) => t.menuId);
    //未选中的
    const _none = _options.filter((t) => !selectList.includes(t));
    //当前新选中的
    let _temp = _none.filter((t) => _list.includes(t));
    let data = [];
    if (!_temp.length) {
      // _temp = _options.filter((t) => !_list.includes(t));
      //找出之前选中的
      _temp = _options.filter((t) => selectList.includes(t));
      //过滤未取消勾选的
      _temp = _temp.filter((t) => !list.includes(t));
      // //当前取消的项
      // _temp = _none.filter((t) => !list.includes(t));
      const _data = checkedChildren(_temp, false, index);
      data = [...selectList.filter((t) => !_data.includes(t))];
    } else {
      const _data = checkedChildren(_list, true, index);
      data = [...selectList.filter((t) => !_data.includes(t)), ..._data];
    }
    setSelectList && setSelectList(data);

    // const _options = options.map((t) => t.menuId);

    // if (!_temp.length) {
    //   //取消
    //   _temp = _options.filter((t) => !list.includes(t));
    //   const _data = checkedChildren(_temp, false, index);
    //   const _cancel = selectList.filter((t) => !_data.includes(t));

    //   setSelectList && setSelectList(_cancel);
    // } else {
    //   //勾选
    //   //去重
    //   const opreat = checkedChildren(list, true, index).filter(
    //     (t) => !selectList.includes(t.menuId),
    //   );
    //   setSelectList && setSelectList([...selectList, ...opreat]);
    // }
  };

  //反选
  const onInvertHanlder = (options, index) => {
    const _options = options.map((t) => t.menuId);
    //未选中的
    const _none = _options.filter((t) => !selectList.includes(t));

    let _cancel = [];
    let _data = [];
    if (_none.length) {
      //先取消已选中的所有 （包括父子）
      _cancel = checkedChildren(_options, true, index);
      _data = checkedChildren(_none, true, index);
    } else {
      //取消已选中的所有 （包括父子）
      _cancel = checkedChildren(_options, false, index);
    }
    //先删除全部 再加上反选
    const data = [...selectList.filter((t) => !_cancel.includes(t)), ..._data];
    setSelectList && setSelectList(data);
  };
  return (
    <Spin spinning={dataLoading}>
      <div className={styles.table} style={isBatch ? { borderTop: 0, borderBottom: 0 } : {}}>
        {treeCheckList.map((_j, index) => {
          const menuDataList = handleMenu(treeCheckList, menuList, index, isBatch);
          const cIndex = treeCheckList[index];
          if (index === treeCheckList.length - 1) {
            if (!isShowTab) return null;
            if (tabActiveCode === 'data') {
              return (
                <ShineoutTree
                  isRead={isRead}
                  tabActiveCode={tabActiveCode}
                  onRelation={onRelation}
                  checkMenuListId={checkMenuListId}
                  isBatch={isBatch}
                  onChangeCheckArray={onChangeCheckArray}
                  checkDataList={checkDataList}
                  key={`tb${index}${tabActiveCode}`}
                  menuDataList={menuDataList}
                  checkMenuList={checkMenuList}
                />
              );
            }
            return (
              <RoleList
                isRead={isRead}
                tabActiveCode={tabActiveCode}
                onRelation={onRelation}
                checkMenuListId={checkMenuListId}
                onChangeCheckArray={onChangeCheckArray}
                checkDataList={checkDataList}
                key={`tb${index}${tabActiveCode}`}
                menuDataList={menuDataList}
                checkMenuList={checkMenuList}
              />
            );
          }
          return (
            <>
              {
                //数据权限
                tabActiveCode === 'data' ? (
                  <div
                    className={`${isRead ? styles.draw : styles.model} ${
                      !isBatch ? styles.notBatch : ''
                    }`}
                    style={
                      isBatch
                        ? { borderTop: '1px solid #d9d9d9', borderBottom: '1px solid #d9d9d9' }
                        : {}
                    }
                    key={`tb${index}${tabActiveCode}`}
                  >
                    <div className={styles.checkGroup}>
                      <SearchRoles onChange={onChangeSearch} trFlatList={menuDataList} />
                      {isBatch ? (
                        <div className={styles.space}>
                          <Checkbox
                            indeterminate={
                              //非全选&至少选一个
                              !menuDataList.every((t) => selectList.includes(t.menuId)) &&
                              menuDataList.some((t) => selectList.includes(t.menuId))
                            }
                            onChange={(e) => {
                              _onCheckAllChange(e, menuDataList, index);
                            }}
                            checked={menuDataList.every((t) => selectList.includes(t.menuId))}
                            className={styles.selectAll}
                          >
                            <div className={styles.checkLabel}>
                              <span style={{ flex: 1 }}>全选</span>
                              <span
                                className={styles.last}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onInvertHanlder(menuDataList, index);
                                }}
                              >
                                反选
                              </span>
                            </div>
                          </Checkbox>
                        </div>
                      ) : (
                        ''
                      )}
                      <div className={styles.table_col}>
                        {isBatch ? (
                          <CheckboxGroup
                            className={styles.group}
                            value={selectList}
                            onChange={(e) => {
                              _groupChange(e, menuDataList, index);
                            }}
                          >
                            {_.map(menuDataList || [], (_t, _i) => {
                              let menus = [];
                              if (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU) {
                                menus =
                                  index == 0
                                    ? _.uniq([...(_t?.menus || []), ...(checkMenuListId || [])])
                                    : [];
                              }
                              return (
                                <div
                                  key={`${index}${_i}${_t.code || _t.menuId}`}
                                  className={`${styles.table_slide} ${
                                    cIndex === _i ? styles.table_activeSlide : ''
                                  }`}
                                  onClick={() => {
                                    onTableColChange(index, _i);
                                  }}
                                >
                                  <div
                                    className={styles.table_slide_name}
                                    {...{ [`data-id-${_t?.menuId}`]: _t?.menuId }}
                                  >
                                    <Checkbox
                                      value={_t?.menuId}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      {_t?.name || _t?.menuName || ''}
                                    </Checkbox>
                                  </div>
                                  {menus.length > 0 &&
                                  menus?.length !==
                                    checkMenuListId.length + (_t?.menus || []).length ? (
                                    <div className={styles.lsr_span}>已配置</div>
                                  ) : null}
                                  {_t?.powerName ? (
                                    <div className={styles.lsr_span}>{_t.powerName}</div>
                                  ) : null}
                                  <RightOutlined style={{ marginTop: '4px' }} />
                                </div>
                              );
                            })}
                          </CheckboxGroup>
                        ) : (
                          _.map(menuDataList || [], (_t, _i) => {
                            let menus = [];
                            if (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU) {
                              menus =
                                index == 0
                                  ? _.uniq([...(_t?.menus || []), ...(checkMenuListId || [])])
                                  : [];
                            }
                            return (
                              <div
                                key={`${index}${_i}${_t.code || _t.menuId}`}
                                className={`${styles.table_slide} ${
                                  cIndex === _i ? styles.table_activeSlide : ''
                                }`}
                                onClick={() => {
                                  onTableColChange(index, _i);
                                }}
                              >
                                <div
                                  className={styles.table_slide_name}
                                  {...{ [`data-id-${_t?.menuId}`]: _t?.menuId }}
                                >
                                  {_t?.name || _t?.menuName || ''}
                                </div>
                                {menus.length > 0 &&
                                menus?.length !==
                                  checkMenuListId.length + (_t?.menus || []).length ? (
                                  <div className={styles.lsr_span}>已配置</div>
                                ) : null}
                                {_t?.powerName ? (
                                  <div className={styles.lsr_span}>{_t.powerName}</div>
                                ) : null}
                                <RightOutlined style={{ marginTop: '4px' }} />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  //菜单权限
                  <div
                    key={`tb${index}${tabActiveCode}`}
                    className={styles.table_col}
                    style={{ borderLeft: '1px solid #d9d9d9' }}
                  >
                    {_.map(menuDataList || [], (_t, _i) => {
                      let menus = [];
                      if (tabActiveCode === TAB_ENUM.TAB_ENUM_MENU) {
                        menus =
                          index == 0
                            ? _.uniq([...(_t?.menus || []), ...(checkMenuListId || [])])
                            : [];
                      }
                      return (
                        <div
                          key={`${index}${_i}${_t.code || _t.menuId}`}
                          className={`${styles.table_slide} ${
                            cIndex === _i ? styles.table_activeSlide : ''
                          }`}
                          onClick={() => {
                            onTableColChange(index, _i);
                          }}
                        >
                          <div className={styles.table_slide_name}>
                            {_t?.name || _t?.menuName || ''}
                          </div>
                          {menus.length > 0 &&
                          menus?.length !== checkMenuListId.length + (_t?.menus || []).length ? (
                            <div className={styles.lsr_span}>已配置</div>
                          ) : null}
                          {_t?.powerName ? (
                            <div className={styles.lsr_span}>{_t.powerName}</div>
                          ) : null}
                          <RightOutlined style={{ marginTop: '4px' }} />
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </>
          );
        })}
      </div>
    </Spin>
  );
}

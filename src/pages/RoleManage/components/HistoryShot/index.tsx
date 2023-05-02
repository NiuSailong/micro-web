import React, { useEffect, useState } from 'react';
import { Timeline, message, Tooltip } from 'antd';
import PageLoading from '@/components/PageLoading';
import styles from './index.less';
import { UpSquareOutlined, DownSquareOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller/index.js';
import moment from 'moment';
import { operateLog } from '@/services/roleManage';
import ShineoutTree from 'shineout/lib/Tree/Tree.js';
let flag = false;

// 渲染角色树状组件的项
const renderRolesItem = (
  node: any,
  id: any,
  name: any,
  removeList: any,
  operableList: any = [],
) => {
  const ele = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Tooltip
          className={styles.text}
          placement="topLeft"
          overlayClassName="overtoop"
          title={node[name]}
        >
          <span style={removeList.includes(node[id]) ? { textDecoration: 'line-through' } : {}}>
            {node[name]}
          </span>
        </Tooltip>
      </div>
      {node?.button ? (
        <div
          className={styles.tag}
          style={!operableList.includes(node.menuId) ? { textDecoration: 'line-through' } : {}}
        >
          可操作
        </div>
      ) : (
        ''
      )}
    </div>
  );

  return ele;
};

//新建角色
const AddManage = (props: any) => {
  const [data] = useState(props.data),
    [activeIndex, setActiveIndex] = useState([0, 0]),
    [menue, setMenue] = useState<any>([]),
    [menueChild, setMenueChild] = useState<any>([]),
    [removeList, setRemoveList] = useState<any>([]), //删除项
    [operableList, setOperableList] = useState<any>([]); //可操作项
  useEffect(() => {
    const _menue: any = [],
      _menueChild: any = [];
    (data?.appNodes || []).forEach((x: any, i: number) => {
      _menue.push({ code: x.code, name: x.name });
      if (!i) {
        (x?.children || []).forEach((y: any) => {
          _menueChild.push({ code: y.code, name: y.name });
        });
      }
    });
    setMenue(_menue);
    setMenueChild(_menueChild);
    setRemoveList((data?.removeMenuIds || []).map((t: any) => (t + '').trim()));
    setOperableList(
      (data?.addMenuIds || []).filter((t: any) => t.operable).map((t: any) => t.menuId + ''),
    );
  }, []);
  const onChange = (val: any) => {
    if (val[0] === activeIndex[0]) return;
    const _menueChild: any = [];
    (data?.appNodes?.[val[0]]?.children || []).forEach((x: any) => {
      _menueChild.push({ code: x.code, name: x.name });
    });
    setActiveIndex(val);
    setMenueChild(_menueChild);
  };
  return (
    <>
      <div className={styles.title}>
        角色名称：
        <span className={styles.after}>{data.role.roleName || '-'}</span>
      </div>
      <div className={styles.title}>
        角色描述：
        <span className={styles.after}>{data.role.remark || '-'}</span>
      </div>
      <div className={styles.itemBox}>
        <div className={styles.head}>菜单权限</div>
        <div className={styles.itemGroup}>
          <div className={styles.column}>
            {menue.map((t: any, i: number) => {
              return (
                <>
                  <div
                    className={`${styles.item} ${activeIndex[0] === i ? styles.active : ''}`}
                    key={i}
                    onClick={() => {
                      onChange([i, 0]);
                    }}
                  >
                    {t.name}
                  </div>
                </>
              );
            })}
          </div>
          <div className={styles.column}>
            {menueChild.map((t: any, i: number) => {
              return (
                <>
                  <div
                    className={`${styles.item} ${activeIndex[1] === i ? styles.active : ''}`}
                    key={i}
                    onClick={() => {
                      setActiveIndex([activeIndex[0], i]);
                    }}
                  >
                    {t.name}
                  </div>
                </>
              );
            })}
          </div>
          <div className={styles.rolesTree}>
            <ShineoutTree
              // className={styles.rolesTree}
              leafClass={styles.leafClass}
              keygen={'menuId'}
              line={false}
              data={data?.appNodes?.[activeIndex[0]]?.children?.[activeIndex[1]]?.children || []}
              renderItem={(e: any) =>
                renderRolesItem(e, 'menuId', 'menuName', removeList, operableList)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};
//复制生成角色
const CopyManage = (props: any) => {
  const [data] = useState(props.data);

  return (
    <>
      <div className={styles.title}>
        角色名称：
        <span className={styles.after}>{data.newRoleName || '-'}</span>
      </div>
      <div className={styles.title}>
        角色描述：
        <span className={styles.after}>{data.newRoleRemark || '-'}</span>
      </div>
      <div className={styles.itemBox}>
        <div className={styles.head}>原始角色（{data.originRoleId}）</div>
        <div className={styles.itemGroup}>
          <div className={styles.content_title}>
            角色名称：
            <span className={styles.after}>{data.originRoleName}</span>
          </div>
        </div>
      </div>
    </>
  );
};
//编辑数据权限
const PowerBatchConfig = (props: any) => {
  const [data] = useState(props.data),
    [activeIndex, setActiveIndex] = useState([0, 0, 0]),
    [menue, setMenue] = useState<any>([]);

  useEffect(() => {
    const _menue: any = [];
    //第一级
    (data?.logBodyList || []).forEach((x: any) => {
      if (_menue.every((t: any) => !t.name.includes(x.applicationName))) {
        const children: any = [];
        //第二级
        (data?.logBodyList || []).forEach((y: any) => {
          if (
            y.applicationName === x.applicationName &&
            children.every((t: any) => !t.name.includes(y.menuName))
          ) {
            const _children: any = [];
            //第三级
            (data?.logBodyList || []).forEach((z: any) => {
              if (z.applicationName === y.applicationName && y.menuName === z.menuName) {
                _children.push({
                  name: z.powerName,
                  powerData: z.powerData,
                  source: z.source,
                  removeIds: z.removeIds,
                });
              }
            });
            children.push({ name: y.menuName, children: _children });
          }
        });
        _menue.push({ name: x.applicationName, children });
      }
    });
    setMenue(_menue);
  }, []);

  return (
    <>
      <div className={styles.title}>
        角色名称：
        <span className={styles.after}>{data?.role?.roleName || '-'}</span>
      </div>
      <div className={styles.title}>
        角色描述：
        <span className={styles.after}>{data?.role?.remark || '-'}</span>
      </div>
      <div className={styles.itemBox}>
        <div className={styles.head}>数据权限</div>
        <div className={styles.itemGroup}>
          <div className={styles.column}>
            {menue.map((t: any, i: number) => {
              return (
                <>
                  <div
                    className={`${styles.item} ${activeIndex[0] === i ? styles.active : ''}`}
                    key={i}
                    onClick={() => {
                      setActiveIndex([i, 0, 0]);
                    }}
                  >
                    {t.name}
                  </div>
                </>
              );
            })}
          </div>
          <div className={styles.column}>
            {(menue?.[activeIndex[0]]?.children || []).map((t: any, i: number) => {
              return (
                <>
                  <div
                    className={`${styles.item} ${activeIndex[1] === i ? styles.active : ''}`}
                    key={i}
                    onClick={() => {
                      setActiveIndex([activeIndex[0], i, 0]);
                    }}
                  >
                    <Tooltip
                      className={styles.text}
                      placement="topLeft"
                      overlayClassName="overtoop"
                      title={t.name}
                    >
                      {t.name}
                    </Tooltip>
                  </div>
                </>
              );
            })}
          </div>
          <div className={styles.column}>
            {(menue?.[activeIndex[0]]?.children?.[activeIndex[1]]?.children || []).map(
              (t: any, i: number) => {
                return (
                  <>
                    <div
                      className={`${styles.item} ${activeIndex[2] === i ? styles.active : ''}`}
                      key={i}
                      onClick={() => {
                        setActiveIndex([activeIndex[0], activeIndex[1], i]);
                      }}
                    >
                      {t.source}
                      <div className={styles.tag}>
                        <Tooltip placement="topLeft" overlayClassName="overtoop" title={t.name}>
                          {t.name}
                        </Tooltip>
                      </div>
                    </div>
                  </>
                );
              },
            )}
          </div>
          <div className={styles.rolesTree}>
            <ShineoutTree
              keygen={
                menue?.[activeIndex[0]]?.children?.[activeIndex[1]]?.children?.[activeIndex[2]]
                  ?.powerData?.asSelectId
              }
              line={false}
              leafClass={styles.leafClass}
              data={
                menue?.[activeIndex[0]]?.children?.[activeIndex[1]]?.children?.[activeIndex[2]]
                  ?.powerData?.source || []
              }
              renderItem={(e: any) => {
                const m_data =
                  menue?.[activeIndex[0]]?.children?.[activeIndex[1]]?.children?.[activeIndex[2]];
                return renderRolesItem(
                  e,
                  m_data?.powerData?.asSelectId,
                  m_data?.powerData?.asShowName,
                  m_data?.removeIds || [],
                );
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
//角色关联用户
const RoleRelationUser = (props: any) => {
  const [data] = useState(props.data);

  return (
    <>
      <div
        className={styles.itemBox}
        style={{
          borderBottom: 'none',
        }}
      >
        <div className={styles.cell}>
          <div className={styles.headShort}>角色ID</div>
          <div className={styles.afterShort}>
            {(data?.roles || []).map((t: any) => t.roleId).join('、')}
          </div>
        </div>
        <div className={styles.cell}>
          <div className={styles.headShort}>角色名称</div>
          <div className={styles.afterShort}>
            {(data?.roles || []).map((t: any) => t.roleName).join('、')}
          </div>
        </div>
        {props.type === 'RoleRelationUser' ? (
          <div className={styles.cell}>
            <div className={styles.headShort}>关联用户变更</div>
            <div className={styles.afterShort}>
              {(data?.users || []).map((t: any, i: number) => {
                return (
                  <>
                    <span
                      style={
                        (data?.delUserIds || []).includes(t.userId)
                          ? { textDecoration: 'line-through' }
                          : {}
                      }
                    >
                      {t.name}
                    </span>
                    {i !== data.users.length - 1 ? '、' : ''}
                  </>
                );
              })}
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
};
const HistoryShot = (props: any) => {
  const {} = props;
  const [pageSize] = useState(50),
    [loading, setLoading] = useState(false),
    [currentPage, setCurrentPage] = useState(1),
    [total, setTotal] = useState(-1),
    [logArray, setLogArray] = useState<any>([]);

  const init = async () => {
    setLogArray([]);
    setTotal(-1);
    setLoading(true);
    setCurrentPage(1);
    const param = {
      current: 1,
      size: pageSize,
    };
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    await searchData(param, 1);
    setLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  const getNewTableData = (data: any) => {
    return (data || [])
      .map((t: any) => {
        return {
          id: t.id,
          // activeIndex: 0,
          operateUserId: t.operateUserId,
          operateUserName: t.operateUserName,
          operateType: t.operateType,
          operateTypeRemark: t.operateTypeRemark,
          date: t.operateTime,
          operator: t.operateUserName,
          data: JSON.parse(t.operateDetail),
          expand: false,
        };
      })
      .sort((a: any, b: any) => b.date.localeCompare(a.date));
  };
  const searchData = async (param: any, type = 0) => {
    if (flag) return;
    flag = true;
    if (total === logArray.length && !type) {
      message.warning('没有更多数据');
      return;
    }
    const res = await operateLog(param).catch();
    // if (res?.statusCode === HttpCode.SUCCESS) {
    if (!res) return;
    setTotal(res.total);
    const data = res;
    const _temp = getNewTableData(data.records);
    setLogArray(type ? _temp : logArray.concat(_temp));
    flag = false;
    // }
  };

  const loadMore = () => {
    if (flag) return;
    setCurrentPage(currentPage + 1);
    const param = {
      current: currentPage + 1,
      size: pageSize,
    };
    searchData(param);
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <PageLoading />
      ) : (
        <div className={styles.contentBox}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={loadMore}
            hasMore={!loading && total !== logArray.length}
            useWindow={false}
            className={styles.scroll}
          >
            <Timeline
              style={{
                width: '100%',
                paddingLeft: 24,
              }}
            >
              {logArray.map((t: any, i: number) => (
                <Timeline.Item
                  key={t.id}
                  className={`${styles.timeline}  ${i === 0 ? styles.current : ''}`}
                  // color="#E8E8E8"
                  dot={
                    <div
                      className={styles.dot_border}
                      style={i !== 0 ? { background: '#E8E8E8', width: 8, height: 8 } : {}}
                    >
                      <div
                        className={styles.dot_inside}
                        style={i !== 0 ? { background: '#FFFFFF' } : {}}
                      />
                    </div>
                  }
                >
                  <div className={styles.top_date}>
                    <div className={styles.timeline_left}>
                      {moment(t.date).format('YYYY.MM.DD HH:mm:ss')}
                      <span className={styles.unit}>
                        {t.operateTypeRemark}（
                        {t.data?.role?.roleId ||
                          (t.data?.roles?.length
                            ? t.data?.roles?.[0]?.roleId + (t.data?.roles?.length > 1 ? '等' : '')
                            : false) ||
                          t.data?.newRoleId ||
                          ''}
                        ）
                      </span>
                      {t.expand ? (
                        <UpSquareOutlined
                          style={{ color: '#18A0FB', marginLeft: 12 }}
                          onClick={() => {
                            setLogArray(
                              logArray.map((_t: any, _i: number) => {
                                if (_i === i) {
                                  _t.expand = false;
                                }
                                return _t;
                              }),
                            );
                          }}
                        />
                      ) : (
                        <DownSquareOutlined
                          style={{ color: '#18A0FB', marginLeft: 12 }}
                          onClick={() => {
                            setLogArray(
                              logArray.map((_t: any, _i: number) => {
                                if (_i === i) {
                                  _t.expand = true;
                                }
                                return _t;
                              }),
                            );
                          }}
                        />
                      )}
                    </div>
                    <div className={styles.timeline_right}>
                      操作人：
                      <div className={styles.name}>{t.operateUserName}</div>
                    </div>
                  </div>
                  {t.expand ? (
                    <>
                      <div className={styles.content}>
                        {t.operateType === 'addRole' ||
                        t.operateType === 'updateRoleAndMenuConfig' ? (
                          <AddManage data={t.data} />
                        ) : (
                          ''
                        )}
                        {t.operateType === 'RoleCopy' ? <CopyManage data={t.data} /> : ''}
                        {t.operateType === 'powerBatchConfig-ZJQX' ||
                        t.operateType === 'powerBatchConfig-QLBG' ||
                        t.operateType === 'powerBatchConfig-SCQX' ||
                        t.operateType === 'powerConfig-updatePowerConfig' ? (
                          <PowerBatchConfig data={t.data} />
                        ) : (
                          ''
                        )}

                        {t.operateType === 'RoleRelationUser' ||
                        t.operateType === 'RoleBatchDel' ? (
                          <RoleRelationUser data={t.data} type={t.operateType} />
                        ) : (
                          ''
                        )}
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};
export default HistoryShot;

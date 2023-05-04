import React, { useEffect, useRef, useCallback } from 'react';
import { Button, Drawer, message, Switch } from 'antd';
import { useStaticState, useTRState } from '#/utils/trHooks';
import styles from './index.less';
import { HttpCode } from '#/utils/contacts';
import { getColumns, columns, filterList, buttons, options, detailColumns } from './helper';
import {
  getTaskRunList,
  updateTaskRun,
  addTaskRun,
  stopTaskRun,
  resetTaskRun,
  getRunTaskRely,
  getRunTaskLog,
} from '@/services/TaskCenter';
import TRQuery from '@/components/TRQuery';
import TREditForm from '@/components/TREditForm';
import TRDrawer from '@/components/TRDrawer';
import TRTable from '@/components/TRTable';
import GraphView from '../TaskManage/components/GraphView';
import moment from 'moment';
import { connect } from 'dva';
const splitStr = (str, len = 18) => {
  if (str.length > len) {
    return `${str.slice(0, len - 1)}...`;
  } else {
    return str;
  }
};
const TaskRunList = (props = {}) => {
  const drawerRef = useRef(null);
  const { buttonPermissions = [] } = props;
  const [state, setState] = useTRState({
    tableData: [],
    loading: false,
    visible: false,
    showGraph: false,
    nodeId: '',
    allData: [],
    data: {
      nodes: [],
      edges: [],
    },
    logData: [],
  });
  const staticData = useStaticState({
    selectData: {},
    filterData: {
      status: null,
    },
    total: 0,
    size: 20,
    current: 1,
    editingKey: '',
    buttonsPower: null,
    logTable: {
      total: 0,
      size: 20,
      current: 1,
      uuid: '',
    },
  });

  useEffect(() => {
    onFetch();
    let buttonsPower = [];
    buttonPermissions?.map((item) => {
      if (buttons.indexOf(item.menuCode) != -1) {
        buttonsPower.push(item.menuCode);
      }
    });
    staticData.buttonsPower = buttonsPower;
  }, []);

  const onFetch = async () => {
    setState({
      loading: true,
    });
    let params = {
      ...staticData.filterData,
      size: staticData.size,
      current: staticData.current,
    };
    let res = await getTaskRunList(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.total = res?.total || 0;
      setState({
        tableData: res.data,
      });
    }
    setState({
      loading: false,
    });
  };
  const operationChange = async (type = '', obj = {}) => {
    if (type === 'edit' || type === 'add' || type === 'stop') {
      if (
        isButtonsDisable(
          type === 'edit' ? 'TC-KZ-BJ' : type === 'add' ? 'TC-KZ-FZ' : 'TC-KZ-TZ',
          true,
        )
      )
        return;
      let data = { ...obj };
      delete data.message;
      delete data.createTime;
      delete data.updateTime;
      delete data.relyOnTaskUuidList;
      delete data.status;
      if (type === 'edit' || type === 'add') {
        data.startTime = moment(obj.startTime, 'HH:mm:ss');
        data.endTime = moment(obj.endTime, 'HH:mm:ss');
        if (type === 'add') {
          data.uuid = data.uuid + String(Math.floor(Math.random() * 100 + 1));
          data.id = data.id + String(Math.floor(Math.random() * 100 + 1));
          data.startDate = moment().format('YYYY-MM-DD');
        }
        staticData.selectData = { ...data };
        onDrawerChange(type, true);
      } else {
        setState({
          loading: true,
        });
        const res = await stopTaskRun(data);
        if (res?.statusCode === HttpCode.SUCCESS) {
          message.success('终止成功');
          onFetch();
        } else {
          message.error(res?.message);
        }
      }
    } else if (type === 'run' || type === 'reset') {
      if (isButtonsDisable(type === 'run' ? 'TC-KZ-ZX' : 'TC-KZ-CXZX', true)) return;
      const res = await resetTaskRun(obj.uuid, type === 'reset');
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success(type === 'run' ? '成功执行' : '已重新执行');
        onFetch();
      } else {
        message.error(res?.message);
      }
    } else if (type === 'seeType') {
      staticData.editingKey = type;
      if (isButtonsDisable('TC-KZ-ZXZT', true)) return;
      setState({
        loading: true,
      });
      const res = await getRunTaskRely({ id: obj.id, uuid: obj.uuid });
      if (res?.statusCode === HttpCode.SUCCESS) {
        let data = {
          nodes: [],
          edges: [],
        };
        let status = [...options, { label: '执行中(重试)', value: 5, color: '#ED7B2F' }];
        res.data.map((item) => {
          let node = {
            id: item.uuid,
            label: splitStr(item.taskName),
            des: item.taskName,
            type: 'modelRect',
            description: status[item.status].label,
            logoIcon: {
              show: false,
            },
            stateIcon: {
              show: false,
            },
            preRect: {
              // 设置为 false，则不显示
              show: true,
              fill: status[item.status].color,
              width: 8,
            },
            size: [
              item.taskName.length > 18
                ? 290
                : item.taskName.length < 7
                ? 130
                : item.taskName.length * 15 + 40,
              60,
            ],
          };
          if (item.id == obj.id) {
            node.labelCfg = {
              style: {
                fill: '#9254de',
                stroke: '#9254de',
                lineWidth: 1,
              },
            };
          }
          data.nodes.push(node);
          if (item.pointAtList.length > 0) {
            item.pointAtList.map((x) => {
              data.edges.push({
                target: x,
                source: item.uuid,
              });
            });
          }
        });
        setState({
          allData: data,
          data,
          nodeId: obj.uuid,
          showGraph: true,
        });
      } else {
        message.error('接口报错!');
      }
    } else if (type == 'seeLog') {
      staticData.editingKey = type;
      setState({
        showGraph: true,
        loading: true,
      });
      fetchLog(obj.uuid);
    }
    setState({
      loading: false,
    });
  };
  const fetchLog = async (uuid = '') => {
    setState({
      loading: true,
    });
    let param = { ...staticData.logTable };
    if (uuid != '') {
      param.uuid = uuid;
      staticData.logTable = { ...param };
    }
    const res = await getRunTaskLog(param);
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.logTable.total = res?.total || 0;
      setState({
        logData: res.data,
      });
    }
    setState({
      loading: false,
    });
  };
  const isButtonsDisable = useCallback(
    (power_code, showInfo = false) => {
      let isDisable = false;
      if (staticData.buttonsPower != null) {
        isDisable = !staticData.buttonsPower.includes(power_code);
        if (isDisable && showInfo) {
          message.info('请联系管理员获取相关权限');
        }
      }
      return isDisable;
    },
    [staticData.buttonsPower],
  );
  const onDrawerChange = (editingKey = '', show = false) => {
    staticData.editingKey = editingKey;
    if (!show) {
      staticData.selectData = {};
    }
    setState({
      visible: show,
    });
  };
  const onSave = async (params = {}) => {
    let data = { ...staticData.selectData, ...params };
    data.startTime = moment(params.startTime).format('HH:mm:ss');
    data.endTime = moment(params.endTime).format('HH:mm:ss');
    return staticData.editingKey == 'edit' ? updateTaskRun([data]) : addTaskRun([data]);
  };
  const filterColumns = (columns) => {
    let cos = [];
    columns.map((item) => {
      if (item?.label) {
        cos.push(item);
      }
    });
    return cos;
  };
  const getAllSources = (nodes, data, isUp) => {
    // 递归筛选出该节点所有的直接关联节点
    let ns = [];
    state.allData.edges.map((item) => {
      let a = isUp ? item.target : item.source;
      let b = isUp ? item.source : item.target;
      if (nodes.indexOf(a) != -1) {
        ns.push(b);
        data.edges.push(item);
        if (data.nodes.indexOf(b) == -1) {
          data.nodes.push(b);
        }
      }
    });
    if (ns.length > 0) {
      return getAllSources(ns, data, isUp);
    } else {
      return data;
    }
  };
  const changeRelevance = (checked) => {
    let data = {
      nodes: [],
      edges: [],
    };
    if (!checked) {
      let upData = getAllSources([state.nodeId], { nodes: [], edges: [] }, true); //所有的上游节点
      let downData = getAllSources([state.nodeId], { nodes: [], edges: [] }, false); //所有的下游节点
      state.allData.nodes.map((item) => {
        let node = null;
        if (item.id == state.nodeId) {
          node = item;
        }
        upData.nodes.map((x) => {
          if (x == item.id) {
            node = item;
          }
        });
        downData.nodes.map((x) => {
          if (x == item.id) {
            node = item;
          }
        });
        if (node != null) {
          data.nodes.push(node);
        }
      });
      data.edges = [...upData.edges, ...downData.edges];
    }
    setState({
      data: checked ? state.allData : data,
    });
  };
  return (
    <div className={styles.container}>
      <TRQuery
        onFetchGetData={(data = {}) => {
          staticData.filterData = _.cloneDeep(data);
          staticData.current = 1;
          onFetch(filterList);
        }}
        loading={state.loading}
        filterList={filterList}
      />
      <TRTable
        loading={state.loading}
        columns={getColumns({ onChange: operationChange, isButtonsDisable })}
        dataSource={state.tableData}
        pagination={{
          total: staticData.total,
          pageSize: staticData.size,
          current: staticData.current,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (current, pageSize) => {
            staticData.size = pageSize;
            staticData.current = current;
            onFetch();
          },
        }}
      />
      <TRDrawer
        closeTitle={`确定要退出编辑吗？`}
        drawerProps={{
          width: '40%',
          title: `任务控制/待办列表/编辑`,
          visible: state.visible,
        }}
        data={staticData.selectData}
        onDrawerChange={onDrawerChange}
        ref={drawerRef}
      >
        {['edit', 'add'].includes(staticData.editingKey) ? (
          <TREditForm
            columns={filterColumns(columns)}
            closeTitle={`确定要退出编辑吗？`}
            data={staticData.selectData}
            onSave={onSave}
            editingKey={'edit'}
            allowSame={staticData.editingKey == 'add'}
            onDrawerChange={async (bool = false) => {
              await onDrawerChange();
              if (bool) onFetch();
            }}
            formDataUpdata={drawerRef?.current?.formDataUpdata}
          />
        ) : null}
      </TRDrawer>
      <Drawer
        width="90%"
        title={`任务控制/待办列表/${
          staticData.editingKey == 'seeType' ? '关联待办执行状态' : '日志'
        }`}
        onClose={() =>
          setState({
            showGraph: false,
          })
        }
        visible={state.showGraph}
        getContainer={false}
        destroyOnClose={true}
      >
        {staticData.editingKey == 'seeType' ? (
          <div className={styles.drawer}>
            {state.data?.nodes.length > 1 && (
              <div style={{ marginBottom: 12 }}>
                展示全部关联
                <Switch style={{ marginLeft: 12 }} defaultChecked onChange={changeRelevance} />
              </div>
            )}
            {state.showGraph && <GraphView data={state.data} />}
          </div>
        ) : (
          <TRTable
            loading={state.loading}
            columns={detailColumns}
            dataSource={state.logData}
            scroll={{ y: 600 }}
            pagination={{
              total: staticData.logTable.total,
              pageSize: staticData.logTable.size,
              current: staticData.logTable.current,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (current, pageSize) => {
                staticData.logTable.size = pageSize;
                staticData.logTable.current = current;
                fetchLog();
              },
            }}
          />
        )}
      </Drawer>
    </div>
  );
};

export default connect(
  ({ global }) => ({
    buttonPermissions: global?.configure?.buttonPermissions,
  }),
  null,
  null,
  { forwardRef: true },
)(TaskRunList);

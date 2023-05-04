import React, { useEffect, useRef } from 'react';
import { Button, Drawer, message } from 'antd';
import { useStaticState, useTRState } from '#/utils/trHooks';
import styles from './index.less';
import GraphConfig from './components/GraphConfig';
import ExcelModel from './components/ExcelModel';
import { HttpCode } from '#/utils/contacts';
import { getColumns, columns, filterList, buttons } from './helper';
import { getTaskList, saveTask, updateTask, delTaskById, getOptions } from '@/services/TaskCenter';
import TRQuery from '@/components/TRQuery';
import TREditForm from '@/components/TREditForm';
import TRDrawer from '@/components/TRDrawer';
import TRTable from '@/components/TRTable';
import moment from 'moment';
import { connect } from 'dva';
import { useCallback } from 'react';
const TaskManage = (props = {}) => {
  const { buttonPermissions = [], menuCode = '' } = props;
  const drawerRef = useRef(null);
  const [state, setState] = useTRState({
    tableData: [],
    loading: false,
    visible: false,
    showGraph: false,
    nodeClick: null,
    exportShow: false,
  });
  const staticData = useStaticState({
    selectData: {},
    filterData: {
      taskCode: '',
      taskName: '',
    },
    buttonsPower: null,
    total: 0,
    size: 20,
    current: 1,
    editingKey: '',
    selectOptions: {},
  });

  useEffect(() => {
    onFetch();
    selectOptions();
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
    let res = await getTaskList(params);
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
  const operationChange = (type = '', obj = {}) => {
    if (!isButtonsDisable(type === 'edit' ? 'TC-PZ-SC' : 'TC-PZ-SC', true)) {
      if (type === 'edit') {
        let data = { ...obj };
        data.startTime = moment(obj.startTime, 'HH:mm:ss');
        data.endTime = moment(obj.endTime, 'HH:mm:ss');
        data.andOr = obj.andOr ? '1' : '0';
        data.nextDayRetry = obj.nextDayRetry ? '1' : '0';
        delete data.createBy;
        delete data.createTime;
        delete data.updateTime;
        delete data.updateBy;
        delete data.modifyBy;
        staticData.selectData = { ...data };
        onDrawerChange(type, true);
      } else if (type === 'delete') {
        onDelete(obj.id);
      }
    }
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
    if (editingKey == 'create' && show) {
      staticData.selectData = {
        nextDayRetry: '1',
        clientTimeout: 60,
        retryTime: 60,
        priority: 0,
        andOr: '0',
        flag: 'default',
      };
    }
    setState({
      visible: show,
    });
  };
  const onDelete = async (id) => {
    setState({
      loading: true,
    });
    let res = await delTaskById(id);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success('删除成功');
      onFetch();
    } else {
      setState({
        loading: false,
      });
      message.error(res?.message ?? '删除失败');
    }
  };
  const onSave = (params = {}) => {
    let res = { ...params };
    res.startTime = moment(res.startTime).format('HH:mm:ss');
    res.endTime = moment(res.endTime).format('HH:mm:ss');
    res.andOr = res.andOr !== '0';
    res.nextDayRetry = res.nextDayRetry !== '0';
    return staticData.editingKey == 'create' ? saveTask([res]) : updateTask([res]);
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
  const selectOptions = async () => {
    let optinos = {
      andOrObj: [
        { label: '0', value: '0' },
        { label: '1', value: '1' },
      ],
      nextDayRetryObj: [
        { label: '否', value: '0' },
        { label: '是', value: '1' },
      ],
      typeObj: [
        { label: '私有', value: 'private' },
        { label: '公有', value: 'public' },
      ],
      cycleObj: [],
      dagIdObj: [],
    };
    let params = [
      `PURCHASE_INFO_${menuCode == 'SD-TaskCenter' ? 'S' : 'G'}_SIDE_TASK_CYCLE`,
      `PURCHASE_INFO_${menuCode == 'SD-TaskCenter' ? 'S' : 'G'}_SIDE_TASK_DAG`,
      `PURCHASE_INFO_${menuCode == 'SD-TaskCenter' ? 'S' : 'G'}_SIDE_TASK_FLAG`,
    ];
    const res = await getOptions(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      optinos.cycleObj = res.listMap[
        `PURCHASE_INFO_${menuCode == 'SD-TaskCenter' ? 'S' : 'G'}_SIDE_TASK_CYCLE`
      ].map((item) => {
        return { label: item.description, value: item.value };
      });
      optinos.dagIdObj = res.listMap[
        `PURCHASE_INFO_${menuCode == 'SD-TaskCenter' ? 'S' : 'G'}_SIDE_TASK_DAG`
      ].map((item) => {
        return { label: item.description, value: item.value };
      });
      optinos.flagObj = res.listMap[
        `PURCHASE_INFO_${menuCode == 'SD-TaskCenter' ? 'S' : 'G'}_SIDE_TASK_FLAG`
      ].map((item) => {
        return { label: item.description, value: item.value };
      });
    }
    staticData.selectOptions = optinos;
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
      <div className={styles.container_buttons}>
        <Button
          type="primary"
          style={{
            marginRight: 16,
            borderRadius: 5,
          }}
          className={isButtonsDisable('TC-PZ-XZ') ? styles.disableBtn : ''}
          onClick={() => {
            if (!isButtonsDisable('TC-PZ-XZ', true)) {
              onDrawerChange('create', true);
            }
          }}
        >
          新增
        </Button>
        <Button
          type="primary"
          style={{
            marginRight: 16,
            borderRadius: 5,
          }}
          className={isButtonsDisable('TC-PZ-DR') ? styles.disableBtn : ''}
          onClick={() => {
            if (!isButtonsDisable('TC-PZ-DR', true)) {
              setState({ exportShow: true });
            }
          }}
        >
          导入
        </Button>
        <Button
          type="primary"
          style={{
            marginRight: 16,
            borderRadius: 5,
          }}
          onClick={() => {
            setState({ showGraph: true });
          }}
        >
          依赖配置
        </Button>
      </div>
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
        closeTitle={`确定要退出${staticData.editingKey == 'create' ? '新增' : '编辑'}吗？`}
        drawerProps={{
          width: '40%',
          title: `任务配置/任务管理/${staticData.editingKey == 'create' ? '新增' : '编辑'}`,
          visible: state.visible,
        }}
        data={staticData.selectData}
        onDrawerChange={onDrawerChange}
        ref={drawerRef}
      >
        {['edit', 'create'].includes(staticData.editingKey) ? (
          <TREditForm
            columns={filterColumns(columns)}
            closeTitle={`确定要退出${staticData.editingKey == 'create' ? '新增' : '编辑'}吗？`}
            data={staticData.selectData}
            editingKey={staticData.editingKey}
            onSave={onSave}
            {...staticData.selectOptions}
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
        title={`任务配置/任务管理/任务依赖配置`}
        onClose={() =>
          setState({
            showGraph: false,
          })
        }
        visible={state.showGraph}
        getContainer={false}
        destroyOnClose={true}
      >
        <div className={styles.drawer}>
          {state.showGraph && <GraphConfig buttonsFunc={isButtonsDisable} />}
        </div>
      </Drawer>
      <ExcelModel
        visible={state.exportShow}
        setVisible={() => {
          setState({ exportShow: false });
          onFetch();
        }}
      />
    </div>
  );
};
export default connect(
  ({ global }) => ({
    buttonPermissions: global?.configure?.buttonPermissions,
    menuCode: global?.configure?.menuCode,
  }),
  null,
  null,
  { forwardRef: true },
)(TaskManage);

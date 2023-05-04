import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import styles from './index.less';
import TRQuery from '@/components/TRQuery';
import { Button, message } from 'antd';
import { useStaticState, useTRState } from '#/utils/trHooks';
import { getColumns, columns } from './helper';
import { HttpCode } from '#/utils/contacts';
import { ACTION_ENUM } from '@/pages/SyncService/hepler';
import TRDrawer from '@/components/TRDrawer';
import TRTable from '@/components/TRTable';
import TREditForm from '@/components/TREditForm';
import {
  getServiceByPage,
  addOrUpdate,
  delServiceById,
  getBindPageRegionList,
  getTaskList,
} from '@/services/TaskCenter';
import { connect } from 'dva';
import Message from '@/components/TRMessage';

const TaskServiceList = (props = {}) => {
  const { buttonPermissions = [] } = props;
  const drawerRef = useRef(null);
  const [state, setState] = useTRState({
    loading: false,
    visible: false,
  });
  const staticData = useStaticState({
    buttonPermissionsObj: { editing: 'TS-ServiceConfig-add', del: 'TS-ServiceConfig-del' },
    selectData: {},
    dataObj: {},
    filterData: {},
    regionData: {},
    taskData: {},
    total: 0,
    pageSize: 20,
    current: 1,
    editingKey: '',
  });

  const onFetchGetData = async () => {
    setState({
      loading: true,
    });
    let currentPage = staticData.current;
    if (!Object.keys(staticData.dataObj)?.length && staticData.current > 1) {
      currentPage = staticData.current - 1;
    }
    const params = {
      ...staticData.filterData,
      size: staticData.pageSize,
      currentPage,
    };
    let res = await getServiceByPage(params);
    staticData.dataObj = {};
    staticData.total = 0;
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.total = res?.total || 0;
      res?.data?.forEach((d, i) => {
        let task = [];
        d?.task?.forEach((t) => {
          task.push(t?.taskCode || '');
        });
        staticData.dataObj[d?.id] = _.cloneDeep({
          ...d,
          taskIds: d?.task || [],
          task,
          sort: i,
          regionName: staticData.regionData[d?.regionCode]?.label ?? '-',
          updateBy: '',
        });
      });
    }
    setState({
      loading: false,
    });
  };

  const onDrawerChange = (editingKey = '', show = false) => {
    staticData.editingKey = editingKey;
    if (!show) {
      staticData.selectData = {};
    }
    setState({
      visible: show,
    });
  };

  const onDelete = async () => {
    setState({
      loading: true,
    });
    let res = await delServiceById(staticData.selectData?.id ?? '');
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success('删除成功');
      delete staticData.dataObj[staticData.selectData.id];
      onFetchGetData();
    } else {
      setState({
        loading: false,
      });
      message.error(res?.message ?? '删除失败');
    }
  };

  const operationChange = (type = '', obj = {}) => {
    staticData.selectData = _.cloneDeep(obj);
    if (type === 'edit') {
      if (staticData.editingDisable) {
        Message.info('请联系管理员获取相关权限');
        return;
      }
      onDrawerChange(type, true);
    } else if (type === 'delete') {
      if (staticData.delDisable) {
        Message.info('请联系管理员获取相关权限');
        return;
      }
      onDelete();
    }
  };

  const onSave = (params = {}) => {
    return addOrUpdate(params);
  };

  const getFetchs = () => {
    return onFetchGetTaskList();
  };

  const onFetchGetRegion = async () => {
    let res = await getBindPageRegionList();
    if (res?.statusCode === HttpCode.SUCCESS) {
      res?.xiaoShouYiMapBodyList?.forEach((x) => {
        staticData.regionData[x?.code] = {
          ...x,
          value: x?.code || '',
        };
      });
    }
  };

  const onFetchGetTaskList = async () => {
    const params = {
      current: 1,
      size: 100000000,
    };
    let res = await getTaskList(params);
    return {
      ...res,
      codeKey: 'taskObj',
    };
  };

  const onFetch = async () => {
    await onFetchGetRegion();
    onFetchGetData();
  };

  useEffect(() => {
    staticData.editingDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.editing,
    )?.length;
    staticData.delDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.del,
    )?.length;
    onFetch();
  }, []);

  return (
    <div className={styles.container}>
      <TRQuery
        onFetchGetData={(data = {}) => {
          staticData.filterData = _.cloneDeep(data);
          staticData.current = 1;
          onFetchGetData();
        }}
        loading={state.loading}
        filterList={[
          {
            label: 'searchName',
            type: 'input',
            placeholder: '请输入服务名称',
          },
        ]}
      />
      <div className={styles.container_main}>
        <div className={styles.container_main_title}>
          <span />
          <Button
            type={'primary'}
            disabled={state.loading}
            className={staticData.editingDisable ? styles.disableBtn : ''}
            onClick={() => {
              if (staticData.editingDisable) {
                Message.info('请联系管理员获取相关权限');
                return;
              }
              onDrawerChange('create', true);
            }}
            style={{ borderRadius: 5 }}
          >
            新增
          </Button>
        </div>
        <TRTable
          loading={state.loading}
          columns={getColumns({
            onChange: operationChange,
            staticData: staticData,
          })}
          dataSource={Object.values(staticData.dataObj)?.sort((a, b) => a.sort - b.sort)}
          pagination={{
            total: staticData.total,
            pageSize: staticData.pageSize,
            current: staticData.current,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (current, pageSize) => {
              staticData.pageSize = pageSize;
              staticData.current = current;
              onFetchGetData();
            },
          }}
        />
      </div>
      <TRDrawer
        closeTitle={`确定要退出${ACTION_ENUM[staticData.editingKey]}吗？`}
        drawerProps={{
          width: '40%',
          title: `服务配置/服务列表/${ACTION_ENUM[staticData.editingKey]}`,
          visible: state.visible,
        }}
        data={staticData.selectData}
        onDrawerChange={onDrawerChange}
        ref={drawerRef}
      >
        {['edit', 'create'].includes(staticData.editingKey) ? (
          <TREditForm
            columns={columns}
            editingKey={staticData.editingKey}
            closeTitle={`确定要退出${ACTION_ENUM[staticData.editingKey]}吗？`}
            data={staticData.selectData}
            regionNameObj={staticData.regionData}
            onSave={onSave}
            getFetchs={getFetchs}
            onDrawerChange={async (bool = false) => {
              await onDrawerChange();
              if (bool) onFetchGetData();
            }}
            formDataUpdata={(data) => {
              staticData.selectData = _.cloneDeep(data);
              drawerRef?.current?.formDataUpdata?.(data);
            }}
          />
        ) : null}
      </TRDrawer>
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
)(TaskServiceList);

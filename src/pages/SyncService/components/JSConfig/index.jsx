import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import styles from '@/pages/SyncService/index.less';
import { HttpCode } from '#/utils/contacts';
import { useStaticState, useTRState } from '#/utils/trHooks';
import { Button, message } from 'antd';
import { getJsExtensionsByPage, delJsExtensionsById, addOrUpdate } from '@/services/SyncService';
import { getColumns, columns, COMMONLIB_ENUM } from './helper';
import { ACTION_ENUM } from '@/pages/SyncService/hepler';
import TRQuery from '@/components/TRQuery';
import TRDrawer from '@/components/TRDrawer';
import TREditForm from '@/components/TREditForm';
import TRTable from '@/components/TRTable';
import { connect } from 'dva';
import Message from '@/components/TRMessage';

const JSConfig = (props = {}) => {
  const { buttonPermissions = [] } = props;
  const drawerRef = useRef(null);
  const [state, setState] = useTRState({
    loading: false,
    visible: false,
  });
  const staticData = useStaticState({
    buttonPermissionsObj: { editing: 'SS-jsExtensions-add', del: 'SS-jsExtensions-del' },
    filterData: {},
    dataObj: {},
    selectData: {},
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
    let res = await getJsExtensionsByPage(params);
    staticData.total = 0;
    staticData.dataObj = {};
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.total = res?.total || 0;
      res?.data?.forEach((d, i) => {
        staticData.dataObj[d?.id] = _.cloneDeep({
          ...d,
          operateBy: '',
          sort: i,
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
    let res = await delJsExtensionsById(staticData.selectData?.id ?? '');
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

  const onSave = (params = {}) => {
    return addOrUpdate(params);
  };

  const operationChange = (type = '', obj = {}) => {
    staticData.selectData = _.cloneDeep(obj);
    if (['edit'].includes(type)) {
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

  useEffect(() => {
    staticData.editingDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.editing,
    )?.length;
    staticData.delDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.del,
    )?.length;
    onFetchGetData();
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
            placeholder: '请输入名称',
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
          columns={getColumns({
            onChange: operationChange,
            staticData: staticData,
          })}
          dataSource={Object.values(staticData.dataObj)?.sort((a, b) => a.sort - b.sort)}
          loading={state.loading}
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
          title: `JS扩展/${ACTION_ENUM[staticData.editingKey]}`,
          visible: state.visible,
        }}
        data={staticData.selectData}
        onDrawerChange={onDrawerChange}
        ref={drawerRef}
      >
        {['edit', 'create'].includes(staticData.editingKey) ? (
          <TREditForm
            columns={columns}
            commonLibObj={COMMONLIB_ENUM}
            closeTitle={`确定要退出${ACTION_ENUM[staticData.editingKey]}吗？`}
            data={staticData.selectData}
            onSave={onSave}
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
)(JSConfig);

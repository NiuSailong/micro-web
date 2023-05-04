import React, { useEffect, useRef, useContext, useState } from 'react';
import _ from 'lodash';
import taskStyles from './index.less';
import styles from '@/pages/SyncService/index.less';
import { HttpCode } from '#/utils/contacts';
import { useStaticState, useTRState } from '#/utils/trHooks';
import { Button, Form, Input, Table, Modal, message, Select } from 'antd';
import Message from '@/components/TRMessage';
import {
  getInstanceByPage,
  delInstance,
  runInstance,
  getInstanceLogByPage,
  getDictionaryByCode,
  instanceAddOrUpdate,
} from '@/services/SyncService';
import { getColumns, columns, getEditColumns, getLogColumns } from './helper';
import { ACTION_ENUM } from '@/pages/SyncService/hepler';
import moment from 'moment';
const EditableContext = React.createContext(null);

import TRQuery from '@/components/TRQuery';
import TRTable from '@/components/TRTable';
import TRDrawer from '@/components/TRDrawer';
import TREditForm from '@/components/TREditForm';
import { connect } from 'dva';

// 关联参数
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = (props = {}) => {
  const {
    isRule,
    editable,
    parameterTypeObj,
    handleSave,
    editing,
    operationType,
    children,
    dataIndex,
    record,
    title,
    label,
    ...restProps
  } = props;
  const selectDataObj = {
    typeObj: parameterTypeObj,
  };
  const [editingKey, setEditingKey] = useState(editing);
  const inputRef = useRef(null),
    textareaRef = useRef(null),
    selectRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editingKey && operationType !== 'add') {
      inputRef?.current?.focus?.();
      textareaRef?.current?.focus?.();
      selectRef?.current?.focus?.();
    }
  }, [editingKey]);
  const toggleEdit = () => {
    setEditingKey(!editingKey);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      // console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editingKey ? (
      <React.Fragment>
        {label === 'input' ? (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={
              isRule
                ? [
                    {
                      required: true,
                      message: `请输入${title}`,
                    },
                  ]
                : null
            }
          >
            <Input ref={inputRef} onBlur={save} />
          </Form.Item>
        ) : null}
        {label === 'textarea' ? (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={
              isRule
                ? [
                    {
                      required: true,
                      message: `请输入${title}`,
                    },
                  ]
                : null
            }
          >
            <Input.TextArea
              ref={textareaRef}
              onBlur={save}
              style={{ maxHeight: 32, height: 32, resize: 'none' }}
            />
          </Form.Item>
        ) : null}
        {label === 'select' ? (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={
              isRule
                ? [
                    {
                      required: true,
                      message: `请选择${title}`,
                    },
                  ]
                : null
            }
          >
            <Select ref={selectRef} onBlur={save}>
              {Object.values(selectDataObj[`${dataIndex}Obj`] || {})?.map((d) => {
                return (
                  <Select.Option key={d?.value ?? ''} value={d?.value ?? ''}>
                    {d?.title ?? ''}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        ) : null}
      </React.Fragment>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const EditTable = (props = {}) => {
  const { data = {}, parameterTypeObj = {}, editTableChange } = props;
  const [state, setState] = useTRState({
    dataSource: data?.param
      ? data?.param?.map((d) => {
          return { ...d, newId: d?.id ?? '' };
        })
      : [{ newId: String(moment().valueOf()), operationType: 'add' }],
    count: data?.param?.length || 1,
  });

  const staticData = useStaticState({
    editDataSource: {},
  });

  useEffect(() => {
    state.dataSource?.forEach((d) => {
      staticData.editDataSource[d.newId] = { ...d };
    });
    editTableChange?.(state.dataSource || []);
  }, []);

  const handleAdd = () => {
    const _key = moment().valueOf();
    const newData = {
      newId: String(_key),
      operationType: 'add',
    };
    const list = [].concat(state.dataSource, [newData]);

    staticData.editDataSource[newData.newId] = { ...newData };
    editTableChange?.(Object.values(staticData.editDataSource));
    setState({
      dataSource: _.cloneDeep(list),
      count: state.count + 1,
    });
  };

  const handleSave = (row = {}) => {
    const newData = _.cloneDeep(state.dataSource);
    const index = newData.findIndex((item) => row.newId === item.newId);
    const item = newData[index];
    if (_.isEqual(item, row)) return;
    const editDataObj = {
      ...item,
      ...row,
      operationType: item?.operationType ? item?.operationType : 'edit',
    };
    newData.splice(index, 1, editDataObj);
    staticData.editDataSource[row?.newId] = { ...editDataObj };
    editTableChange?.(Object.values(staticData.editDataSource));
    setState({
      dataSource: newData,
    });
  };

  const handleDelete = (data = {}) => {
    if (staticData.editDataSource[data.newId].operationType === 'add') {
      delete staticData.editDataSource[data.newId];
    } else {
      staticData.editDataSource[data.newId].operationType = 'del';
    }
    editTableChange?.(Object.values(staticData.editDataSource));
    setState({
      dataSource: state.dataSource?.filter((df) => df.newId !== data?.newId),
    });
  };

  const onChange = (type = '', data = {}) => {
    if (type === 'delete') {
      handleDelete(data);
    }
  };

  const isEditing = (record) => record?.operationType === 'add';
  const mergerColumns = _.cloneDeep(
    getEditColumns({ onChange, handleSave, isEditing, parameterTypeObj }),
  );
  return (
    <div className={taskStyles.editTable}>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
          borderRadius: 5,
        }}
      >
        新增
      </Button>
      <Table
        rowKey="newId"
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        rowClassName={taskStyles.editable_row}
        bordered
        dataSource={state.dataSource}
        columns={mergerColumns}
        pagination={false}
        scroll={{
          y: 300,
        }}
      />
    </div>
  );
};
// 日志
const DrawerLogCom = (props = {}) => {
  const { data = {} } = props;
  const [state, setState] = useTRState({
    loading: false,
  });
  const staticData = useStaticState({
    data: [],
    pageSize: 20,
    current: 1,
    total: 0,
  });

  const onFetchGetData = async () => {
    setState({
      loading: true,
    });
    const params = {
      size: staticData.pageSize,
      currentPage: staticData.current,
      searchName: data?.id ?? '',
    };
    let res = await getInstanceLogByPage(params);
    staticData.data = [];
    staticData.total = 0;
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.data = res?.data || [];
      staticData.total = res?.total || 0;
    }
    setState({
      loading: false,
    });
  };

  useEffect(() => {
    onFetchGetData();
  }, []);

  return (
    <div className={taskStyles.logTable}>
      <TRTable
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
        loading={state.loading}
        columns={getLogColumns()}
        dataSource={staticData.data}
      />
    </div>
  );
};

const TaskConfig = (props = {}) => {
  const { buttonPermissions = [] } = props;
  const formRef = useRef(null),
    drawerRef = useRef(null);
  const [state, setState] = useTRState({
    loading: false,
    visible: false,
    open: false,
    confirmLoading: false,
  });
  const staticData = useStaticState({
    buttonPermissionsObj: {
      editing: 'SS-InstaceConfig-add',
      del: 'SS-InstaceConfig-del',
      execute: 'SS-InstaceConfig-execute',
    },
    filterData: {},
    dataObj: {},
    selectData: {},
    programmeObj: {},
    triggerTypeObj: {},
    parameterTypeObj: {},
    pageSize: 20,
    current: 1,
    total: 0,
    editingKey: '',
    implementInner: '',
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
    let res = await getInstanceByPage(params);
    staticData.dataObj = {};
    staticData.total = 0;
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.total = res?.total || 0;
      res?.data?.forEach((d, i) => {
        staticData.dataObj[d?.id] = _.cloneDeep({
          ...d,
          programme: staticData.programmeObj[d?.itemId]?.title ?? '',
          operateByName: d?.operateBy ?? '-',
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
    let res = await delInstance(staticData.selectData?.id ?? '');
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
    if (type === 'log') {
      onDrawerChange(type, true);
    } else if (type === 'edit') {
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
    } else if (type === 'implement') {
      if (staticData.executeDisable) {
        Message.info('请联系管理员获取相关权限');
        return;
      }
      setState({
        open: true,
      });
    }
  };

  const handleOk = async () => {
    setState({
      confirmLoading: true,
    });
    let res = await runInstance(staticData.implementInner ?? '', staticData.selectData?.id ?? '');
    if (res?.statusCode === HttpCode.SUCCESS) {
      setState({
        open: false,
      });
      staticData.selectData = {};
      message.success('执行成功');
    } else {
      message.error(res?.message ?? '执行失败');
    }
    setState({
      confirmLoading: false,
    });
  };

  const handleCancel = () => {
    staticData.selectData = {};
    setState({
      open: false,
    });
  };

  const onFetchProgramme = async () => {
    let res = await getDictionaryByCode('SYNC_INSTANCE_ITEM');
    if (res?.statusCode === HttpCode.SUCCESS) {
      res?.treeList?.forEach((t) => {
        staticData.programmeObj[t?.value] = {
          ...t,
          label: t?.title ?? '-',
        };
      });
    }
  };

  const onFetchTriggerType = async () => {
    let res = await getDictionaryByCode('SYNC_TRIGGER_TYPE');
    if (res?.statusCode === HttpCode.SUCCESS) {
      res?.treeList?.forEach((t) => {
        staticData.triggerTypeObj[t?.value] = {
          ...t,
          label: t?.title ?? '-',
        };
      });
    }
  };

  const onFetchParameterType = async () => {
    let res = await getDictionaryByCode('SYNC_PARAM_TYPE');
    if (res?.statusCode === HttpCode.SUCCESS) {
      res?.treeList?.forEach((t) => {
        staticData.parameterTypeObj[t?.value] = {
          ...t,
          label: t?.title ?? '-',
        };
      });
    }
  };

  const onSave = (params = {}) => {
    return instanceAddOrUpdate(params);
  };

  const editTableChange = (list = []) => {
    if (!list?.length) delete staticData.selectData.param;
    else staticData.selectData.param = _.cloneDeep(list);
    drawerRef?.current?.formDataUpdata?.(staticData.selectData);
    formRef?.current?.formUpdata?.(staticData.selectData);
  };

  const onFetch = async () => {
    staticData.editingDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.editing,
    )?.length;
    staticData.delDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.del,
    )?.length;
    staticData.executeDisable = !buttonPermissions?.filter(
      (b) => b.menuCode === staticData.buttonPermissionsObj.execute,
    )?.length;
    onFetchTriggerType();
    onFetchParameterType();
    await onFetchProgramme();
    onFetchGetData();
  };

  useEffect(() => {
    onFetch();
  }, []);

  return (
    <div className={`${styles.container} ${taskStyles.taskConfig}`}>
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
          width: '90%',
          title: `任务配置/${ACTION_ENUM[staticData.editingKey]}`,
          visible: state.visible,
        }}
        data={staticData.selectData}
        onDrawerChange={onDrawerChange}
        ref={drawerRef}
      >
        {staticData.editingKey === 'log' ? <DrawerLogCom data={staticData.selectData} /> : null}
        {['edit', 'create'].includes(staticData.editingKey) ? (
          <TREditForm
            ref={formRef}
            columns={columns}
            closeTitle={`确定要退出${ACTION_ENUM[staticData.editingKey]}吗？`}
            data={staticData.selectData}
            programmeObj={staticData.programmeObj}
            triggerTypeObj={staticData.triggerTypeObj}
            parameterTypeObj={staticData.parameterTypeObj}
            onSave={onSave}
            onDrawerChange={async (bool = false) => {
              await onDrawerChange();
              if (bool) onFetch();
            }}
            formDataUpdata={(data = {}) => {
              staticData.selectData = _.cloneDeep(data);
              drawerRef?.current?.formDataUpdata?.(data);
            }}
          >
            <Form.Item
              label={''}
              name={'param'}
              rules={[
                {
                  required: true,
                  message: '',
                  type: 'array',
                },
                () => ({
                  validator(_, value) {
                    let flag = true;
                    flag = !value?.filter((rv) => !rv.name || !rv.type || !rv.content)?.length;
                    if (flag) return Promise.resolve();
                    return Promise.reject();
                  },
                }),
              ]}
            >
              <EditTable
                data={staticData.selectData}
                parameterTypeObj={staticData.parameterTypeObj}
                editTableChange={editTableChange}
              />
            </Form.Item>
          </TREditForm>
        ) : null}
      </TRDrawer>
      <Modal
        title="执行"
        maskClosable={false}
        visible={state.open}
        confirmLoading={state.confirmLoading}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
      >
        <Input.TextArea
          placeholder="请输入..."
          style={{ height: 380, maxHeight: 380, minHeight: 380, resize: 'none' }}
          onChange={(e) => (staticData.implementInner = e?.target?.value ?? '')}
        />
      </Modal>
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
)(TaskConfig);

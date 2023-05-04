import React, { useEffect, useContext, useRef } from 'react';
import { Form, Table, Button, Input, Row, message, Modal, Drawer, Space } from 'antd';
import { useTRState, useStaticState } from '#/utils/trHooks';
import { useSize } from 'ahooks';
import { columnsFn, editColumnsFn, formMap } from './helper';
import { EditableRow, EditableCell } from '../editTable';
import {
  DataSourceManageSelect,
  DataSourceManageEdit,
  // DataSourceManagedelete,
  getDictionaryValue,
} from '@/services/PowerStation';
import { HttpCode } from '#/utils/contacts';
import { DRAWERTITLE_ENMU } from '../helper';
import _ from 'lodash';
import styles from './index.less';
import TRForm from '../TRForm';
import { BtnPerContent } from '@/pages/PowerStation';
import TRButton from '#/components/TRButton';

const EditableContext = React.createContext(null);
const { confirm } = Modal;

function DataSourceManage() {
  const [editForm] = Form.useForm(); // 编辑/新增表单

  const contentRef = useRef(null);
  const size = useSize(contentRef);
  let formTable = {}; // 编辑/新增表格

  const btnPer = useContext(BtnPerContent); // 按钮权限
  useEffect(() => {
    featch({});
  }, []);
  /**** state ****/
  const [state, setState] = useTRState({
    visible: false,
    editTableData: [], // 编辑/新增 表格数据
    loading: false, // 页面查询 loading
    btnLoading: false, // 拉扇按钮 loading
    error: '', // 报错信息
  });
  const staticState = useStaticState({
    defaultData: [],
    dataList: [], // 列表数据
    searchDataSourceName: '', // 查询的数据源名称
    keyCount: 0, // 编辑/新增 表格新增 key 计数器
    drawerObj: {}, // 编辑 回填数据
    selectDataObj: [], // 新增/编辑 select Option
  });

  useEffect(() => {
    if (state.visible) {
      showDrawerFn();
    }
  }, [state.visible]);

  async function featch({ currentPage = 1 }) {
    setState({ loading: true });
    const params = { search: staticState.searchDataSourceName, currentPage, size: 9999 };
    const res = await DataSourceManageSelect(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      const dealData = [];
      (res?.data || [])?.forEach((v) => {
        const obj = { dsName: v.dsName, dsId: v.dsId };
        if (v.children?.length) {
          v.children?.map((z) => dealData.push({ ...z, ...obj }));
        } else dealData.push({ ...obj });
      });
      staticState.dataList = dealData;
      staticState.defaultData = res?.data;
    } else {
      message.error(res?.message || '查询失败');
    }
    const resDiction = await getDictionaryValue();
    if (resDiction?.statusCode === HttpCode.SUCCESS) {
      staticState.selectDataObj = resDiction?.treeList.map((v) => ({
        value: v.value,
        label: v.title,
      }));
    }
    setState({ loading: false });
  } // 初始化查询接口&查询接口

  const searchChange = (value) => {
    staticState.searchDataSourceName = value?.target?.value;
  }; // 查询 Input Change
  const searchClick = () => {
    featch({});
  }; // 查询
  const addFn = () => {
    staticState.drawerObj = { titleKey: 'add', data: {} };
    setState({ visible: true });
  }; // 新增
  const editFn = (data) => {
    staticState.drawerObj = { titleKey: 'edit', data };
    setState({ visible: true });
  }; // 编辑
  // const deleteFn = async (dsId) => {
  //   const res = await DataSourceManagedelete(dsId);
  //   if (res?.statusCode === HttpCode.SUCCESS) {
  //     message.success('删除成功');
  //     featch({});
  //   } else {
  //     message.error('删除失败');
  //   }
  // }; // 父数据源删除

  /*****  拉扇操作  *****/
  const closeFn = () => {
    const data = staticState.drawerObj.data;
    state.editTableData?.forEach((v) => delete v?.key);
    const editData = Object.assign(
      {
        ...editForm.getFieldsValue(),
        children: state.editTableData,
      },
      data.dsId ? { dsId: data.dsId } : {},
    );
    if (_.isEqual(data, editData)) {
      setState({ visible: false });
    } else {
      confirm({
        title: `确定要退出${DRAWERTITLE_ENMU[staticState.drawerObj.titleKey]}吗？`,
        onOk() {
          setState({ visible: false });
        },
      });
    }
  }; // 关闭
  const showDrawerFn = () => {
    const { dsName = '', children = [], valid = true } = staticState.drawerObj?.data;
    let editTable = [...children];
    editForm.setFieldsValue({ dsName, valid });
    staticState.keyCount = editTable?.length;
    if (staticState.drawerObj.titleKey === 'add') {
      editTable = [
        {
          dataSourceName: '',
          dataSourceUrl: '',
          dataSourceToken: '',
          accessType: staticState.selectDataObj?.[0]?.value,
          deleteFlag: false,
        },
      ];
      staticState.drawerObj.data = { ...editForm.getFieldsValue(), children: editTable };
    }
    setState({ editTableData: editTable?.map((v, i) => ({ ...v, key: i })) });
  }; // 拉扇打开执行

  /*****  编辑/新增表单  *****/
  const handleSave = (row) => {
    const newData = [...state.editTableData];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setState({ editTableData: [...newData] });
  }; // 子数据源修改
  const handleAdd = () => {
    staticState.keyCount += 1;
    const newData = {
      key: staticState.keyCount,
      dataSourceName: '',
      dataSourceUrl: '',
      dataSourceToken: '',
      accessType: staticState.selectDataObj?.[0]?.value,
      deleteFlag: false,
    };
    setState({ editTableData: [...state.editTableData, newData] });
  }; // 子数据源新增
  // const handleDelete = (key) => {
  //   const newData = state.editTableData?.filter((item) => item.key !== key);
  //   setState({ editTableData: newData });
  // }; // 子数据源删除
  const validateFieldsFn = (formObj) => {
    return Object.keys(formObj).map((v) => {
      return formObj[v].validateFields();
    });
  }; // 表单验证
  const serveFn = async () => {
    await editForm.validateFields();
    await Promise.all(validateFieldsFn(formTable));
    const { data, titleKey } = staticState.drawerObj;
    if (!state.editTableData?.length) {
      message.error('至少有一条子数据');
      return;
    }
    setState({ btnLoading: true });
    const params = {
      dsId: data?.dsId || null,
      ...editForm.getFieldsValue(),
      children: state.editTableData?.map((v) => ({ ...v, ...editForm.getFieldsValue() })),
    };
    const res = await DataSourceManageEdit(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(`${DRAWERTITLE_ENMU[titleKey]}成功`);
      setState({ visible: false });
      featch({});
    } else {
      message.error(res?.message || `${DRAWERTITLE_ENMU[titleKey]}失败`);
    }
    setState({ btnLoading: false });
  }; // 编辑/新增 保存

  const EditableRow = (props) => {
    formTable[props['data-row-key']] = Form.useForm()[0]; // 编辑/新增表格
    return (
      <Form form={formTable[props['data-row-key']]} component={false} autoComplete="off">
        <EditableContext.Provider value={formTable[props['data-row-key']]}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  // form Render
  function RenderForm() {
    const components = {
      body: {
        row: EditableRow,
        cell: (props) => EditableCell({ EditableContext, handleSave, ...props }),
      },
    };
    return (
      <>
        <Form name="form_item_path" layout="vertical" form={editForm} autoComplete="off">
          <Row gutter={24}>
            {formMap(staticState.dataList, staticState.drawerObj.titleKey).map((props, ind) => (
              <TRForm {...props} key={ind} />
            ))}
          </Row>
        </Form>
        <div className={styles.editForm_table}>
          <Button
            type="primary"
            className={styles.editForm_table_add}
            onClick={handleAdd}
            loading={state.btnLoading}
          >
            新增
          </Button>
          <Table
            pagination={{ defaultCurrent: 1, defaultPageSize: 5 }}
            components={components}
            rowClassName={styles.editForm_table_editableRow}
            rowKey="key"
            columns={editColumnsFn({
              handleSave,
              selectDataObj: staticState.selectDataObj,
              tableData: state.editTableData,
            })}
            dataSource={state.editTableData}
            scroll={{ x: 'max-content' }}
            bordered
          />
        </div>
      </>
    );
  }
  return (
    <>
      <div className={styles.dataSourceManage_header}>
        <Input placeholder="搜索" onChange={searchChange} style={{ width: '200px' }} />
        <Button type="primary" onClick={searchClick} loading={state.loading}>
          查询
        </Button>
      </div>
      <div className={styles.dataSourceManage_content} ref={contentRef}>
        <div className={styles.dataSourceManage_content_add}>
          <TRButton
            type="primary"
            onClick={addFn}
            loading={state.loading}
            buttonPermissions={btnPer}
            menuCode={'PS-DataSource-add'}
          >
            新建
          </TRButton>
        </div>
        <Table
          pagination={false}
          loading={state.loading}
          rowKey="dataSourceId"
          columns={columnsFn({
            defaultData: staticState.defaultData,
            dataList: staticState.dataList,
            editFn,
            btnPer,
          })}
          scroll={{ x: 'max-content', y: size?.height ? size?.height - 80 - 55 : 500 }}
          dataSource={staticState.dataList}
          bordered
        />
        <Drawer
          width="90%"
          title={`数据源管理/${DRAWERTITLE_ENMU[staticState.drawerObj.titleKey]}`}
          placement="right"
          onClose={closeFn}
          visible={state.visible}
          getContainer={false}
          destroyOnClose={true}
          maskClosable={false}
        >
          <div className={styles.DrawerCom_content}>
            <div className={styles.DrawerCom_content_form}>{RenderForm()}</div>
            <div className={styles.DrawerCom_content_btn}>
              <Space>
                <Button type="primary" onClick={serveFn} loading={state.btnLoading}>
                  提交
                </Button>
                <Button onClick={closeFn} loading={state.btnLoading}>
                  返回
                </Button>
              </Space>
            </div>
          </div>
        </Drawer>
      </div>
    </>
  );
}
export default DataSourceManage;

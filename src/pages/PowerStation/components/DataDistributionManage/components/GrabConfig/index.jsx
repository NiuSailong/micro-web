import React, { useEffect, useContext, useRef } from 'react';
import { Form, Table, Button, Input, Row, message, Modal, Drawer, Space } from 'antd';
import { useTRState, useStaticState } from '#/utils/trHooks';
import { useSize } from 'ahooks';
import { columnsFn, editColumnsFn, formMap } from './helper';
import { EditableRow, EditableCell } from '@/pages/PowerStation/components/editTable';
import { QueryConfigSelect, QueryConfigeEdit } from '@/services/PowerStation';
import { HttpCode } from '#/utils/contacts';
import { DRAWERTITLE_ENMU } from '@/pages/PowerStation/components/helper';
import _ from 'lodash';
import TRForm from '../../../TRForm';
import { BtnPerContent } from '@/pages/PowerStation';
import TRButton from '#/components/TRButton';
import styles from './index.less';
import moment from 'moment';

const EditableContext = React.createContext(null);
const { confirm } = Modal;
function GrabConfig({ options }) {
  const { idOption, dataSourceOption, dataSourceMap } = options;

  let formTable = {}; // 编辑/新增表格
  const [editForm] = Form.useForm(); // 编辑/新增表单
  const btnPer = useContext(BtnPerContent); // 按钮权限
  const contentRef = useRef(null);
  const size = useSize(contentRef);

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
  });
  useEffect(() => {
    if (state.visible) {
      showDrawerFn();
    }
  }, [state.visible]);

  async function featch({ currentPage = 1 }) {
    setState({ loading: true });
    const params = { search: staticState.searchDataSourceName, currentPage, size: 9999 };
    const res = await QueryConfigSelect(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      const dealData = [];
      (res?.data || [])?.forEach((v) => {
        const obj = { stationName: v.stationName, stationId: v.stationId };
        if (v.children?.length) {
          v.children?.map((z) => dealData.push({ ...z, ...obj }));
        } else dealData.push({ ...obj });
      });
      staticState.dataList = dealData;
      staticState.defaultData = res?.data;
    } else {
      message.error(res?.message || '查询失败');
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
    staticState.drawerObj = { titleKey: 'add', data: [] };
    setState({ visible: true });
  }; // 新增
  const editFn = (data) => {
    staticState.drawerObj = { titleKey: 'edit', data };
    setState({ visible: true });
  }; // 编辑

  /*****  拉扇操作  *****/
  const closeFn = () => {
    const data = staticState.drawerObj.data;
    state.editTableData?.forEach((v) => delete v?.key);
    const editData = {
      ...data,
      ...editForm.getFieldsValue(),
      children: state.editTableData,
    };
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
    const { children = [], stationId = '' } = staticState.drawerObj?.data;
    editForm.setFieldsValue({ stationId });
    let editTable = [...children];
    staticState.keyCount = editTable?.length;
    if (staticState.drawerObj.titleKey === 'add') {
      editTable = [
        {
          dataSource: '',
          queryDays: '15',
          lineLoss: '0.03',
          type: 'power',
          effectiveBeginDate: '',
          effectiveEndDate: '',
          defaultBeginDate: '',
          defaultEndDate: '',
        },
      ];
      staticState.drawerObj.data = { ...editForm.getFieldsValue(), children: editTable };
    }
    setState({ editTableData: editTable?.map((v, i) => ({ ...v, key: i })) });
  }; // 拉扇打开执行

  /*****  编辑/新增表单  *****/
  const formatRow = (row) => {
    const values = { ...row };
    values.dataSource =
      values.dataSource instanceof Array ? values.dataSource?.[1] : values.dataSource;
    ['effectiveBeginDate', 'effectiveEndDate', 'defaultBeginDate', 'defaultEndDate'].forEach(
      (v) => {
        values[v] = values[v] ? moment(values[v]).format('YYYY-MM-DD') : '';
      },
    );
    return values;
  };
  const handleSave = (row) => {
    const rowObj = formatRow(row);
    const newData = [...state.editTableData];
    const index = newData.findIndex((item) => rowObj.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...rowObj });
    setState({ editTableData: [...newData] });
  }; // 子数据源修改
  const handleAdd = async () => {
    staticState.keyCount += 1;
    const newData = {
      key: staticState.keyCount,
      dataSource: '',
      queryDays: '15',
      lineLoss: '0.03',
      type: 'power',
      effectiveBeginDate: '',
      effectiveEndDate: '',
      defaultBeginDate: '',
      defaultEndDate: '',
    };
    setState({ editTableData: [...state.editTableData, newData] });
  }; // 子数据源新增
  const validateFieldsFn = (formObj) => {
    return Object.keys(formObj).map((v) => {
      return formObj[v].validateFields();
    });
  }; // 表单验证
  const serveFn = async () => {
    const stationId = await editForm.validateFields();
    await Promise.all(validateFieldsFn(formTable));
    const { titleKey } = staticState.drawerObj;
    setState({ btnLoading: true });
    const nameFn = (key) => dataSourceMap[key];
    const params = {
      ...editForm.getFieldsValue(),
      children: [
        ...state.editTableData.map((v) => ({
          ...v,
          dataSourceName: nameFn(v.dataSource)?.name,
          ...stationId,
        })),
      ],
    };
    const res = await QueryConfigeEdit(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(`${DRAWERTITLE_ENMU[titleKey]}成功`);
      setState({ visible: false });
      featch({});
    } else {
      message.error(res?.message || '保存失败');
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
    const { titleKey } = staticState.drawerObj;
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
            {formMap(staticState.dataList, idOption, titleKey).map((props, ind) => (
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
            scroll={{ x: 'max-content' }}
            pagination={{ defaultCurrent: 1, defaultPageSize: 5 }}
            components={components}
            rowClassName={styles.editForm_table_editableRow}
            rowKey="key"
            columns={editColumnsFn({
              handleSave,
              selectDataObj: dataSourceOption,
              oper: titleKey,
              dataList: state.editTableData,
              dataSourceMap,
            })}
            dataSource={state.editTableData}
            bordered
          />
        </div>
      </>
    );
  }
  return (
    <>
      <div className={styles.grabConfig_header}>
        <Input placeholder="搜索" onChange={searchChange} style={{ width: '200px' }} />
        <Button type="primary" onClick={searchClick} loading={state.loading}>
          查询
        </Button>
      </div>
      <div className={styles.grabConfig_content} ref={contentRef}>
        <div className={styles.grabConfig_content_add}>
          <TRButton
            buttonPermissions={btnPer}
            menuCode={'PS-DataGrab-add'}
            type="primary"
            onClick={addFn}
            loading={state.loading}
          >
            新建
          </TRButton>
        </div>
        <Table
          pagination={false}
          loading={state.loading}
          rowKey={(item) => item.queryConfigId || item.createTime}
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
          title={`抓取配置/${DRAWERTITLE_ENMU[staticState.drawerObj.titleKey]}`}
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
export default GrabConfig;

import React, { useEffect, useContext, useRef } from 'react';
import {
  Form,
  Table,
  Button,
  Input,
  Row,
  message,
  Modal,
  Drawer,
  Space,
  Col,
  Cascader,
} from 'antd';
import { useTRState, useStaticState } from '#/utils/trHooks';
import { useSize } from 'ahooks';
import { columnsFn, editColumnsFn, editAddForm, timeTableColumns } from './helper';
import { EditableCell } from '@/pages/PowerStation/components/editTable';
import {
  ShortTermIssueSelect,
  ShortTermIssueEdit,
  ShortTermIssueDelete,
  ShortTermIssueGetMapper,
} from '@/services/PowerStation';
import { HttpCode } from '#/utils/contacts';
import { DRAWERTITLE_ENMU, rulesArr } from '@/pages/PowerStation/components/helper';
import _ from 'lodash';
import { BtnPerContent } from '@/pages/PowerStation';
import TRButton from '#/components/TRButton';
import moment from 'moment';
import styles from './index.less';
import TRForm from '../../../TRForm';

const EditableContext = React.createContext(null);
const timeTableContext = React.createContext(null);

const { confirm } = Modal;
function DistributionConfig({ options }) {
  const { idOption, dataSourceOption, dataSourceMap } = options;
  let formTable = {},
    timeTableForm = {}; // 编辑/新增 表格
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
    timeTable: [],
    loading: false, // 页面查询 loading
    btnLoading: false, // 拉扇按钮 loading
    editTableLoading: false,
    error: '', // 报错信息
  });
  const staticState = useStaticState({
    defaultData: [],
    dataList: [], // 列表数据
    searchDataSourceName: '', // 查询的数据源名称
    keyCount: 0, // 编辑/新增 表格新增 key 计数器
    timeTableKeyCount: 0, // 下发时间 表格新增 key 计数器
    drawerObj: {}, // 编辑 回填数据
    selectDataObj: {
      stationId: [],
      issueStatus: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    }, // 新增/编辑 select Option
  });

  useEffect(() => {
    if (state.visible) {
      showDrawerFn();
    }
  }, [state.visible]);
  useEffect(() => {
    staticState.selectDataObj.stationId = idOption;
  }, [idOption]);

  async function featch({ currentPage = 1 }) {
    setState({ loading: true });
    const params = { search: staticState.searchDataSourceName, currentPage, size: 9999 };
    const res = await ShortTermIssueSelect(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      const dealData = [];
      (res?.data || [])?.forEach((v) => {
        const obj = { wfId: v.wfId, wfName: v.wfName };
        if (v.children?.length) {
          v.children?.map((z) => dealData.push({ ...v, ...z, ...obj, children: null }));
        } else dealData.push({ ...obj });
      });
      staticState.dataList = dealData?.map((v, i) => ({ ...v, i }));
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
    staticState.drawerObj = { titleKey: 'add', data: {} };
    setState({ visible: true });
  }; // 新增
  const editFn = (data) => {
    staticState.drawerObj = { titleKey: 'edit', data };
    setState({ visible: true });
  }; // 编辑
  const deleteFn = async (wfId) => {
    const res = await ShortTermIssueDelete(wfId);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success('删除成功');
      featch({});
    } else {
      message.error('删除失败');
    }
  }; // 父数据源删除

  /*****  拉扇操作  *****/
  const closeFn = () => {
    const { titleKey } = staticState.drawerObj;
    let data = staticState.drawerObj.data;
    if (titleKey === 'add') {
      data = { ...editForm.getFieldsValue(), children: [], time: [] };
    }
    const children = state.editTableData?.map((v) => {
      delete v?.key;
      delete v?.i;
      return v;
    });
    const time = state.timeTable?.map((v) => {
      delete v?.key;
      return v;
    });
    const formData = editForm.getFieldsValue();
    const editData = {
      ...data,
      ...formData,
      dataSourceId: formData.dataSourceId?.[1] || '',
      children,
      time,
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
    const { data, titleKey } = staticState.drawerObj;
    const { children = [], time = [], dataSourceId } = data;
    let editTable = [...children],
      editTime = [...time];
    const formObj = { wfCapacity: '', wfId: '', dataSourceId: [] };
    if (titleKey === 'add') {
      editTable = [
        {
          coefficient: '',
          stationId: '',
          stationName: '',
          stationCapacity: '',
          issueStatus: true,
        },
      ];
      editTime = [{ issueTime: '', checkTime: '' }];
      editAddForm.map((v) => (formObj[v.dataIndex] = ''));
    }
    const preId = dataSourceMap[dataSourceId]?.preId; // 数据源联级选择回填
    const setForm = titleKey === 'add' ? formObj : { ...data, dataSourceId: [preId, dataSourceId] };
    staticState.keyCount = editTable?.length;
    staticState.timeTableKeyCount = editTime?.length;
    editForm.setFieldsValue(setForm);
    setState({
      editTableData: editTable?.map((v, i) => ({ ...v, key: i })),
      timeTable: editTime?.map((v, i) => ({ ...v, key: i })),
    });
  }; // 拉扇打开执行

  /*****  编辑/新增表单  *****/
  const formatRow = (row) => {
    const values = { ...row };
    ['issueTime', 'checkTime'].forEach((v) => {
      values[v] = values[v] ? moment(values[v]).format('HH:mm:ss') : '';
    });
    return values;
  };
  const handleSave = (row) => {
    const wfCapacity = editForm.getFieldValue('wfCapacity');
    if (row?.stationCapacity && wfCapacity) {
      row.coefficient = row?.stationCapacity / wfCapacity;
    }
    const newData = [...state.editTableData];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setState({ editTableData: [...newData] });
  }; // 子数据源修改
  const timeTableSave = (row) => {
    const rowObj = formatRow(row);
    const newData = [...state.timeTable];
    const index = newData.findIndex((item) => rowObj.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...rowObj });
    setState({ timeTable: [...newData] });
  }; // 下发时间 时间校验 修改
  const handleAdd = () => {
    staticState.keyCount += 1;
    const newData = {
      key: staticState.keyCount,
      coefficient: '',
      stationId: '',
      stationName: '',
      stationCapacity: '',
      originalWfid: '',
      issueStatus: true,
    };
    setState({ editTableData: [...state.editTableData, newData] });
  }; // 子数据源新增
  const handleTimeTableAdd = () => {
    const newData = { issueTime: '', checkTime: '', key: staticState.timeTableKeyCount };
    staticState.timeTableKeyCount += 1;
    setState({ timeTable: [...state.timeTable, newData] });
  }; // 下发时间 时间校验 增加
  const handleGetMap = async () => {
    setState({ editTableLoading: true });
    const id = editForm.getFieldValue('wfId');
    if (!id) return;
    const res = await ShortTermIssueGetMapper(id);
    if (res?.statusCode === HttpCode.SUCCESS) {
      setState({ editTableData: res?.data?.map((v, i) => ({ ...v, key: i })) });
    } else {
      message.error(res?.message || '获取失败');
    }
    setState({ editTableLoading: false });
  }; // 获取场站下发配置
  const handleDelete = (key) => {
    const newData = state.editTableData?.filter((item) => item.key !== key);
    setState({ editTableData: newData });
  }; // 子数据源删除
  const timetableDel = (key) => {
    const newData = state.timeTable?.filter((item) => item.key !== key);
    setState({ timeTable: [...newData] });
  }; // 下发时间 时间校验 表格删除
  const validateFieldsFn = (formObj) => {
    return Object.keys(formObj).map((v) => {
      return formObj[v].validateFields();
    });
  }; // 表单验证
  const serveFn = async () => {
    await editForm.validateFields();
    await Promise.all(validateFieldsFn(formTable));
    await Promise.all(validateFieldsFn(timeTableForm));
    if (!state.timeTable?.length) {
      message.error('至少有一条下发时间');
      return;
    }

    if (!state.editTableData?.length) {
      message.error('至少有一条结算单元配置');
      return;
    }
    setState({ btnLoading: true });
    const { titleKey } = staticState.drawerObj;
    let flagServe = 0;
    state.editTableData.forEach((v) => {
      if (!v.issueStatus) {
        flagServe += v.coefficient;
      }
    });
    if (flagServe > 1) {
      message.error('系数超过1');
      setState({ btnLoading: false });
      return;
    }
    const formData = editForm.getFieldsValue();
    const params = {
      ...formData,
      dataSourceId: formData.dataSourceId[1],
      time: state.timeTable,
      children: state.editTableData.map((v) => ({ ...v, ...editForm.getFieldsValue() })),
    };
    const res = await ShortTermIssueEdit(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(`${DRAWERTITLE_ENMU[titleKey]}成功`);
      setState({ visible: false });
      featch({});
    } else {
      message.error(res?.message || '保存失败');
    }
    setState({ btnLoading: false });
  }; // 编辑/新增 保存
  const wfCapacityChange = () => {
    const value = editForm.getFieldValue('wfCapacity');
    const newData = state.editTableData?.map((item) => ({
      ...item,
      coefficient: item?.stationCapacity / value,
    }));
    setState({ editTableData: newData });
  }; // 风电场装机容量（单位kw） input Change
  const wfIdBlur = () => {
    handleGetMap();
  }; // 风电场失焦请求结算单元数据

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
  const EditTimeTableRow = (props) => {
    timeTableForm[props['data-row-key']] = Form.useForm()[0]; // 编辑/新增表格
    return (
      <Form form={timeTableForm[props['data-row-key']]} component={false} autoComplete="off">
        <timeTableContext.Provider value={timeTableForm[props['data-row-key']]}>
          <tr {...props} />
        </timeTableContext.Provider>
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
    const timeTableComponents = {
      body: {
        row: EditTimeTableRow,
        cell: (props) =>
          EditableCell({ EditableContext: timeTableContext, handleSave: timeTableSave, ...props }),
      },
    };
    return (
      <>
        <Form name="form_item_path" layout="vertical" form={editForm} autoComplete="off">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                col={3}
                label="风电场id"
                name="wfId"
                rules={[
                  { required: true, message: `请输入风电场id` },
                  ...rulesArr.lengthRule(10),
                  ...rulesArr.integer,
                  () => ({
                    validator(_, value) {
                      const dataFilter = staticState?.dataList?.filter((v) => v.wfId == value);
                      if (!(dataFilter?.length > 1) || !value || titleKey !== 'add') {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('风电场ID重复'));
                    },
                  }),
                ]}
              >
                <Input onBlur={wfIdBlur} />
              </Form.Item>
            </Col>
            {editAddForm.map((props, ind) => (
              <TRForm {...props} key={ind} />
            ))}
            <Col span={8}>
              <Form.Item
                col={3}
                label="数据源"
                name="dataSourceId"
                rules={[{ required: true, message: `请输入数据源` }]}
              >
                <Cascader allowClear={false} options={dataSourceOption} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                col={3}
                label="风电场装机容量（单位kw）"
                name="wfCapacity"
                rules={[
                  { required: true, message: `请输入风电场装机容量` },
                  ...rulesArr.lengthRule(20),
                  ...rulesArr.integer,
                ]}
              >
                <Input onChange={wfCapacityChange} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <>
          <div className={styles.editForm_table}>
            <Button
              className={styles.editForm_table_add}
              type="primary"
              onClick={handleTimeTableAdd}
              loading={state.btnLoading}
            >
              新增
            </Button>
            <Table
              pagination={{ defaultCurrent: 1, defaultPageSize: 5 }}
              components={timeTableComponents}
              rowClassName={styles.editForm_table_editableRow}
              rowKey="key"
              columns={timeTableColumns({ timetableDel, timeTableSave })}
              dataSource={state.timeTable}
              bordered
            />
          </div>
        </>
        <>
          <div className={styles.editForm_table}>
            <div className={styles.editForm_table_getMap}>
              <Button type="primary" onClick={handleAdd}>
                新增
              </Button>
              {staticState.drawerObj.titleKey === 'add' ? (
                <Button type="primary" onClick={handleGetMap}>
                  获取场站下发配置
                </Button>
              ) : null}
            </div>
            <Table
              pagination={{ defaultCurrent: 1, defaultPageSize: 5 }}
              components={components}
              rowClassName={styles.editForm_table_editableRow}
              rowKey="key"
              columns={editColumnsFn({
                handleDelete,
                handleSave,
                selectDataObj: staticState.selectDataObj,
              })}
              dataSource={state.editTableData}
              bordered
              loading={state.editTableLoading}
            />
          </div>
        </>
      </>
    );
  }
  return (
    <>
      <div className={styles.distributionConfig_header}>
        <Input placeholder="搜索" onChange={searchChange} style={{ width: '200px' }} />
        <Button type="primary" onClick={searchClick} loading={state.loading}>
          查询
        </Button>
      </div>
      <div className={styles.distributionConfig_content} ref={contentRef}>
        <div className={styles.distributionConfig_content_add}>
          <TRButton
            buttonPermissions={btnPer}
            menuCode={'PS-DataIssue-add'}
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
          rowKey={(z) => z.i}
          columns={columnsFn({
            defaultData: staticState.defaultData,
            dataList: staticState.dataList,
            deleteFn,
            editFn,
            btnPer,
          })}
          scroll={{ x: 'max-content', y: size?.height ? size?.height - 80 - 55 : 500 }}
          dataSource={staticState.dataList}
          bordered
        />
        <Drawer
          width="90%"
          title={`下发配置/${DRAWERTITLE_ENMU[staticState.drawerObj.titleKey]}`}
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
export default DistributionConfig;

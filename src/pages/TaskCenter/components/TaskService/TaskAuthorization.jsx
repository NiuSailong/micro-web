import React, { useEffect } from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import {
  Input,
  Button,
  Drawer,
  Table,
  Space,
  message,
  Form,
  Row,
  Col,
  Modal,
  DatePicker,
} from 'antd';
import { useTRState, useStaticState } from '#/utils/trHooks';
import TRButton from '#/components/TRButton';
import {
  getSellNoServiceByPage,
  addOrUpdateRegion,
  addRegionOrUpdate,
  getServiceByPage,
  getBindPageRegionList,
} from '@/services/TaskCenter';
import { HttpCode } from '#/utils/contacts';
import { getColumnsAuthori, relationeditFn, editandAddEditFn } from './helper';
import { rulesArr } from '@/pages/PowerStation/components/helper';
import { EditableCell } from '@/pages/PowerStation/components/editTable';
import moment from 'moment';
import { useSize } from 'ahooks';
import styles from './index.less';

const EditableContext = React.createContext(null);
const { confirm } = Modal;
function TaskAuthorization({ buttonPermissions, menuCode }) {
  let editTableForm = {};
  const tableRef = React.useRef(null);
  const size = useSize(tableRef);
  const [editForm] = Form.useForm(null);
  const [serachForm] = Form.useForm(null);
  const SD = menuCode === 'SD-TaskCenter' ? 'SD-' : '';
  const btnPerMap = {
    pageTable: `${SD}TS-SellRegion-cu`,
    relation: `${SD}TS-SellService-cud`,
  };

  /**** state ****/
  const [state, setState] = useTRState({
    visible: false,
    editTableData: [], // 编辑/新增 表格数据
    loading: false, // 页面查询 loading
    btnLoading: false, // 拉扇按钮 loading
    error: '', // 报错信息
  });
  const staticState = useStaticState({
    groupData: [],
    dataList: [], // 列表数据
    sellNoDataObjMap: [], // 售电公司映射表
    keyCount: 0, // 编辑/新增 表格新增 key 计数器
    tablePagination: { current: 1, pageSize: 10, total: 0 }, // 编辑/新增 表格分页配置
    drawerObj: {}, // 编辑 回填数据
    selectDataObj: [], // 新增/编辑 select Option
  });

  useEffect(() => {
    featch({});
  }, []);
  useEffect(() => {
    if (state.visible) {
      showDrawerFn();
    }
  }, [state.visible]);

  async function featch({ pagein = { currentPage: 1, size: 10 } }) {
    setState({ loading: true });
    const { currentPage, size } = pagein;
    const params = { ...serachForm.getFieldsValue(), currentPage, size };
    const res = await getSellNoServiceByPage(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticState.tablePagination = {
        current: Number(res?.current),
        pageSize: res?.size,
        total: res?.total,
      };
      staticState.dataList = res?.data;
      staticState.sellNoDataObjMap = _.groupBy(res?.data, 'sellNo');
      staticState.groupData = _.groupBy(res?.data, 'sellNo');
    } else {
      message.error(res?.message || '查询失败');
    }
    getRegionList();
    setState({ loading: false });
  } // 初始化查询接口&查询接口

  async function getRelationData() {
    setState({ btnLoading: true });
    const res = await getServiceByPage({
      size: 9999,
      currentPage: 1,
      searchName: '',
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      const serviceData = res?.data?.map((v) => ({
        value: v.serviceCode,
        label: v.serviceName,
        regionCode: v.regionCode,
      }));
      const serviceSelectData = _.groupBy(serviceData, 'regionCode');
      staticState.selectDataObj.serviceSelect = serviceSelectData;
      setState({ btnLoading: false });
    } else {
      staticState.selectDataObj.serviceSelect = [];
      setState({ btnLoading: false });
    }
  } // 获取服务名称字典值
  async function getRegionList() {
    setState({ btnLoading: true });
    const res = await getBindPageRegionList();
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticState.selectDataObj.region = res?.xiaoShouYiMapBodyList?.map((v) => ({
        value: v.code,
        label: v.label,
      }));
      setState({ btnLoading: false });
    } else {
      staticState.selectDataObj.region = [];
      setState({ btnLoading: false });
    }
  } // 获取区域字典值

  const addFn = () => {
    staticState.drawerObj = { titleKey: '新增', data: {} };
    setState({ visible: true });
  }; // 新增
  const editFn = (data) => {
    staticState.drawerObj = {
      titleKey: '编辑',
      data: { ...data },
    };
    setState({ visible: true });
  }; // 编辑
  function uniqueFunc(arr, uniId) {
    const res = new Map();
    return arr.filter((item) => !res.has(item[uniId]) && res.set(item[uniId], 1));
  } // 去重
  const relationFn = (data) => {
    staticState.selectDataObj.region = uniqueFunc(
      staticState.sellNoDataObjMap[data?.sellNo]?.map((v) => ({
        value: v.regionCode,
        label: v.regionName,
      })),
      'value',
    );
    staticState.drawerObj = { titleKey: '关联', data };
    setState({ visible: true });
  }; // 关联
  const searchClick = () => {
    featch({});
  }; // 查询
  const tableChange = (pagination) => {
    featch({ pagein: { currentPage: pagination.current, size: pagination.pageSize } });
  };

  /*****  拉扇操作  *****/
  const showDrawerFn = () => {
    const { regionCode = '', sellNo } = staticState.drawerObj?.data;
    let setTableData = [];
    if (staticState.drawerObj.titleKey === '关联') {
      getRelationData(regionCode);
      (staticState.groupData?.[sellNo] || [])?.forEach((v) => setTableData.push(...v?.service));
      setTableData = uniqueFunc(setTableData, 'id');
    } else {
      setTableData = staticState.groupData?.[sellNo] || [];
    }
    staticState.keyCount = setTableData?.length;
    if (staticState.drawerObj.titleKey === '新增') {
      staticState.drawerObj.data = { sellName: '', updateBy: '', sellNo: '-', validEndTime: '' };
      setTableData = [{ regionCode: '', powerUnitName: '' }];
    }
    staticState.drawerObj.data = { ...staticState.drawerObj?.data, setTableData, updateBy: '' };
    editForm.setFieldsValue({
      ...staticState.drawerObj?.data,
      validEndTime:
        staticState.drawerObj.titleKey === '新增'
          ? ''
          : moment(staticState.drawerObj?.data.validEndTime),
    });
    setState({ editTableData: setTableData?.map((v, i) => ({ ...v, key: i })) });
  }; // 拉扇打开执行
  const closeFn = () => {
    const { data } = staticState.drawerObj;
    const editTableData = state.editTableData?.map((v) => {
      delete v?.key;
      return v;
    });
    const editData = Object.assign({
      ...data,
      ...editForm.getFieldsValue(),
      setTableData: editTableData,
    });
    if (_.isEqual(data, editData)) {
      setState({ visible: false });
    } else {
      confirm({
        title: `确定要退出${staticState.drawerObj.titleKey}吗？`,
        onOk() {
          setState({ visible: false });
        },
      });
    }
  }; // 关闭
  const handleDelete = (key) => {
    const newData = state.editTableData?.filter((item) => item.key !== key);
    setState({ editTableData: newData });
  }; // 删除
  const editandAddAdd = () => {
    staticState.keyCount += 1;
    const newData = {
      key: staticState.keyCount,
      regionCode: '',
      powerUnitName: '',
    };
    setState({ editTableData: [...state.editTableData, newData] });
  }; // 编辑/新增 子数据新增
  const relationTableAdd = () => {
    staticState.keyCount += 1;
    const newData = {
      key: staticState.keyCount,
      serviceCode: '',
      expirationTime: '',
    };
    setState({ editTableData: [...state.editTableData, newData] });
  }; // 关联服务子数据新增
  const formatRow = (row) => {
    const values = { ...row };
    values.expirationTime = values.expirationTime
      ? moment(values.expirationTime).format('YYYY-MM-DD HH:mm:ss')
      : '';
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
  const validateFieldsFn = (formObj) => {
    return Object.keys(formObj).map((v) => {
      return formObj[v].validateFields();
    });
  }; // 表单验证
  const serveFn = async () => {
    await editForm.validateFields();
    await Promise.all(validateFieldsFn(editTableForm));
    const { data, titleKey } = staticState.drawerObj;
    const { region = [] } = staticState.selectDataObj;
    if (!state.editTableData?.length) {
      message.error(titleKey === '关联' ? '服务列表至少有一条' : '交易单元至少有一项');
      return;
    }
    setState({ btnLoading: true });
    const editFormData = editForm.getFieldsValue();
    const regionObj = {};
    region?.forEach((z) => (regionObj[z.value] = z.label));
    const params =
      titleKey === '关联'
        ? state.editTableData?.map((v) => ({
            sellNo: data?.sellNo === '-' ? null : data?.sellNo,
            regionCode: data?.regionCode,
            ...v,
            ...editFormData,
          }))
        : {
            ...data,
            ...editForm.getFieldsValue(),
            validEndTime: moment(editForm.getFieldsValue()?.validEndTime).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
            sellNo: data?.sellNo === '-' ? null : data?.sellNo,
            region: state.editTableData.map((v) => ({
              ...v,
              regionName: regionObj[v.regionCode],
            })),
          };
    const res =
      titleKey === '关联'
        ? await addRegionOrUpdate(params)
        : await addOrUpdateRegion({
            type: menuCode === 'SD-TaskCenter' ? 'SELL' : 'GEN',
            ...params,
          });
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(`${titleKey}成功`);
      setState({ visible: false });
      featch({});
    } else {
      message.error(res?.message || `${titleKey}失败`);
    }
    setState({ btnLoading: false });
  }; // 编辑/新增 保存

  const onValuesChange = (changedFields, ind) => {
    const key = Object.keys(changedFields)[0];
    if (key === 'regionCode') {
      editTableForm[ind].setFieldsValue({ serviceCode: '' });
    }
  };

  const EditableRow = (props) => {
    editTableForm[props['data-row-key']] = Form.useForm()[0]; // 编辑/新增表格
    return (
      <Form
        form={editTableForm[props['data-row-key']]}
        onValuesChange={(value) => onValuesChange(value, props['data-row-key'])}
        component={false}
        autoComplete="off"
      >
        <EditableContext.Provider value={editTableForm[props['data-row-key']]}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const RenderForm = () => {
    const { selectDataObj } = staticState;
    const { titleKey } = staticState.drawerObj;
    const components = {
      body: {
        row: EditableRow,
        cell: (props) => EditableCell({ EditableContext, handleSave, ...props }),
      },
    };
    return (
      <>
        <Form name="relation" layout="vertical" form={editForm} autoComplete="off">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="公司名称"
                name="sellName"
                rules={[{ required: true, message: `请输入公司名称` }, ...rulesArr.lengthRule(200)]}
              >
                <Input />
              </Form.Item>
            </Col>
            {
              <Col span={8}>
                <Form.Item label="公司编码" name="sellNo">
                  <Input disabled />
                </Form.Item>
              </Col>
            }
            <Col span={8}>
              <Form.Item
                label="操作人"
                name="updateBy"
                rules={[{ required: true, message: `请输入操作人`, ...rulesArr.lengthRule(200) }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="过期时间"
                name="validEndTime"
                rules={[{ required: true, message: `请选择过期时间` }]}
              >
                <DatePicker showTime />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <>
          <div className={styles.editForm_table}>
            <Button
              type="primary"
              onClick={editandAddAdd}
              loading={state.btnLoading}
              className={styles.editForm_table_add}
              style={{ borderRadius: 5 }}
            >
              新增
            </Button>
            <Table
              pagination={false}
              components={components}
              rowKey="key"
              columns={editandAddEditFn({ handleDelete, handleSave, selectDataObj, titleKey })}
              dataSource={state.editTableData}
              loading={state.btnLoading}
              scroll={{ x: 'max-content', y: 500 }}
              bordered
            />
          </div>
        </>
      </>
    );
  }; // 编辑/新增 Form
  const RenderRelationForm = () => {
    const { selectDataObj } = staticState;
    const components = {
      body: {
        row: EditableRow,
        cell: (props) => EditableCell({ EditableContext, handleSave, ...props }),
      },
    };
    return (
      <>
        <Form name="relation" layout="vertical" form={editForm} autoComplete="off">
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="公司名称" name="sellName">
                <Input disabled />
              </Form.Item>
            </Col>
            {
              <Col span={8}>
                <Form.Item label="公司编码" name="sellNo">
                  <Input disabled />
                </Form.Item>
              </Col>
            }
            <Col span={8}>
              <Form.Item
                label="操作人"
                name="updateBy"
                rules={[{ required: true, message: `请输入操作人` }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <>
          <div className={styles.editForm_table}>
            <div className={styles.editForm_table_add}>
              <TRButton
                type="primary"
                onClick={relationTableAdd}
                loading={state.btnLoading}
                buttonPermissions={buttonPermissions}
                menuCode={btnPerMap.relation}
                style={{ borderRadius: 5 }}
              >
                新增
              </TRButton>
            </div>

            <Table
              pagination={{ defaultCurrent: 1, defaultPageSize: 5 }}
              components={components}
              rowKey="key"
              columns={relationeditFn({
                handleDelete,
                handleSave,
                selectDataObj,
                btnPer: buttonPermissions,
                btnPerMap,
              })}
              dataSource={state.editTableData}
              loading={state.btnLoading}
              bordered
            />
          </div>
        </>
      </>
    );
  }; // 关联 Form

  return (
    <div className={styles.taskAuthorization}>
      <div className={styles.taskAuthorization_header}>
        <Form name="search" layout="inline" form={serachForm} autoComplete="off">
          <Form.Item name="sellName">
            <Input placeholder="公司名称" />
          </Form.Item>
          <Form.Item name="sellNo">
            <Input placeholder="公司编码" />
          </Form.Item>
          <Form.Item name="regionName">
            <Input placeholder="区域名称" />
          </Form.Item>
        </Form>
        <Button
          type="primary"
          style={{ borderRadius: 5 }}
          onClick={searchClick}
          loading={state.loading}
        >
          查询
        </Button>
      </div>
      <div className={styles.taskAuthorization_content}>
        <div className={styles.taskAuthorization_content_add}>
          <TRButton
            type="primary"
            onClick={addFn}
            buttonPermissions={buttonPermissions}
            menuCode={btnPerMap.pageTable}
            style={{ borderRadius: 5 }}
          >
            新建
          </TRButton>
        </div>
        <div ref={tableRef} style={{ flex: 1, overflow: 'hidden' }}>
          <Table
            onChange={tableChange}
            pagination={staticState.tablePagination}
            loading={state.loading}
            rowKey="id"
            columns={getColumnsAuthori({
              dataList: staticState.dataList,
              editFn,
              relationFn,
              btnPer: buttonPermissions,
              btnPerMap,
            })}
            scroll={{ x: 'max-content', y: (size?.height ? size.height : 500) - 55 - 64 }}
            dataSource={staticState.dataList}
            bordered
          />
        </div>
        <Drawer
          width="90%"
          title={`服务授权/${staticState.drawerObj.titleKey}`}
          placement="right"
          onClose={closeFn}
          visible={state.visible}
          getContainer={false}
          destroyOnClose={true}
          maskClosable={false}
          className={styles.DrawerCom}
        >
          <div className={styles.DrawerCom_content}>
            <div className={styles.DrawerCom_content_form}>
              {staticState.drawerObj.titleKey === '关联' ? RenderRelationForm() : RenderForm()}
            </div>
            <div className={styles.DrawerCom_content_btn}>
              <Space>
                {staticState.drawerObj.titleKey === '关联' ? (
                  <TRButton
                    type="primary"
                    onClick={serveFn}
                    loading={state.btnLoading}
                    buttonPermissions={buttonPermissions}
                    menuCode={btnPerMap.relation}
                    style={{ borderRadius: 5 }}
                  >
                    提交
                  </TRButton>
                ) : (
                  <Button
                    style={{ borderRadius: 5 }}
                    type="primary"
                    onClick={serveFn}
                    loading={state.btnLoading}
                  >
                    提交
                  </Button>
                )}
                <Button style={{ borderRadius: 5 }} onClick={closeFn} loading={state.btnLoading}>
                  返回
                </Button>
              </Space>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions,
  menuCode: global?.configure?.menuCode,
}))(TaskAuthorization);

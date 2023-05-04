import React, { useEffect, useContext } from 'react';
import { Table, Input, Button, Drawer, Space, Modal, Form, Row, message } from 'antd';
import { columns, formMap } from './helper';
import { useTRState, useStaticState } from '#/utils/trHooks';
import { DRAWERTITLE_ENMU } from '@/pages/PowerStation/components/helper';
import { HttpCode } from '#/utils/contacts';
import {
  shortForecastFtpSelect,
  shortForecastFtpEdit,
  shortForecastFtpDelte,
} from '@/services/PowerStation';
import TRForm from '../TRForm';
import { BtnPerContent } from '@/pages/PowerStation';
import TRButton from '#/components/TRButton';
import _ from 'lodash';
import styles from './index.less';

const { confirm } = Modal;

function FTP() {
  const [editForm] = Form.useForm(); // 编辑/新增表单
  const btnPer = useContext(BtnPerContent); // 按钮权限

  const [state, setState] = useTRState({
    visible: false,
    editTableData: [], // 编辑/新增 表格数据
    loading: false, // 页面查询 loading
    btnLoading: false, // 拉扇按钮 loading
    error: '', // 报错信息
  });
  const staticState = useStaticState({
    dataList: [], // 列表数据
    searchDataSourceName: '', // 查询的数据源名称
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

  async function featch({ currentPage = 1 }) {
    setState({ loading: true });
    const params = { search: staticState.searchDataSourceName, currentPage, size: 10 };
    const res = await shortForecastFtpSelect(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticState.tablePagination = { current: res?.current, pageSize: 10, total: res?.total };
      staticState.dataList = res?.data;
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
  const deleteFn = async (id) => {
    const res = await shortForecastFtpDelte(id);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success('删除成功');
      featch({});
    } else {
      message.error('删除失败');
    }
  }; // 删除

  const closeFn = () => {
    const data = {
      ...staticState.drawerObj.data,
      ...editForm.getFieldsValue(),
    };
    if (_.isEqual(data, staticState.drawerObj.data)) {
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
    if (staticState.drawerObj.titleKey === 'add') {
      const obj = {};
      formMap.map((v) => (obj[v.dataIndex] = ''));
      staticState.drawerObj.data = obj;
    }
    editForm.setFieldsValue(staticState.drawerObj?.data);
  }; // 拉扇打开执行

  const serveFn = async () => {
    const { titleKey, data } = staticState.drawerObj;
    await editForm.validateFields();
    setState({ btnLoading: true });
    const params = { ...data, ...editForm.getFieldsValue() };
    const res = await shortForecastFtpEdit(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(`${DRAWERTITLE_ENMU[titleKey]}成功`);
      setState({ visible: false });
      featch({});
    } else {
      message.error(res?.message || '保存失败');
    }
    setState({ btnLoading: false });
  }; // 编辑/新增 保存

  const RenderForm = () => {
    return (
      <Form name="form_item_path" layout="vertical" form={editForm} autoComplete="off">
        <Row gutter={24}>
          {formMap.map((props, ind) => (
            <TRForm {...props} key={ind} />
          ))}
        </Row>
      </Form>
    );
  };

  const tableChange = (pagination) => {
    staticState.tablePagination = pagination;
    featch({ currentPage: pagination?.current });
  };

  return (
    <div>
      <div className={styles.FTP_header}>
        <Input placeholder="搜索" onChange={searchChange} style={{ width: '200px' }} />
        <Button type="primary" onClick={searchClick} loading={state.loading}>
          查询
        </Button>
      </div>
      <div className={styles.FTP_content}>
        <div className={styles.FTP_content_add}>
          <TRButton
            type="primary"
            onClick={addFn}
            loading={state.loading}
            buttonPermissions={btnPer}
            menuCode={'PS-FTP-add'}
          >
            新建
          </TRButton>
        </div>
        <Table
          rowKey="id"
          columns={columns({ dataList: staticState.dataList, editFn, deleteFn, btnPer })}
          dataSource={staticState.dataList}
          scroll={{ x: 'max-content' }}
          pagination={staticState.tablePagination}
          onChange={tableChange}
          loading={state.loading}
        />
      </div>
      <Drawer
        width="90%"
        title={`FTP地址管理/${DRAWERTITLE_ENMU[staticState.drawerObj.titleKey]}`}
        placement="right"
        onClose={closeFn}
        visible={state.visible}
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
  );
}

export default FTP;

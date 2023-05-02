import { Fragment, forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMount, useSetState, useUpdateEffect } from 'ahooks';
import { getMunedata, getPowerListData } from '@/services/appManaga';
import { Table, Input, Select, Button, Form, Divider, Drawer, Spin } from 'antd';
import { customizeColumns, _systemSource_, _typeChoose_ } from './helper';
import style from './index.less';
import PanelTitle from '#/components/PanelTitle';
import { RollbackOutlined, MinusCircleOutlined, PlusCircleOutlined } from '#/utils/antdIcons';
import MenuCompent from './component/MenuCompent';
import DrawerHeader from '#/components/DrawerHeader';
import classnames from 'classnames';
import _ from 'lodash';
import { addMuneManagaData, updataAppManagaData, addAppManagaData } from '@/services/appManaga';
import Message from '#/components/Message';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import PhotoCompent from './component/PhotoCompent';

const { Option } = Select;
const _requiredPamar = ['menuCode', 'parentId', 'menuName', 'type', 'source'];

const DrawerComponent = ({ data, handleClose, status, statusText }, ref) => {
  const menuCompentRef = useRef(null);
  const [form] = Form.useForm();
  const [state, setState] = useSetState({
    appInfo: {}, // 列表信息
    currentPage: 1,
    pageLoading: false,
    visibleDrawer: false,
    visiblePhoto: false,
    dataSource: [], // table显示数据
    rawData: [], // 全部数据
    appList: [], //
    powerList: [],
    detail: {},
  });

  useImperativeHandle(ref, () => {
    return {
      state,
    };
  });

  const optionList = {
    parentId: state.appList || [],
    source: _systemSource_ || [],
    type: _typeChoose_ || [],
    powerId: state.powerList || [],
  };

  useMount(() => {
    setState({ appInfo: { ...(data || {}) } });
  });

  const handleInit = async () => {
    form.setFieldsValue({
      appCode: state.appInfo.appCode || '',
      appName: state.appInfo.appName || '',
    });
    setState({ pageLoading: true });
    const params = {
      applicationId: state.appInfo.applicationId,
      current: 1,
      size: 10000,
    };
    const param = {
      current: 1,
      size: 1000,
      totle: 1000,
    };
    const [appById, allApp, powerRes] = await Promise.all([
      getMunedata(params),
      getMunedata(param),
      getPowerListData(),
    ]);
    const _appList = [...(allApp.dataResults || [])].reduce((t, v) => {
      if (t.find((f) => f.menuId === v.menuId)) {
        return t;
      }
      return [...t, { ...v, id: v.menuId, label: v.menuName, value: v.menuId }];
    }, []);
    _appList.unshift({
      value: 0,
      label: '根节点',
      id: Date.parse(new Date()) + Math.floor(Math.random() * 100000),
    });
    const _appById = [...(appById.dataResults || [])].reduce((t, v, i) => {
      return [...t, { ...v, id: `${v.menuId}${i}` }];
    }, []);
    setState({
      pageLoading: false,
      dataSource: [...(_appById || [])],
      rawData: [...(_appById || [])],
      appList: _appList,
      powerList: [...(powerRes.data || [])],
    });
  };

  useUpdateEffect(() => {
    if (status !== 'add') handleInit();
  }, [state.appInfo]);

  // 输入框改变数据事件
  const _handleChange = (value, record, code) => {
    const dataSource = [...(state.dataSource || [])];
    dataSource.forEach((item) => {
      if (item.id === record.id) {
        item[code] = value;
        item.operatorType = item.operatorType !== 'add' ? 'update' : 'add';
      }
    });
    setState({
      dataSource,
    });
  };

  const _handleMenuDrawer = (record) => {
    setState({
      visibleDrawer: !state.visibleDrawer,
      detail: record,
    });
  };

  const _handlePhotoDrawer = async (record) => {
    // const res = await PhotoDrawer.show({ ...record, statusText });
    // console.log(res);
    setState({
      visiblePhoto: !state.visiblePhoto,
      detail: record,
    });
  };

  const handlePhotoClose = async (flag = false) => {
    if (flag) {
      setState({ visiblePhoto: false });
    } else {
      const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 1) {
        return setState({ visiblePhoto: false });
      }
    }
  };

  const handleDrawerClose = async (flag = false) => {
    if (flag) {
      setState({ visibleDrawer: false });
    } else {
      const rawData = menuCompentRef?.current?.state?.rawData || [];
      const findParam = rawData.find((item) => item.operatorType);
      if (findParam) {
        const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
        if (obj.index === 1) {
          return setState({ visibleDrawer: false });
        }
      } else {
        setState({ visibleDrawer: false });
      }
    }
  };

  const handleDelRow = (record, flag) => {
    if (record.operatorType !== 'add') {
      const dataSource = [...(state.dataSource || [])];
      dataSource.forEach((item) => {
        if (item.id === record.id) {
          item.del = flag;
          item.operatorType = flag ? 'delete' : 'update';
        }
      });
      setState({
        dataSource,
      });
    } else {
      const dataSource = state.dataSource.filter((v) => v.id !== record.id);
      setState({
        dataSource,
      });
    }
  };

  const columns = () => {
    let column = [];
    customizeColumns.forEach((item) => {
      const prop = {
        title: item.required ? (
          <div>
            <span style={{ color: 'red' }}>*</span>
            <span> {item.title}</span>
          </div>
        ) : (
          item.title
        ),
        width: item.width,
        className: 'tableHeaderStyle',
      };
      switch (item.type) {
        case 'input':
          column.push({
            ...prop,
            render: (_text, record) => {
              return (
                <Fragment>
                  {status !== 'lookup' ? (
                    <Input
                      value={record[item.code]}
                      onChange={(e) => {
                        _handleChange(e.target.value, record, item.code);
                      }}
                    />
                  ) : (
                    <div>{record[item.code]}</div>
                  )}
                </Fragment>
              );
            },
          });
          break;
        case 'select':
          column.push({
            ...prop,
            render: (_text, record) => {
              return (
                <Fragment>
                  {status !== 'lookup' ? (
                    <Select
                      allowClear={!item.required}
                      value={record[item.code]}
                      style={{ width: '100%' }}
                      onChange={(e) => {
                        _handleChange(e, record, item.code);
                      }}
                      showSearch
                      optionLabelProp="label"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      dropdownClassName="dropdownStyle"
                    >
                      {optionList[item.code].map((_v) => {
                        return (
                          <Option key={_v.id} value={_v.value} label={_v.label}>
                            <div className={style.upperMenu}>
                              {item.code !== 'source' ? (
                                <Fragment>
                                  <span>{_v.value}</span>
                                  <span>{_v.label}</span>
                                </Fragment>
                              ) : (
                                <span>{_v.value}</span>
                              )}
                            </div>
                          </Option>
                        );
                      })}
                    </Select>
                  ) : (
                    <div>
                      {optionList[item.code].find((v) => v.value === record[item.code])?.label ||
                        ''}
                    </div>
                  )}
                </Fragment>
              );
            },
          });
          break;
      }
    });
    column.push({
      title: '操作',
      fixed: 'right',
      width: 150,
      className: 'tableHeaderStyle',
      align: 'center',
      render: (_text, record) => {
        return (
          <div className={style.row_record}>
            {record.menuId ? (
              <Fragment>
                <Button
                  type="link"
                  onClick={() => _handleMenuDrawer(record)}
                  disabled={!!record.del}
                  style={{ padding: 0 }}
                >
                  详情
                </Button>
                {record.type === '0' ? (
                  <>
                    <Divider type="vertical" />
                    <Button
                      type="link"
                      onClick={() => _handlePhotoDrawer(record)}
                      disabled={!!record.del}
                      style={{ padding: 0 }}
                    >
                      图片
                    </Button>
                    <Divider type="vertical" />
                  </>
                ) : null}
              </Fragment>
            ) : null}
            {status !== 'lookup' ? (
              <Fragment>
                {record.del ? (
                  <RollbackOutlined
                    onClick={() => handleDelRow(record, false)}
                    style={{ color: '#ACB1C1', fontSize: '17px', pointerEvents: 'all' }}
                  />
                ) : (
                  <MinusCircleOutlined
                    onClick={() => handleDelRow(record, true)}
                    style={{ color: '#ACB1C1', fontSize: '17px', pointerEvents: 'all' }}
                  />
                )}
              </Fragment>
            ) : null}
          </div>
        );
      },
    });
    return column;
  };

  const _onTableChange = (pagination) => {
    setState({ currentPage: pagination.current });
  };

  // 查询
  const onFinish = () => {
    let values = form.getFieldsValue(['menuCode', 'menuName']);
    values = _.pickBy(values, _.identity);
    const rawData = [...(state.rawData || [])];
    if (Object.values(values).some((v) => v)) {
      const arr = _.filter(rawData, (_o) => {
        const isContain = _.map(
          _.compact(Object.keys(values)),
          (_v) => _o[_v].includes(values[_v]) && !!values[_v],
        );
        return isContain.every((v) => v);
      });
      setState({ dataSource: arr });
    } else {
      setState({ dataSource: rawData });
    }
  };
  // 重置
  const handleReset = () => {
    form.resetFields(['menuCode', 'menuName']);
    onFinish();
  };

  // 继续添加
  const addNewCol = () => {
    const dataSource = [...(state.dataSource || [])];
    const rawData = [...(state.rawData || [])];
    let obj = {
      id: Date.parse(new Date()) + Math.floor(Math.random() * 100000),
      component: '',
      description: '',
      hideType: '',
      icon: '',
      menuCode: '',
      menuId: '',
      menuName: '',
      menupath: '',
      orderNum: '',
      parentId: '',
      perms: '',
      powerId: '',
      source: '',
      type: '',
      operatorType: 'add', // 添加 add、更新 update、删除 delete
    };
    dataSource.push(obj);
    rawData.push(obj);
    const array = _.chunk(dataSource, 10);
    const pagecur =
      dataSource.length + 1 > 1 && (dataSource.length + 1) % 10 === 1
        ? array.length + 1
        : array.length;
    setState({ dataSource, rawData, currentPage: pagecur });
  };

  // 保存
  const addAPPdata = async () => {
    const findParam = state.rawData.find((item) => {
      if (item.operatorType !== 'delete') {
        return _requiredPamar.some((v) => !(item[v] || item[v] === 0));
      }
      return false;
    });
    if (findParam) return Message.error('必填项没有填，请先填写必填项');
    const menus = state.rawData.reduce((t, v) => {
      if (v.operatorType) return [...t, v];
      return t;
    }, []);
    const params = {
      applicationId: state.appInfo.applicationId,
      menus,
    };
    setState({
      pageLoading: true,
    });
    const res = await addMuneManagaData(params);
    setState({
      pageLoading: false,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      Message.success('保存成功');
      if (menus.find((v) => v.operatorType === 'add')) {
        handleInit();
      } else {
        handleClose(true);
      }
    } else {
      Message.error(res?.message || '保存成功');
    }
  };

  // 保存应用
  const saveApp = async () => {
    const values = await form.validateFields(['appCode', 'appName']);
    const params = {
      ...data,
      ...values,
    };
    setState({
      pageLoading: true,
    });
    switch (status) {
      case 'add':
        const resAdd = await addAppManagaData(params);
        setState({
          pageLoading: false,
        });
        if (resAdd?.statusCode === HttpCode.SUCCESS) {
          setState({
            appInfo: { ...(resAdd.data || {}) },
          });
          Message.success('保存成功');
        } else {
          Message.error(resAdd?.message || '保存失败');
        }
        break;
      default:
        const res = await updataAppManagaData(params);
        setState({
          pageLoading: false,
        });
        if (res?.statusCode === HttpCode.SUCCESS) {
          Message.success('保存成功');
          handleClose(true);
        } else {
          Message.error(res?.message || '保存失败');
        }
        break;
    }
  };

  return (
    <Spin spinning={state.pageLoading} wrapperClassName={style.antdTabel}>
      <PanelTitle title="应用" />
      <Form layout="inline" form={form} autoComplete="off">
        <Form.Item
          label="应用程序编码"
          name="appCode"
          rules={[{ required: true, message: '请输入应用程序编码!' }]}
        >
          {status !== 'lookup' ? (
            <Input placeholder="请输入" />
          ) : (
            <div>{form.getFieldValue('appCode')}</div>
          )}
        </Form.Item>
        <Form.Item
          label="应用名称"
          name="appName"
          rules={[{ required: true, message: '请输入应用名称!' }]}
        >
          {status !== 'lookup' ? (
            <Input placeholder="请输入" />
          ) : (
            <div>{form.getFieldValue('appName')}</div>
          )}
        </Form.Item>
        {status !== 'lookup' ? (
          <Form.Item>
            <Button type="primary" onClick={saveApp}>
              保存
            </Button>
          </Form.Item>
        ) : null}
      </Form>
      <Divider />
      <PanelTitle title="菜单" />
      <Form layout="inline" form={form} onFinish={onFinish} style={{ marginBottom: '15px' }}>
        <Form.Item label="菜单编码" name="menuCode">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item label="菜单/按钮名称" name="menuName">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
            查询
          </Button>
          <Button type="primary" onClick={() => handleReset()}>
            重置
          </Button>
        </Form.Item>
      </Form>
      <Table
        bordered
        columns={columns()}
        dataSource={state.dataSource}
        rowKey="id"
        scroll={{ x: 2000 }}
        rowClassName={(text) => {
          return text.del && status !== 'lookup'
            ? classnames(style.tableRemoveCss, style.rowStyle)
            : style.rowStyle;
        }}
        onChange={_onTableChange}
        pagination={
          status !== 'lookups'
            ? {
                pageSize: 10,
                current:
                  state.currentPage == 0
                    ? state.dataSource.length > 0
                      ? 1
                      : 0
                    : state.currentPage,
                showSizeChanger: false,
                size: 'small',
              }
            : false
        }
      />
      {status !== 'lookup' && state?.appInfo?.applicationId ? (
        <div className={style.styleButtonApp}>
          <Button
            icon={<PlusCircleOutlined style={{ color: '#1E7CE8', fontSize: '15px' }} />}
            onClick={() => {
              addNewCol();
            }}
            style={{ marginTop: 15 }}
          >
            继续添加
          </Button>
          <Button type="primary" onClick={addAPPdata} loading={state.pageLoading}>
            保存
          </Button>
        </div>
      ) : null}
      <Drawer
        destroyOnClose={true}
        className={style.drawer_wrap}
        placement="right"
        visible={state.visibleDrawer}
        width="90%"
        onClose={() => {
          handleDrawerClose();
        }}
        title={<DrawerHeader menuList={['后台管理', '应用菜单管理', statusText]} />}
        bodyStyle={{ padding: '0' }}
      >
        {state.visibleDrawer ? (
          <MenuCompent
            ref={menuCompentRef}
            detail={state.detail}
            status={status}
            handleClose={handleDrawerClose}
          />
        ) : null}
      </Drawer>
      <Drawer
        destroyOnClose={true}
        className={style.drawer_wrap}
        placement="right"
        visible={state.visiblePhoto}
        width="90%"
        onClose={() => {
          handlePhotoClose();
        }}
        title={<DrawerHeader menuList={['后台管理', '应用菜单管理', statusText]} />}
        bodyStyle={{ padding: '0' }}
      >
        {state.visiblePhoto ? (
          <PhotoCompent detail={state.detail} status={status} handleClose={handlePhotoClose} />
        ) : null}
      </Drawer>
    </Spin>
  );
};

DrawerComponent.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  status: PropTypes.string,
  statusText: PropTypes.string,
  tableKeys: PropTypes.array,
};
export default forwardRef(DrawerComponent);

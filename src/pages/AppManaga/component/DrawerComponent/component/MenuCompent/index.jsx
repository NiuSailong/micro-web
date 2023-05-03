import { Fragment, forwardRef, useImperativeHandle } from 'react';
import PanelTitle from '#/components/PanelTitle';
import { getResManagaData } from '@/services/appManaga';
import { useMount, useSetState } from 'ahooks';
import { HttpCode } from '#/utils/contacts';
import { Table, Input, Spin, Button, Form } from 'antd';
import { RollbackOutlined, MinusCircleOutlined, PlusCircleOutlined } from '#/utils/antdIcons';
import { customizeColumns } from './helper';
import style from '../../index.less';
import classnames from 'classnames';
import { addResManagaData } from '@/services/appManaga';
import Message from '#/components/Message';

const _requiredPamar = ['resourcesCode', 'resourcesPath', 'resourcesName'];

const MenuCompent = ({ detail, status, handleClose }, ref) => {
  const [form] = Form.useForm();
  const [state, setState] = useSetState({ dataSource: [], pageLoading: false, rawData: [] });

  useImperativeHandle(ref, () => {
    return {
      state,
    };
  });

  const getResourceByMenuId = async () => {
    setState({ pageLoading: true });
    const params = {
      current: 1,
      id: detail.menuId,
      size: 1000,
    };
    const res = await getResManagaData(params);
    setState({ pageLoading: false });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setState({
        dataSource: [...(res.dataResults || [])],
        rawData: [...(res.dataResults || [])],
      });
    }
  };
  useMount(() => {
    getResourceByMenuId();
  });
  // 删除
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

  const columns = () => {
    let column = [];
    customizeColumns.forEach((item) => {
      column.push({
        title: item.required ? (
          <div>
            <span style={{ color: 'red' }}>*</span>
            <span> {item.title}</span>
          </div>
        ) : (
          item.title
        ),
        className: 'tableHeaderStyle',
        width: item.width,
        render: (_, record) => {
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
    });
    if (status !== 'lookup') {
      column.push({
        title: '操作',
        fixed: 'right',
        width: 100,
        align: 'center',
        className: 'tableHeaderStyle',
        render: (_, record) => (
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
        ),
      });
    }
    return column;
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
    const resources = state.rawData.reduce((t, v) => {
      if (v.operatorType) return [...t, v];
      return t;
    }, []);
    const params = {
      menuId: detail.menuId,
      resources,
    };
    setState({
      pageLoading: true,
    });
    const res = await addResManagaData(params);
    setState({
      pageLoading: false,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      Message.success('保存成功');
      handleClose(true);
    } else {
      Message.error(res?.message || '保存成功');
    }
  };

  const addNewCol = () => {
    const dataSource = [...(state.dataSource || [])];
    const rawData = [...(state.rawData || [])];
    let obj = {
      id: Date.parse(new Date()) + Math.floor(Math.random() * 100000),
      resourcesCode: '',
      resourcesDescription: '',
      resourcesName: '',
      resourcesPath: '',
      operatorType: 'add', // 添加 add、更新 update、删除 delete
    };
    dataSource.push(obj);
    rawData.push(obj);
    setTimeout(() => {
      const nodeTable = document.querySelector(
        '.menuCompentrableRef .ant-table-container .ant-table-body',
      );
      if (nodeTable) {
        nodeTable.scrollTop = nodeTable?.scrollHeight || 100;
      }
    }, 50);
    setState({ dataSource, rawData });
  };
  // 查询
  const onFinish = () => {
    let values = form.getFieldsValue();
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
    form.resetFields();
    onFinish();
  };
  return (
    <Spin spinning={state.pageLoading} wrapperClassName={style.MenuCompentTabel}>
      <PanelTitle title={`资源（${detail?.menuCode || ''}）`} />
      <Form layout="inline" form={form} onFinish={onFinish} style={{ marginBottom: '15px' }}>
        <Form.Item label="资源编码" name="resourcesCode">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item label="对应路由path" name="resourcesPath">
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
      <div className="menuCompentrableRef">
        <Table
          bordered
          rowKey="id"
          columns={columns()}
          dataSource={state.dataSource}
          scroll={{ x: 2000, y: document.body.scrollHeight - 300 }}
          rowClassName={(text) => {
            return text.del && status !== 'lookup'
              ? classnames(style.tableRemoveCss, style.rowStyle)
              : style.rowStyle;
          }}
          pagination={false}
        />
      </div>
      {status !== 'lookup' ? (
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
    </Spin>
  );
};

export default forwardRef(MenuCompent);

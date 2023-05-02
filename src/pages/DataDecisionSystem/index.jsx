import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { Form, Input, InputNumber, Button, Modal, Select, message, Table, Drawer } from 'antd';
import { useSize } from 'ahooks';

import TRButton from '@/components/TRButton';
import { HttpCode } from '#/utils/contacts';
import { ExclamationCircleOutlined } from '#/utils/antdIcons';

import { getTableList, addInfo, editInfo, deleteInfo } from './service';
import { BTNS_PS, toTree } from './helper';
import styles from './index.less';

function FanRuanTable({ buttonPermissions = [], menuCode = 'DataDecisionSystem' }) {
  const refTable = useRef();
  const tableSize = useSize(refTable);
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  const [tree, setTree] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    getTable();
  }, []);

  /** apis */
  const getTable = async () => {
    // 查询
    let resList = [],
      resTree = [];
    setLoading(true);
    const res = await getTableList({ menuCode }).catch(() => {
      setLoading(false);
    });
    setLoading(false);
    if (res.statusCode === HttpCode.SUCCESS) {
      resList = (res?.data || []).map((x) => ({
        ...x,
        id: Number(x.id),
      }));
      resTree = toTree([...resList]); // 树形数据结构化
    }
    setList(resList);
    setTree(resTree);
  };

  const onSave = async (values) => {
    // 新增、编辑
    setConfirmLoading(true);
    const saveapi = !!values.id ? editInfo : addInfo;
    const res = await saveapi({
      ...values,
      menuCode,
      parentId: values.parentId || 0,
    }).catch(() => {
      setConfirmLoading(false);
    });
    setConfirmLoading(false);
    if (res.statusCode === HttpCode.SUCCESS) {
      message.success({
        content: '保存成功！',
        style: {
          marginTop: '50vh',
        },
      });
      // 添加成功后重新调接口获取最新数据
      setVisible(false);
      getTable();
    }
  };

  const onDel = async (id) => {
    const res = await deleteInfo(id);
    if (res.statusCode === HttpCode.SUCCESS) {
      message.success({
        content: '删除成功！',
        style: {
          marginTop: '50vh',
        },
      });
      getTable();
    }
  };

  /** handles */
  const handleAdd = () => {
    // 新增
    form.resetFields();
    setVisible(true);
  };

  const handleEdit = (record) => {
    // 编辑
    form.setFieldsValue({ ...record });
    setVisible(true);
  };

  const handleDel = (id) => {
    // 删除
    Modal.confirm({
      title: '确定要删除吗?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        onDel(id);
      },
    });
  };
  const onFinish = (values) => {
    // 保存
    onSave(values);
  };
  const handleCancel = () => {
    // 取消
    setVisible(false);
    form.resetFields();
  };

  /** renders */
  const _renderModal = () => {
    const id = form.getFieldValue('id');
    return (
      <Modal
        title={id ? '编辑' : '新增'}
        visible={visible}
        confirmLoading={confirmLoading}
        footer={null}
        closable={false}
        maskClosable={false}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          {id && (
            <Form.Item label="id" name="id" noStyle>
              <Input disabled style={{ display: 'none' }} />
            </Form.Item>
          )}
          <Form.Item
            label="名称"
            name="tableName"
            rules={[
              {
                required: true,
                message: '名称不能为空！',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="链接" name="url">
            <Input />
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <InputNumber precision={0} step={1} min={0} />
          </Form.Item>
          <Form.Item label="父级名称" name="parentId">
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => option.children.includes(input)}
            >
              <Select.Option value={0} key={0}>
                根节点
              </Select.Option>
              {list.map((item) => {
                return (
                  <Select.Option
                    value={item.id}
                    key={item.id}
                    disabled={item.id === form.getFieldValue('id')}
                  >
                    {item.tableName}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item className={styles.modalBtns} wrapperCol={{ span: 22 }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit" disabled={confirmLoading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const _renderName = (text, record) => (
    <div
      className={record.url && styles.link}
      onClick={() => {
        setPreviewData(record.url ? record : null);
      }}
    >
      {text}
    </div>
  );

  const _renderOpreates = (text, record) => (
    <div className={styles.btns}>
      <div className={styles.btn}>
        <TRButton
          type="link"
          menuCode={BTNS_PS.EDIT}
          buttonPermissions={buttonPermissions}
          onClick={() => handleEdit(record)}
        >
          编辑
        </TRButton>
      </div>
      <div className={styles.btn}>
        {!record.children && (
          <TRButton
            type="link"
            style={{ color: 'red' }}
            menuCode={BTNS_PS.DEL}
            buttonPermissions={buttonPermissions}
            onClick={() => handleDel(record.id)}
          >
            删除
          </TRButton>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.tool}>
        <div>数据决策系统</div>
        <TRButton
          type="primary"
          menuCode={BTNS_PS.ADD}
          buttonPermissions={buttonPermissions}
          onClick={handleAdd}
        >
          新增
        </TRButton>
      </div>
      <div className={styles.table} ref={refTable}>
        <Table
          dataSource={tree}
          columns={[
            {
              title: '名称',
              dataIndex: 'tableName',
              key: 'tableName',
              render: _renderName.bind(this),
            },
            {
              title: '排序',
              dataIndex: 'sort',
              key: 'sort',
              width: '15%',
            },
            {
              title: '操作',
              dataIndex: 'operate',
              width: '20%',
              render: _renderOpreates.bind(this),
            },
          ]}
          loading={loading}
          pagination={false}
          rowKey={(record) => record.id}
          bordered
          scroll={{
            y: (tableSize?.height || 0) - 55,
          }}
        />
      </div>
      {_renderModal()}
      {previewData && (
        <Drawer visible width="80%" onClose={() => setPreviewData(null)}>
          <iframe src={previewData?.url} width="100%" height="100%" />
        </Drawer>
      )}
    </div>
  );
}

export default connect(({ global }) => ({
  buttonPermissions: global.configure.buttonPermissions,
  menuCode: global.configure.menuCode,
}))(FanRuanTable);

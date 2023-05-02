import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Form, Select, Row, Col, InputNumber, message } from 'antd';
import TRNotification from '#/utils/notification';
import { insertDeviceSourceData, updateDeviceSourceData } from '../service';
import { HttpCode } from '#/utils/contacts';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const { Option } = Select;

const rules = [
  {
    required: true,
    message: '不能为空！',
  },
];

const EventModal = (props) => {
  const { callback, type, record, column } = props;
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const initialValues = type === 'add' ? { current: true, device_type: 'P' } : record;
  const [form] = Form.useForm();

  useEffect(() => {
    return () => {
      // eslint-disable-next-line
      eventNoticeModal.dismiss();
    };
  }, []);

  const _onCancel = () => {
    setVisible(false);
    callback({ index: 0 });
  };

  const _onOk = async () => {
    const values = await form.validateFields();
    // 新增 or 编辑
    const requestMethod = type === 'add' ? insertDeviceSourceData : updateDeviceSourceData;
    try {
      setLoading(true);
      const params = {
        electricityVoList: [
          {
            ...values,
            client_id: record.clientId,
          },
        ],
        dept_num: record.deptNum,
        project_dept_num: record.projectDeptNum,
      };
      const response = await requestMethod(params);
      if (response && response.statusCode === HttpCode.SUCCESS) {
        message.success(response.message || '操作成功');
        callback({ index: 1 });
      } else {
        setLoading(false);
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // eslint-disable-next-line
  const _handleOnchange = (e, optionObj, type) => {
    if (type === 'type') {
      form.setFieldsValue({ type_name: optionObj.label, asset_num: '' });
    }
  };

  return (
    <Modal
      title={type === 'add' ? '新增' : '编辑'}
      width="70%"
      centered
      closable
      className="modalWraps"
      maskClosable={false}
      visible={visible}
      footer={[
        <Button key="cancel" onClick={_onCancel}>
          取消
        </Button>,
        <Button key="submit" onClick={_onOk} type="primary" loading={loading}>
          确定
        </Button>,
      ]}
      onCancel={_onCancel}
      onOk={_onOk}
    >
      <Form {...layout} form={form} name="basic" labelAlign="right" initialValues={initialValues}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="edId" hidden>
          <Input />
        </Form.Item>
        <Row>
          {column.map((v) => {
            return (
              <Col span={v.hidden ? 0 : 12} key={v.dataIndex}>
                <Form.Item
                  name={v.dataIndex}
                  label={v.title}
                  rules={v.tip ? rules : []}
                  hidden={v.hidden}
                >
                  {v.colType === 'select' ? (
                    <Select
                      onChange={(e, options) => _handleOnchange(e, options, v.dataIndex)}
                      disabled={v.disabled}
                      optionLabelProp="label"
                    >
                      {v.dataIndex === 'data_source'
                        ? v.colOptions.map((z, ind) => {
                            return (
                              <Option key={ind} value={z.name}>
                                {z.name}
                              </Option>
                            );
                          })
                        : v.colOptions.map((z, ind) => {
                            return (
                              <Option key={ind} value={z.value} label={z.description}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{z.description}</span>
                                  <span>{String(z.value)}</span>
                                </div>
                              </Option>
                            );
                          })}
                    </Select>
                  ) : v.colType === 'hidden' ? (
                    <Input type="hidden" />
                  ) : v.colType === 'inputNumber' ? (
                    <InputNumber style={{ width: '100%' }} />
                  ) : (
                    <Input disabled={v.disabled} />
                  )}
                </Form.Item>
              </Col>
            );
          })}
          {/* 类型为逆变器时显示 */}
          {
            <Col span={12} key="asset_num">
              <Form.Item shouldUpdate={(prev, next) => prev.type !== next.type} wrapperCol={24}>
                {/* eslint-disable-next-line */}
                {(form) =>
                  (form.getFieldValue('type') === 'N' || form.getFieldValue('type') === 'D') && (
                    <Form.Item name="asset_num" label="资产编号" rules={rules} {...layout}>
                      <Input />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </Col>
          }
        </Row>
      </Form>
    </Modal>
  );
};

class EventNoticeModal {
  __key__ = '';
  show = (record, column) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <EventModal
            type={record.dealType}
            record={record}
            column={column}
            callback={(obj) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(obj);
            }}
          />
        ),
        duration: null,
        dismiss: this.dismiss,
      });
    });
  };
  dismiss = () => {
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
}

const eventNoticeModal = new EventNoticeModal();
export default eventNoticeModal;

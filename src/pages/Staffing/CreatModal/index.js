import React from 'react';
import TRNotification from '#/utils/notification';
import { Modal, Input, Form, Button, Col, Row } from 'antd';

const layout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 14,
  },
};

const CreateForm = ({ onClose }) => {
  const [form] = Form.useForm();
  const onFinish = async () => {
    try {
      let res = await form.validateFields();
      if (res?.errorFields) return;
    } catch (e) {}
  };
  return (
    <Modal
      title={'新建岗位'}
      visible
      className="modalWraps"
      destroyOnClose
      footer={null}
      onCancel={() => {
        onClose && onClose();
      }}
    >
      <Form form={form} name="basic" {...layout}>
        <Form.Item
          name={'title'}
          label={'岗位名称'}
          rules={[
            {
              required: true,
              message: '请输入岗位名称',
            },
          ]}
        >
          <Input placeholder="请输入岗位名称" />
        </Form.Item>
        <Form.Item
          name={'explain'}
          label={'描述'}
          rules={[
            {
              required: true,
              message: '请输入岗位描述',
            },
          ]}
        >
          <Input placeholder="请输入岗位描述" />
        </Form.Item>
        <Row style={{ margin: '0', width: '100%' }}>
          <Col span={18} />
          <Col
            span={6}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '6px',
            }}
          >
            <Button
              onClick={() => {
                onClose && onClose();
              }}
            >
              返回
            </Button>
            <Button
              type="primary"
              onClick={() => {
                onFinish();
              }}
              style={{ marginLeft: '15px' }}
            >
              确定
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

class CreateAlert {
  __key__ = '';
  show = () => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <CreateForm
            onClose={(res) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(res || {});
            }}
          />
        ),
        dismiss: this.dismiss,
        duration: null,
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
const createAlert = new CreateAlert();
export default createAlert;

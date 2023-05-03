import React, { useState } from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import { addJob } from '@/services/timedTask';
import { HttpCode } from '#/utils/contacts';
import CreateCron from './createCron';
import { addArr } from './helper';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

export default function AddJob({ onClose }) {
  const [sumbitLoading, setSubmitLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [form] = Form.useForm();
  const [formList] = useState(() => {
    const _arr = [];
    addArr.forEach((v, i) => {
      _arr.push({
        label: addArr[i].title,
        name: addArr[i].dataIndex,
      });
    });
    return _arr;
  });
  const onFinish = async (values) => {
    if (
      !values.beanName ||
      !values.cronExpression ||
      !values.jobId ||
      !values.methodName ||
      !values.params
    ) {
      message.error('数据不能为空');
      return;
    }
    setSubmitLoading(true);
    const res = await addJob(values);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setSubmitLoading(false);
      message.success(res.message);
      onClose();
    } else {
      setSubmitLoading(false);
      message.error(res.message);
    }
  };

  const onFinishFailed = () => {};

  const onCreate = (values) => {
    form.setFieldsValue({ cronExpression: values });
    setVisible(false);
  };

  const openCron = (bool, stats) => {
    setVisible(bool);
    setStatus(stats);
  };

  return (
    <div>
      <Form
        form={form}
        {...layout}
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        style={{ margin: '40px' }}
      >
        <Row>
          {formList.map(({ name, label }, index) => {
            return (
              <Col key={index} span={10}>
                <Form.Item
                  label={label}
                  name={name}
                  key={index}
                  rules={[
                    {
                      required: true,
                      message: `${label}不能为空`,
                    },
                  ]}
                >
                  {name === 'cronExpression' ? (
                    <Input
                      style={{ width: '80%' }}
                      allowClear
                      onClick={() => openCron(true, '新建')}
                    />
                  ) : (
                    <Input style={{ width: '80%' }} />
                  )}
                </Form.Item>
              </Col>
            );
          })}
        </Row>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" loading={sumbitLoading}>
            确定
          </Button>
        </Form.Item>
      </Form>
      <CreateCron
        visible={visible}
        status={status}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
}


import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Space } from 'antd';
import tableKey from './helper';
import PropTypes from 'prop-types';
import styles from '../../common/style.less';

const layout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 12, span: 16 },
};

function Particulars({ data, handleClose, handleconfirm, loadings, status }) {
  const [form] = Form.useForm();
  const [itemArr] = useState(() => {
    const _arr = Object.values(tableKey);
    return _arr.reduce((start, val) => {
      start.push({
        label: val.title,
        name: val.dataIndex,
      });
      return start;
    }, []);
  });
  const onFinish = (value) => {
    handleconfirm(value, status);
  };
  const onFinishFailed = () => {
    handleClose();
  };
  return (
    <div className={styles.from_wrap}>
      {status === 'write' ? (
        <Form
          {...layout}
          name="basic"
          form={form}
          initialValues={data}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          style={{ marginTop: '15px' }}
        >
          {
            <Row>
              {itemArr.map(({ label, name }, index) => {
                return (
                  <Col span={10} key={index}>
                    <Form.Item label={label} name={name}>
                      {name === 'companyNum' || name === 'appyid' || name === 'menuid' ? (
                        <Input />
                      ) : (
                        <Input disabled bordered={false} />
                      )}
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>
          }
          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loadings}>
                提交
              </Button>
              <Button onClick={onFinishFailed}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <Form
          {...layout}
          name="basic"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          style={{ marginTop: '15px' }}
        >
          {
            <Row>
              <Col span={20}>
                <Form.Item
                  label="公司编码"
                  name="companyNum"
                  rules={[{ required: true, message: `请输入公司编码!` }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={20}>
                <Form.Item
                  label="应用ID"
                  name="appyid"
                  rules={[{ required: true, message: `请输入应用ID!` }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={20}>
                <Form.Item
                  label="菜单ID"
                  name="menuid"
                  rules={[{ required: true, message: `请输入菜单ID!` }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          }
          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loadings}>
                提交
              </Button>
              <Button onClick={onFinishFailed}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}
Particulars.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  handleconfirm: PropTypes.func,
  loadings: PropTypes.bool,
  status: PropTypes.string,
};

export default Particulars;

import React, { memo, useState } from 'react';
import { Form, Button, message, Space, Row, Col, Input } from 'antd';
import FormItem from '../../common/formItem';
import { addExernarToken } from '@/services/exernarToken';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import { data1 } from './helper';
import PropTypes from 'prop-types';
import styless from './style.less';

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 0,
  },
};
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 20 },
};
function Demo({ handleClose }) {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [itemArr] = useState(() => {
    const _arr = Object.values(data1);
    return _arr.reduce((start, val) => {
      if (val.dataIndex !== 'id') {
        start.push({
          label: val.colName,
          name: val.dataIndex,
        });
      }
      return start;
    }, []);
  });

  const onFinish = async (values) => {
    setSubmitLoading(true);
    const res = await addExernarToken({
      ...values,
    });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(`添加成功！`);
      setSubmitLoading(false);
      handleClose();
    } else {
      setSubmitLoading(false);
      tAlert.warning(res.message);
    }
  };

  const onFinishFailed = () => {};
  return (
    <div className={styless.add_stationMap}>
      <Form
        {...layout}
        labelAlign="right"
        name="basic"
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {
          <Row>
            {itemArr.map(({ label, name }, index) => (
              <Col span={8} key={index}>
                <FormItem label={label} name={name}>
                  <Input />
                </FormItem>
              </Col>
            ))}
          </Row>
        }
        <Form.Item {...tailLayout}>
          <Space>
            <Button onClick={() => handleClose('add')}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              确定
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

Demo.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  status: PropTypes.string,
};

export default memo(Demo);

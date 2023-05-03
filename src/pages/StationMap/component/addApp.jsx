import React, { memo, useEffect, useState } from 'react';
import { Form, Button, message, Space, Row, Col, Select } from 'antd';
import FormItem from '../../common/formItem';
import { addSystemVersion, UpdateDeptMapper } from '@/services/stationMap';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import tableKey from './data';
import styless from './style.less';

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 0,
  },
};

function Demo({ data, handleClose, status }) {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [itemArr] = useState(() => {
    const _arr = Object.values(tableKey);
    return _arr.reduce((start, val) => {
      if (val.dataIndex !== 'id') {
        start.push({
          label: val.title,
          name: val.dataIndex,
        });
      }
      return start;
    }, []);
  });

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data]);

  const onFinish = async (values) => {
    setSubmitLoading(true);
    const paramsData = status === 'add' ? { ...values } : { id: data.id, ...values };
    setSubmitLoading(true);
    const response =
      status === 'add' ? await addSystemVersion(paramsData) : await UpdateDeptMapper(paramsData);
    const statusText = status === 'add' ? '创建' : '编辑';
    if (response && response.statusCode === HttpCode.SUCCESS) {
      message.success(`${statusText}App版本升级成功！`);
      handleClose();
      setSubmitLoading(false);
    } else {
      setSubmitLoading(false);
      tAlert.warning(response.message);
    }
  };

  const onFinishFailed = () => {};
  return (
    <div className={styless.add_stationMap}>
      <Form
        // {...layout}
        labelAlign="right"
        name="basic"
        initialValues={data}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {
          <Row>
            {itemArr.map(({ label, name }, index) => (
              <Col span={8} key={index}>
                {index === 0 ? (
                  <Form.Item label={label} name={name}>
                    <Select>
                      <Select.Option value="south">南方中心</Select.Option>
                      <Select.Option value="north">北方中心</Select.Option>
                      <Select.Option value="northwest">西北中心</Select.Option>
                    </Select>
                  </Form.Item>
                ) : (
                  <FormItem label={label} name={name} key={index} />
                )}
              </Col>
            ))}
          </Row>
        }
        <Form.Item {...tailLayout}>
          <Space>
            <Button onClick={() => handleClose()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              确定
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default memo(Demo);

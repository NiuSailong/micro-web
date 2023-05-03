import React, { memo, useEffect, useState } from 'react';
import { Form, Button, message, Space } from 'antd';
import FormItem from '../../common/formItem';
import { addDictionary } from '@/services/dictionaries';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import styles from '../../common/style.less';

const layout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 14,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const dataArr = [
  {
    name: 'code',
    label: '字典编码',
  },
  {
    name: 'description',
    label: '字典描述',
  },
  {
    name: 'name',
    label: '字典名称',
  },
];

function Demo({ data, handleClose }) {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data]);

  const onFinish = async (values) => {
    setSubmitLoading(true);
    const res = await addDictionary(values);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(`创建字典值成功！`);
      handleClose();
      setSubmitLoading(false);
    } else {
      setSubmitLoading(false);
      tAlert.warning(res.message);
    }
  };

  const onFinishFailed = () => {};

  return (
    <div className={styles.from_wrap}>
      <Form
        {...layout}
        name="basic"
        initialValues={data}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {dataArr.map(({ label, name }, index) => (
          <FormItem label={label} name={name} key={index} />
        ))}
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

import React, { memo, useEffect, useState } from 'react';
import { Form, Button, message, Space } from 'antd';
import FormItem from '../../common/formItem';
import { addAppVersions, updateAppVersions } from '../../../services/appVersions';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import tableKey from './helper';
import PropTypes from 'prop-types';
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
    offset: 10,
    span: 10,
  },
};

function Demo({ data, handleClose, status }) {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [itemArr] = useState(() => {
    const _arr = Object.values(tableKey);
    return _arr.reduce((start, val) => {
      if (val.dataIndex !== 'id' && val.dataIndex !== 'createTime') {
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
      status === 'add' ? await addAppVersions(paramsData) : await updateAppVersions(paramsData);
    const statusText = status === 'add' ? '创建' : '编辑';
    if (response && response.statusCode === HttpCode.SUCCESS) {
      message.success(`${statusText}App版本升级成功！`);
      handleClose(false);
      setSubmitLoading(false);
    } else {
      setSubmitLoading(false);
      tAlert.warning(response.message);
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
        {itemArr.map(({ label, name }, index) => (
          <FormItem label={label} name={name} key={index} />
        ))}
        <Form.Item {...tailLayout}>
          <Space>
            <Button onClick={() => handleClose(true)}>取消</Button>
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

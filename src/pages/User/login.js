import React from 'react';
import styles from './index.less';
import { Form, Input, Button } from 'antd';
import { fakeAccountLogin } from '#/services/login';
import { HttpCode } from '#/utils/contacts';
import Message from '#/components/Message';
import { setAuthorization } from '#/utils/authority';
import { history } from 'umi';
import { connect } from 'dva';

const Login = ({ dispatch }) => {
  const onFinish = async (values) => {
    let res = await fakeAccountLogin({
      ...values,
      edition: 'W1.0',
      companynum: 'goldwind',
      source: 'web',
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      await setAuthorization(res?.token);
      dispatch({
        type: 'global/onSaveGlobalData',
        payload: { token: res.token },
        successCallback: () => {
          history.replace('/');
        },
      });
    } else {
      Message.error(res?.message || '登录失败');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>登录</div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请填写用户名' }]}
        >
          <Input placeholder={'手机号'} />
        </Form.Item>

        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请填写密码' }]}>
          <Input.Password placeholder={'密码'} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 10 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default connect()(Login);

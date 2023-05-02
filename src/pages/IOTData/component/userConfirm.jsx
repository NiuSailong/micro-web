import React, { Component } from 'react';
import { Modal, Button, Spin, Input, message, ConfigProvider } from 'antd';
import TRNotification from '#/utils/notification';
import { AlertResult, HttpCode } from '#/utils/contacts';

import { userInfoConfirm } from '@/services/iotData';
const { TextArea } = Input;

import zhCN from 'antd/es/locale/zh_CN';
class UserConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      spinning: false,
      userName: '',
      passWord: '',
      reason: '',
    };
  }
  componentDidMount() {}

  handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.props.onPress({ index: AlertResult.CANCEL });
    });
  };

  handleOk = async () => {
    const { reason } = this.state;
    const { topic } = this.props;
    this.setState({ spinning: true });
    let res = await userInfoConfirm({
      topic,
      reason,
    });
    this.setState({ spinning: false });
    if (res.statusCode === HttpCode.SUCCESS) {
      message.success('用户确认成功');
      this.setState({ visible: false }, () => {
        this.props.onPress({ index: AlertResult.SUCCESS });
      });
    } else {
      message.error(res?.message || '用户确认失败');
    }
  };

  render() {
    const { spinning } = this.state;

    return (
      <Modal
        width={400}
        maskClosable={false}
        centered={true}
        closable={false}
        visible={this.state.visible}
        footer={[
          <Button onClick={this.handleCancel} key={'cancelBtn'}>
            取消
          </Button>,
          <Button type="primary" onClick={this.handleOk} key={'submitBtn'}>
            提交
          </Button>,
        ]}
        title={<div>用户确认</div>}
      >
        <Spin spinning={spinning}>
          <ConfigProvider locale={zhCN}>
            取消原因
            <TextArea
              onChange={(e) => this.setState({ reason: e.target.value })}
              rows={3}
              maxLength={200}
              style={{ marginTop: 10 }}
            />
          </ConfigProvider>
        </Spin>
      </Modal>
    );
  }
}

class AlertModal {
  __key__ = '';

  show = (obj = {}) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <UserConfirm
            {...obj}
            onPress={(result) => {
              this.dismiss();
              resolve(result);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = () => {
    TRNotification.remove(this.__key__);
    this.__key__ = '';
  };
}

const tAlert = new AlertModal();
export default tAlert;

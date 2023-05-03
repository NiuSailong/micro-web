import React, { Component } from 'react';
import { Modal, Input } from 'antd';
import TRNotification from '#/utils/notification';
import styles from './index.less';
import { AlertResult } from '#/utils/contacts';
import { InfoCircleOutlined } from '#/utils/antdIcons';

class AlertModalComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      value: this.props.inputDefaultValue,
    };
  }

  render() {
    return (
      <Modal
        width={408}
        okText="提交"
        cancelText="取消"
        maskClosable={false}
        centered={true}
        closable={false}
        open={this.state.visible}
        okButtonProps={{ disabled: !this.state.value }}
        onOk={() => {
          this.props._onFn(AlertResult.SUCCESS, this.state.value);
        }}
        onCancel={() => {
          this.setState({ visible: false });
          this.props._onFn(AlertResult.CANCEL, this.state.value);
        }}
        className={`${styles.inputAlertModalComponent} modalWraps`}
        title={
          <div className={styles.title}>
            <div className={styles.icon}>
              <InfoCircleOutlined style={{ color: '#faad14', marginRight: 16, fontSize: 22 }} />
            </div>
            {this.props.title || ''}
          </div>
        }
      >
        <Input
          maxLength={30}
          value={this.state.value}
          onChange={(e) => this.setState({ value: e.target.value })}
        />
      </Modal>
    );
  }
}
const msgConent = function (msg) {
  return <div>{msg}</div>;
};

class AlertModal {
  __key__ = '';
  show = (msg, inputDefaultValue, callback) => {
    if (this.__key__ !== '') {
      return;
    }
    this.__key__ = String(Date.now());
    let fn = (index, inputValue) => {
      callback && callback({ index, inputValue });
    };
    TRNotification.add({
      key: this.__key__,
      content: <AlertModalComponent title={msg} inputDefaultValue={inputDefaultValue} _onFn={fn} />,
      duration: null,
    });
  };
  dismiss = () => {
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
  warning = (msg) => {
    return new Promise((resolve) => {
      Modal.warning({
        centered: true,
        okText: '确认',
        title: msgConent(msg),
        onOk() {
          resolve({ index: 1 });
        },
      });
    });
  };
  Success = (msg) => {
    Modal.success({
      centered: true,
      okText: '确认',
      title: msgConent(msg),
    });
  };
  Info = (msg) => {
    Modal.info({
      centered: true,
      okText: '确认',
      title: msgConent(msg),
    });
  };
  longWarning = (msg, message) => {
    return new Promise((resolve) => {
      Modal.warning({
        centered: true,
        okText: '确认',
        title: msg,
        content: msgConent(message),
        onOk() {
          resolve({ index: 1 });
        },
      });
    });
  };

  error = (msg, message) => {
    var obj = {};
    if (message) {
      obj.content = '失败原因：' + message;
    }
    Modal.error({
      centered: true,
      okText: '确认',
      title: msgConent(msg),
      ...obj,
    });
  };
}

const tAlert = new AlertModal();
export default tAlert;

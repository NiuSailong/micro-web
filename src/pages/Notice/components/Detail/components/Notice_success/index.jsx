import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from './index.less';
import { CheckCircleOutlined } from '#/utils/antdIcons';

const { confirm } = Modal;
class NoticeSuccess extends Component {
  componentDidMount() {}

  showConfirm(onPress) {
    // eslint-disable-next-line camelcase
    const { Notice_success } = styles;
    confirm({
      icon: (
        <CheckCircleOutlined
          style={{
            fontSize: '60px',
            color: '#28B28B',
          }}
        />
      ),
      onOk() {
        onPress(true);
      },
      onCancel() {
        onPress(false);
      },
      okType: 'Default',
      width: '500px',
      content: '发布成功',
      className: Notice_success,
      okText: '返回列表',
      cancelText: '继续发布',
    });
  }

  render() {
    return null;
  }
}

export default NoticeSuccess;

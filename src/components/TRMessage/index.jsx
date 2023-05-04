import { message } from 'antd';
import { isTRString } from '@/utils/attribute';
import React from 'react';

class Message {
  init() {
    message.config({
      top: '50%',
      duration: 2,
      maxCount: 3,
    });
  }
  success = (msg = '') => {
    if (msg.length == 0) {
      return;
    }
    this.init();
    message.success(msg);
  };
  error = (msg = '') => {
    if (msg.length == 0) {
      return;
    }
    this.init();
    if (isTRString(msg)) {
      message.error(msg);
    } else {
      message.error({ content: msg, icon: <div /> });
    }
  };
  warning = (msg = '') => {
    if (msg.length == 0) {
      return;
    }
    this.init();
    message.warning(msg);
  };
  info = (msg = '') => {
    if (msg.length == 0) {
      return;
    }
    this.init();
    message.info(msg);
  };
}

const tMessage = new Message();
export default tMessage;

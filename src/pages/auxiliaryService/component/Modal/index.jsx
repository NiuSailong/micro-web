import React, { useState } from 'react';
import { Modal } from 'antd';
import styles from './style.less';
import TRNotification from '#/utils/notification';

const ModalHoc = function (WarpComComponent) {
  return function HOCComponent(props) {
    const [isModalVisible, setModalVisible] = useState(true);
    /*eslint-disable*/
    const { title = '', closeIcon, fetchResult, onPress = () => {}, width } = props;
    const handleCancel = () => {
      setModalVisible(false);
      fetchResult();
      // onPress();
    };
    return (
      <Modal
        wrapClassName={styles.modal_wrap}
        visible={isModalVisible}
        maskClosable={false}
        footer={null}
        // centered
        onCancel={handleCancel}
        title={title}
        width={width}
        centered
      >
        <div className={styles.modal_content}>
          {/* <div className={styles.space}/> */}
          <div className={styles.modal_component}>
            <WarpComComponent {...props} handleCancel={handleCancel} />
          </div>
          {/* <div className={styles.space}/> */}
        </div>
      </Modal>
    );
  };
};

class dModal {
  __key__ = '';
  show = (params = {}, childComponent) => {
    return new Promise((resolve) => {
      this.__key__ = String(Date.now());
      const Child = ModalHoc(childComponent);
      TRNotification.add({
        key: this.__key__,
        content: (
          <Child
            {...params}
            onPress={(result) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
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

const hocModal = new dModal();
export default hocModal;

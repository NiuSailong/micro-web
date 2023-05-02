import React, { useState } from 'react';
import { Drawer } from 'antd';
import TRNotification from '#/utils/notification';
import styles from './index.less';

const DrawerComponent = ({ title, iconType, onPress, MyComponent, width = 1400 }) => {
  const [visible, setVisible] = useState(true);

  const _title = () => {
    return (
      <div className={styles.title}>
        <img src="data:image/png;base64,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" />
        <div className={styles.iconText}>{title}</div>
      </div>
    );
  };
  const _onCloseDrawer = () => {
    setVisible(false);
    onPress({ index: 0 });
  };
  const _onSave = () => {
    onPress({
      index: 1,
    });
  };
  return (
    <Drawer
      className={styles._drawer}
      title={_title()}
      width={width}
      onClose={_onCloseDrawer}
      visible={visible}
    >
      {<MyComponent save={_onSave} />}
    </Drawer>
  );
};
class MyDrawer {
  __key__ = '';

  show = (props) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') return;
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <DrawerComponent
            {...props}
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
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
}

export default new MyDrawer();

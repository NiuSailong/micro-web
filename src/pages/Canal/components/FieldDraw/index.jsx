import React, { useState } from 'react';
import styles from './index.less';
import { Button, Drawer } from 'antd';
import TRNotification from '#/utils/notification';
import IndexComp from '../IndexComp';
import { menuCode } from '@/pages/Canal/helper';
import PropTypes from 'prop-types';

const FieldDraw = ({ indexName }) => {
  const [visible, setVisible] = useState(true);
  const cancel = () => {
    setVisible(false);
  };
  return (
    <Drawer width={'90%'} visible={visible} onClose={cancel} className={styles.fieldDraw}>
      <IndexComp menuCode={menuCode.field} indexName={indexName} />
      <div className={styles.btnBox}>
        <Button className={styles.btn} onClick={cancel}>
          返回
        </Button>
      </div>
    </Drawer>
  );
};

FieldDraw.propTypes = {
  indexName: PropTypes.string,
};

class CheckDrawerRef {
  show = (params, __key__) => {
    return new Promise((resolve) => {
      TRNotification.add({
        key: __key__,
        content: (
          <FieldDraw
            {...params}
            onPress={(obj) => {
              this.dismiss();
              resolve(obj);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = (clear, __key__) => {
    if (clear) {
      TRNotification.clear();
    } else {
      TRNotification.remove(__key__);
    }
  };
}

const drawer = new CheckDrawerRef();
export default drawer;

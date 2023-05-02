import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Spin } from 'antd';
import { useTrigger } from '../Hooks/useTrigger';
import TRNotification from '#/utils/notification';
import PropTypes from 'prop-types';
import { queryOperationLogNumByAndTime } from '@/services/logAnalysis';
import Message from '#/components/Message';
import styles from './index.less';

const { TabPane } = Tabs;
const EditModalComponent = ({ data, onPress, startTime, endTime }) => {
  const [dataList, setDataList] = useState();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [current, setCurrent] = useState(data[0]);
  const trigger = useTrigger({
    titleText: '测试',
  });

  const fetchList = async (cur) => {
    const params = {
      type: cur,
      startTime,
      endTime,
    };
    setDataList([]);
    const result = await queryOperationLogNumByAndTime(params);
    if (result.results) {
      const keyValue = Object.keys(result.results);
      const newArr = [];
      keyValue &&
        keyValue.forEach((value) => {
          const obj = {
            key: value,
            value: result.results[value],
          };
          newArr.push(obj);
        });
      setDataList(newArr);
    } else {
      setDataList([]);
    }
  };

  useEffect(() => {
    trigger.open();
    fetchList(current);
  }, [current]);

  const handleClick = (key) => {
    setCurrent(key);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    if (dataList.length) {
      setSubmitLoading(false);
      trigger.close();
      onPress && onPress({ index: 1 });
    } else {
      setSubmitLoading(false);
      Message.warning('数据加载中');
    }
  };
  const itemRender = (dList = []) => {
    return (
      <div className={styles.listBox}>
        {dList.length ? (
          dList.map((value, index) => (
            <p key={index} className={styles.pList}>
              <span className={styles.leftSpan}>{value.key}</span>
              <span className={styles.spSpace}>:</span>
              <span className={styles.rightSpan}>{value.value}</span>
            </p>
          ))
        ) : (
          <Spin className={styles.spinLoad} />
        )}
      </div>
    );
  };

  const footerRender = [
    <Button key="dtest1" onClick={trigger.close}>
      取消
    </Button>,
    <Button key="dtest2" type="primary" loading={submitLoading} onClick={handleSubmit}>
      确认
    </Button>,
  ];

  return (
    <Modal
      wrapClassName={trigger.wrapClassName}
      visible={trigger.visible}
      onClose={trigger.close}
      width={800}
      centered
      maskClosable={false}
      title={trigger.title}
      footer={footerRender}
      onCancel={trigger.close}
    >
      <div className={styles.itemDiv}>
        <Tabs defaultActiveKey={0} onChange={handleClick}>
          {data.map((item, index) => (
            <TabPane tab={item} key={item}>
              <div key={index}>
                <span className={styles.title}> {item.usedElectType}</span>
                {itemRender(dataList)}
              </div>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </Modal>
  );
};

/**

 */
class EditModal {
  __key__ = '';

  show = ({ data = [], startTime, endTime }) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <EditModalComponent
            data={data}
            onPress={(obj) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(obj);
            }}
            startTime={startTime}
            endTime={endTime}
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
EditModalComponent.propTypes = {
  title: PropTypes.string,
  titleSrc: PropTypes.string,
  data: PropTypes.object,
  onPress: PropTypes.func,
  menuModal: PropTypes.object,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
};
const RuleEditModal = new EditModal();
export default RuleEditModal;

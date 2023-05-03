import React, { useState, useEffect } from 'react';
import { jobList, runJob } from '@/services/timedTask';
import { HttpCode } from '#/utils/contacts';
import { Modal, Button, Select, message } from 'antd';
import styles from './model.less';

const { Option } = Select;

export default function ImplementModel() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobIds, setJobIds] = useState([]);
  const [selectJob, setSelectObj] = useState(1);
  const [butLoading, setButLoading] = useState(false);
  const [selectValue, setSelectValue] = useState(1);
  const [selectLoading, setSelectLoading] = useState(false);

  const getList = async () => {
    setSelectLoading(true);
    const res = await jobList({
      pageNum: 1,
      pageSize: 100000,
    });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const jList = res.dataResults.map((v) => {
        return { id: v.jobId, top: v.remark };
      });
      setJobIds(jList);
      setSelectLoading(false);
    } else {
      message.error(res.message);
    }
  };

  useEffect(() => {
    getList();
  }, [jobList, selectJob]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    setButLoading(true);
    const res = await runJob(selectJob);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(res.message);
      setButLoading(false);
      setIsModalVisible(false);
      setSelectValue(jobIds[0].id);
    } else {
      message.error(res.message);
      setButLoading(false);
      setSelectValue(jobIds[0].id);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectValue(jobIds[0].id);
  };

  const handleChange = (value) => {
    setSelectObj(value);
    setSelectValue(value);
  };

  return (
    <>
      <Button onClick={showModal}>手动执行</Button>
      <Modal
        title="手动执行"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ loading: butLoading }}
      >
        <div className={styles.space}>
          <Select
            loading={selectLoading}
            value={selectValue}
            style={{ width: '100%' }}
            onChange={handleChange}
          >
            {jobIds.map((value, index) => {
              return (
                <Option key={index} value={value.id}>
                  <p className={styles.opSpace}>
                    <span>Id: {value.id}</span>
                    <span>{value.top}</span>
                  </p>
                </Option>
              );
            })}
          </Select>
        </div>
      </Modal>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
// import QnnReactCron from 'qnn-react-cron'; TODO

export const CronChange = ({ label, onCreate }) => {
  let cronFns;
  const [value, setValue] = useState(() => {
    if (label !== undefined) {
      return label;
    }
    return '* * * * * ? *';
  });
  return (
    <>
      <div style={{ textAlign: 'center', margin: '12px 0px' }}>预览：{value}</div>
      <QnnReactCron
        value={value}
        onOk={() => {}}
        getCronFns={(_cronFns) => {
          cronFns = _cronFns;
        }}
        style={{ width: '500px', height: '500px' }}
        footer={[
          <Button
            key="cencel"
            style={{ marginRight: 10 }}
            onClick={() => {
              setValue('* * * * * ? *');
              onCreate('* * * * * ? *');
            }}
          >
            重置
          </Button>,
          <Button
            key="getValue"
            type="primary"
            onClick={() => {
              setValue(cronFns.getValue());
              onCreate(cronFns.getValue());
            }}
          >
            生成
          </Button>,
        ]}
      />
    </>
  );
};

export default function CreateCron(props = {}) {
  const { onCreate, onCancel, cronData, title = 'cron', visible = false } = props;
  useEffect(() => {}, [cronData]);

  return (
    <Modal
      width="550px"
      title={title}
      visible={visible}
      onOk={onCreate}
      onCancel={onCancel}
      footer={false}
    >
      {/*<CronChange label={cronData} onCreate={onCreate} />*/}
    </Modal>
  );
}

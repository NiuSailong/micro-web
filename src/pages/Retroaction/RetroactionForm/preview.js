import React from 'react';
import TRNotification from '#/utils/notification';
import { Modal, Input } from 'antd';
import { AntdBaseTable } from '@/pages/components/TBaseTable.tsx';

const PreviewModal = ({ dataList = [], onClose }) => {
  const [serchKey, setSerchKey] = React.useState('');
  const array = serchKey.length > 0 ? dataList.filter((n) => n.includes(serchKey)) : [...dataList];
  const userList = array.map((n) => {
    let arr = n.split(',') || [];
    return {
      id: arr[2] || '-',
      name: arr[0] || '-',
      mobile: arr[1] || '-',
    };
  });
  return (
    <Modal
      title={'投放用户列表'}
      visible
      onCancel={() => {
        onClose && onClose();
      }}
      footer={null}
    >
      <Input.Search
        style={{ marginBottom: '20px', width: '200px' }}
        onChange={({ target: { value } }) => {
          setSerchKey(value || '');
        }}
      />
      <AntdBaseTable
        useVirtual={true}
        defaultColumnWidth={100}
        columns={[
          { name: '用户id', code: 'id', width: 80 },
          { name: '姓名', code: 'name' },
          { name: '手机号', code: 'mobile' },
        ]}
        dataSource={userList}
        isStickyHeader={true}
        style={{
          '--header-bgcolor': '#f5f7fa',
          '--color': '#373E48',
          width: '100%',
          overflow: 'auto',
          maxHeight: 450,
          border: '1px solid #E7E7E7',
          borderBottom: 'none',
        }}
      />
    </Modal>
  );
};

class PreAlert {
  __key__ = '';
  show = (param) => {
    if (this.__key__.length === 0) {
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <PreviewModal
            {...param}
            onClose={() => {
              this.dismiss();
            }}
          />
        ),
        dismiss: this.dismiss,
      });
    }
  };
  dismiss = () => {
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
}
const preview = new PreAlert();
export default preview;

import React, { useEffect, useState, memo } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import styles from './style.less';

function TitleModal({ visible, onCreate, onCancel, backData }) {
  const [formArr] = useState(() => {
    const _arr = [
      {
        label: 'ID',
        name: 'id',
      },
      {
        label: '字典编码',
        name: 'code',
      },
      {
        label: '字典名称',
        name: 'name',
      },
      {
        label: '字典描述',
        name: 'description',
      },
    ];
    return _arr;
  });

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(backData);
  }, [backData]);

  return (
    <Modal
      className={styles.modal_wrap}
      visible={visible}
      title={'编辑标题'}
      okText="保存"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreate(values);
          })
          .catch(() => {});
      }}
    >
      <Form form={form} name="form_in_modal" initialValues={backData}>
        {formArr.map(({ name, label }, index) =>
          name === 'id' ? (
            <Form.Item
              key={index}
              name={name}
              label={label}
              style={{ display: 'none' }}
              rules={[
                {
                  required: true,
                  message: `请输入${label}!`,
                },
              ]}
            >
              <Input.TextArea autoSize={true} allowClear disabled />
            </Form.Item>
          ) : (
            <Form.Item
              key={index}
              name={name}
              label={label}
              rules={[
                {
                  required: true,
                  message: `请输入${label}!`,
                },
              ]}
            >
              <Input.TextArea autoSize={true} allowClear />
            </Form.Item>
          ),
        )}
      </Form>
    </Modal>
  );
}

TitleModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
  backData: PropTypes.object,
};

export default memo(TitleModal);

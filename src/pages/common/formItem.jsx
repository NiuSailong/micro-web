import React from 'react';
import { Form, Input } from 'antd';
import PropTypes from 'prop-types';

FormItem.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  message: PropTypes.string,
  required: PropTypes.bool,
  key: PropTypes.number,
};

export default function FormItem({ label, name, message, required = true, key }) {
  return (
    <Form.Item
      key={key}
      label={label}
      name={name}
      rules={[
        {
          required,
          message,
        },
      ]}
    >
      <Input.TextArea autoSize={true} allowClear />
    </Form.Item>
  );
}

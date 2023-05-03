import React from 'react';
import { Form, Input } from 'antd';

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

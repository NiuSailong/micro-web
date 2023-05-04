import React from 'react';
import { Form, Input, Col, TimePicker, Select } from 'antd';

function TRForm({
  title,
  dataIndex,
  notRules = false,
  rules = [],
  type = 'input',
  selectOptions,
  comProps,
}) {
  return (
    <Col span={8}>
      <Form.Item
        col={3}
        label={title}
        name={dataIndex}
        rules={notRules ? null : [{ required: true, message: `请输入${title}` }, ...rules]}
      >
        {type === 'input' ? (
          <Input
            {...comProps}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          />
        ) : type === 'timePicker' ? (
          <TimePicker style={{ width: '100%' }} {...comProps} />
        ) : type === 'select' ? (
          <Select options={selectOptions} style={{ width: '100%' }} {...comProps} />
        ) : null}
      </Form.Item>
    </Col>
  );
}

export default TRForm;

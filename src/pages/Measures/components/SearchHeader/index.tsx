import { useDebounceFn } from 'ahooks';
import { Button, Form, Input, Select, Space } from 'antd';
import React, { useState } from 'react';
import { DEVICE_TYPE, MEASURES_TYPE } from '../../helper';
import styles from './index.less';
const { Option } = Select;
interface searchHeaderType {
  onFinish: (value: any) => void;
  onreset: () => void;
  setOtherSearch: (params: any) => void;
}
const SearchHeader: React.FC<searchHeaderType> = ({ onFinish, onreset, setOtherSearch }) => {
  const [form] = Form.useForm();
  const [searchData, setSearchData] = useState({});
  const onReset = () => {
    form.resetFields();
    onreset();
  };
  const { run } = useDebounceFn(
    () => {
      form.submit();
    },
    {
      wait: 500,
    },
  );
  const onChange = (id: string, val: string) => {
    setSearchData({ ...searchData, [id]: val });
    setOtherSearch({ ...searchData, [id]: val });
  };
  return (
    <div className={styles.header}>
      <Form form={form} layout="inline" onFinish={onFinish}>
        <Form.Item name="deviceType" label="工作票类型">
          <Select
            onChange={(val) => onChange('deviceType', val)}
            placeholder="请选择工作票类型"
            allowClear
            style={{ width: 180 }}
          >
            {DEVICE_TYPE.map((item) => (
              <Option value={item.deviceType} key={item.deviceType}>
                {item.deviceTypeDesc}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="measureType" label="措施">
          <Select
            onChange={(val) => onChange('measureType', val)}
            placeholder="请选择措施"
            allowClear
            style={{ width: 180 }}
          >
            {MEASURES_TYPE.map((item) => (
              <Option value={item.measureType} key={item.measureType}>
                {item.measureTypeDesc}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="type" label="作业或任务">
          <Input placeholder="请输入作业或任务" />
        </Form.Item>
      </Form>
      <Space>
        <Button type="primary" onClick={run}>
          查询
        </Button>
        <Button onClick={onReset}>重置</Button>
      </Space>
    </div>
  );
};

export default SearchHeader;

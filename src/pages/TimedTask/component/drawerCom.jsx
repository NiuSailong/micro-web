import React, { useState, useEffect } from 'react';
import { Col, Row, Table, Form, Input } from 'antd';
import { logList } from '@/services/timedTask';
import { listArr, lookupArr } from './helper';
import CreateCron from './createCron';
import PropType from 'prop-types';
import styles from './drawer.less';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
export default function DrawerCom({ data }) {
  const [titleArr, setTitleArr] = useState([]);
  const [logObj, setLogObj] = useState({});
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [valuea, setValuea] = useState('');

  const getLogList = async () => {
    setTableLoading(true);
    const res = await logList({ jobId: data.jobId, pageNum: current, pageSize });
    setLogObj(res);
    res && setTableLoading(false);
  };

  useEffect(() => {
    const newArr = [];
    lookupArr.forEach((v, i) => {
      newArr.push({
        label: lookupArr[i].title,
        value: data[v.dataIndex],
        dataIndex: lookupArr[i].dataIndex,
      });
    });
    setTitleArr(newArr);
    getLogList();
  }, [data, logList, current, pageSize]);

  const pageChange = (page, pSize) => {
    setCurrent(page);
    setPageSize(pSize);
  };

  const cronClick = (sta, values) => {
    setVisible(true);
    setStatus(sta);
    setValuea(values);
  };

  const onCreate = () => {
    setVisible(false);
  };

  return (
    <div className={styles.maxMar}>
      <Form {...layout} initialValues={data}>
        <Row className={styles.rowSpace}>
          {titleArr.map(({ value, label, dataIndex }, index) => {
            return (
              <Col key={index} span={10}>
                <Form.Item label={label} name={value}>
                  {dataIndex === 'cronExpression' ? (
                    <Input
                      style={{ width: '400px' }}
                      onClick={() => cronClick('查看', value)}
                      bordered={false}
                      defaultValue={value}
                    />
                  ) : (
                    <Input
                      style={{ width: '400px' }}
                      disabled
                      bordered={false}
                      defaultValue={value}
                    />
                  )}
                </Form.Item>
              </Col>
            );
          })}
        </Row>
      </Form>

      <CreateCron
        cronData={valuea}
        visible={visible}
        status={status}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />

      <Table
        loading={tableLoading}
        dataSource={logObj.dataResults}
        columns={listArr}
        scroll={{ x: 1000 }}
        size="small"
        pagination={{
          size: 'small',
          pageSizeOptions: ['10', '20', '50'],
          showSizeChanger: true,
          showQuickJumper: true,
          current: current || 1,
          total: logObj.total,
          pageSize,
          onChange: (page, pSize) => pageChange(page, pSize),
        }}
      />
    </div>
  );
}

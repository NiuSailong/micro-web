import React, { useState, useEffect } from 'react';
import { Drawer, List, Checkbox, Table, Button, message } from 'antd';
import { findRateByPowerUserNo, choiceRateInfo } from '@/services/dataAnalysis';
import { HttpCode } from '#/utils/contacts';
import styles from './style.less';

export default function FirstModel({ visible, onClose, dataId, a, getData }) {
  const [data, setData] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const fetchList = async () => {
    const res = await findRateByPowerUserNo('');
    if (res && res.statusCode === HttpCode.SUCCESS) {
      res.data.forEach((v) => {
        a.forEach((value) => {
          if (value.rateId === v.rateId) {
            v.check = true;
          }
        });
      });
      setData(res.data);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    {
      title: '名称',
      dataIndex: 'rateName',
      width: '100',
      ellipsis: true,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: '100',
      ellipsis: true,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: '100',
      ellipsis: true,
    },
  ];

  const boxChange = (item) => {
    item.check = !item.check;
  };

  const back = async () => {
    setBtnLoading(true);
    setListLoading(true);
    const newList = [];
    data.forEach((v) => {
      if (v.check) {
        newList.push(v.rateId);
      }
    });
    const res = await choiceRateInfo({ powerUserNo: dataId, rateIds: newList.join(',') });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(res.message);
      onClose();
    } else {
      message.error(res.message);
    }
    getData();
    setBtnLoading(false);
    setListLoading(false);
  };

  return (
    <div>
      <Drawer title="全部峰平谷" placement="right" width="90%" onClose={onClose} visible={visible}>
        <List
          loading={listLoading}
          itemLayout="horizontal"
          dataSource={data}
          header={
            <p className={styles.pFlex}>
              <span>ID</span>
              <span>月份</span>
              <span>描述</span>
              <span>失效时间</span>
              <span>峰平谷时段</span>
            </p>
          }
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                description={[
                  <div className={styles.list} key={item.rateId}>
                    <Checkbox
                      defaultChecked={item.check}
                      className={styles.fontSizes}
                      onChange={() => boxChange(item)}
                    >
                      {item.rateId}
                    </Checkbox>
                    <span className={styles.fontSizes}>
                      {item.startMonth} —— {item.endMonth} 月份
                    </span>
                    <span>{item.description ? item.description : '-'}</span>
                    <span>{item.rateDeadline ? item.rateDeadline : '-'}</span>
                    <Table
                      className={styles.tableWrapper}
                      max-width="20%"
                      size="small"
                      dataSource={item.list}
                      columns={columns}
                      pagination={false}
                    />
                  </div>,
                ]}
              />
            </List.Item>
          )}
        />
        <p className={styles.btnSpace}>
          <Button type="primary" onClick={back} loading={btnLoading}>
            保存
          </Button>
        </p>
      </Drawer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Space, Table, message } from 'antd';
import { logList, updateJob, pauseJob, resumeJob, cronCheck } from '@/services/timedTask';
import { titleArr, listArr } from './helper';
import { HttpCode } from '#/utils/contacts';
import CreateCron from './createCron';
import styles from './formCom.less';
import PropType from 'prop-types';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

export const TableList = ({ TabData }) => {
  const [logObj, setLogObj] = useState({});
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);

  const getLogList = async () => {
    setTableLoading(true);
    const res = await logList({ jobId: TabData.jobId, pageNum: current, pageSize });
    setLogObj(res);
    res && setTableLoading(false);
  };

  useEffect(() => {
    getLogList();
  }, [TabData, current, pageSize]);

  const pageChange = (page, pSize) => {
    setCurrent(page);
    setPageSize(pSize);
  };

  return (
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
  );
};

export default function FormCom({ data, onClose }) {
  const [preservation, setPreservation] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('');

  const [formArr] = useState(() => {
    const _list = [];
    titleArr.forEach((v, i) => {
      _list.push({
        name: titleArr[i].dataIndex,
        label: titleArr[i].title,
      });
    });
    return _list;
  });

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ ...data });
  }, [data]);

  const onFinish = async (values) => {
    setPreservation(true);
    const res = await updateJob(values);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setPreservation(false);
      message.success(res.message);
      onClose();
    } else {
      message.error(res.message);
      setPreservation(false);
    }
  };
  const onFinishFailed = () => {};

  const otherClick = async (type) => {
    if (type === 'pause') {
      setPauseLoading(true);
      const res = await pauseJob(data.jobId);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        setPauseLoading(false);
        onClose();
      } else {
        message.error(res.message);
        setPauseLoading(false);
      }
    } else if (type === 'resume') {
      setResumeLoading(true);
      const res = await resumeJob(data.jobId);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        setResumeLoading(false);
        onClose();
      } else {
        message.error(res.message);
        setResumeLoading(false);
      }
    } else {
      setCheckLoading(true);
      const res = await cronCheck({ cron: form.getFieldsValue().cronExpression });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        setCheckLoading(false);
      } else {
        message.error(res.message);
        setCheckLoading(false);
      }
    }
  };

  const onCreate = (values) => {
    form.setFieldsValue({ cronExpression: values });
    setVisible(false);
  };

  const openCron = (bool, stat) => {
    setVisible(bool);
    setStatus(stat);
  };

  return (
    <div className={styles.maxMar}>
      <Form
        {...layout}
        form={form}
        initialValues={data}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row className={styles.rowSpace}>
          {formArr.map(({ name, label }, index) => {
            return (
              <Col key={index} span={10}>
                <Form.Item label={label} name={name}>
                  {name === 'createTime' || name === 'jobId' || name === 'status' ? (
                    <Input style={{ width: '400px' }} allowClear disabled />
                  ) : name === 'cronExpression' ? (
                    <Input
                      style={{ width: '400px' }}
                      allowClear
                      onClick={() => openCron(true, '编辑')}
                    />
                  ) : (
                    <Input style={{ width: '400px' }} allowClear />
                  )}
                </Form.Item>
              </Col>
            );
          })}
        </Row>

        <Form.Item {...tailLayout}>
          <Space>
            {data.status !== '暂停' ? (
              <Button
                type="dashed"
                danger
                loading={pauseLoading}
                onClick={() => otherClick('pause')}
              >
                暂停
              </Button>
            ) : (
              <Button type="dashed" loading={resumeLoading} onClick={() => otherClick('resume')}>
                恢复
              </Button>
            )}
            <Button type="dashed" loading={checkLoading} onClick={() => otherClick('check')}>
              检查
            </Button>
            <Button type="primary" htmlType="submit" loading={preservation}>
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <TableList TabData={data} />
      <CreateCron
        cronData={data.cronExpression}
        visible={visible}
        status={status}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
}

TableList.propTypes = {
  TabData: PropType.object,
};

FormCom.propTypes = {
  data: PropType.object,
  onClose: PropType.func,
};

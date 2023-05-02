import React, { useState } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import tableKey from './helper';
import PropTypes from 'prop-types';
import styles from '../../common/style.less';

const layout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 12, span: 16 },
};

function Particulars({ data, handleClose }) {
  const [itemArr] = useState(() => {
    const _arr = Object.values(tableKey);
    return _arr.reduce((start, val) => {
      start.push({
        label: val.title,
        name: val.dataIndex,
      });
      return start;
    }, []);
  });
  return (
    <div className={styles.from_wrap}>
      <Form {...layout} name="basic" initialValues={data}>
        {
          <Row>
            {itemArr.map(({ label, name }, index) => (
              <Col span={12} key={index}>
                <Form.Item label={label} name={name}>
                  <Input bordered={false} disabled />
                </Form.Item>
              </Col>
            ))}
          </Row>
        }
        <Form.Item {...tailLayout}>
          <Button
            onClick={() => {
              handleClose();
            }}
          >
            返回
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
Particulars.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
};

export default Particulars;

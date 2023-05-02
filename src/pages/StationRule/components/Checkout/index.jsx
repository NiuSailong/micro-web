import React, { Component } from 'react';
import { Card, Row, Col, Space, Button, Divider } from 'antd';
import styles from './index.less';
import { CloseCircleFilled } from '#/utils/antdIcons';
import Message from '#/components/Message';

export default class Checkout extends Component {
  state = {
    disabled: false,
  };

  componentDidMount() {
    const { checkList } = this.props;
    checkList.forEach((item) => {
      if (item.children && item.children.length > 0) {
        this.setState({
          disabled: true,
        });
      }
    });
  }

  submit = () => {
    Message.success('提交成功');
    this.props._onHandleClose(true);
  };

  render() {
    const { checkList } = this.props;
    return (
      <Card
        bordered={false}
        style={{ padding: '10px 40px 0 40px' }}
        headStyle={{ border: 'none' }}
        title={<span style={{ fontSize: '18px', color: '#373E48' }}>规则配置检查结果</span>}
      >
        <div className={styles.scrollBar}>
          {checkList.map((item, index) => {
            return (
              <Row key={index}>
                <Col span={2} style={{ margin: '15px 0px' }}>
                  {item.children.length > 0 ? (
                    <span className={styles.tag}>未通过</span>
                  ) : (
                    <span className={styles.untag}>通过</span>
                  )}
                </Col>
                <Col span={20} style={{ margin: '15px 0px' }}>
                  <p className={styles.pColor}>{item.title}</p>
                  {item.children.map((i, ind) => {
                    return (
                      <p key={ind}>
                        <CloseCircleFilled style={{ color: '#EF3B24', fontSize: '14px' }} />
                        <span className={styles.spn}>{i}</span>
                      </p>
                    );
                  })}
                </Col>
              </Row>
            );
          })}
        </div>
        <Divider />
        <div className={styles.styleButton}>
          <Space size={'large'}>
            <Button
              onClick={() => {
                this.props._onHandleClose(false);
              }}
            >
              返回
            </Button>
            <Button
              onClick={() => {
                this.submit();
              }}
              disabled={this.state.disabled}
              type="primary"
            >
              提交
            </Button>
          </Space>
        </div>
      </Card>
    );
  }
}

import React, { Component } from 'react';
import { Row, Col, Input, Form, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '#/utils/antdIcons';
import styles from './index.less';
import { config } from './helper';
const labelCol = { span: 24, offset: 24 };

export default class BasicConfig extends Component {
  state = {
    Information: {},
  };

  componentDidMount() {
    const { Mokedata } = this.props;
    this.setState({
      Information: Mokedata,
    });
  }

  changeValue = (e, detil) => {
    let reg = /^\+?[0-9][0-9]*$/; //验证非零的正整数
    let isZero = /^[0-9]*$/; //可以为零验证
    let obj = { ...this.state.Information };
    if (detil.verificationType === 'number' && !detil.isZero) {
      if (e.target.value == '' || reg.test(e.target.value)) {
        obj[detil.detil] = e.target.value;
      }
    } else if (detil.verificationType === 'number' && detil.isZero) {
      if (e.target.value == ' ' || isZero.test(e.target.value)) {
        obj[detil.detil] = e.target.value;
      }
    } else if (detil.verificationType === 'float' && detil.isZero) {
      if (e.target.value == '' || e.target.value.match(/\d+(\.\d{0,2})?/) || ['']) {
        obj[detil.detil] = e.target.value.match(/\d+(\.\d{0,2})?/)
          ? e.target.value.match(/\d+(\.\d{0,2})?/)[0]
          : '';
      }
    }
    this.setState({
      Information: obj,
    });
  };
  isMax = () => {
    let obj = { ...this.state.Information };

    this.setState({
      Information: obj,
    });
  };

  shouldComponentUpdate(nextProps) {
    if (JSON.stringify(nextProps.Mokedata) !== JSON.stringify(this.props.Mokedata)) {
      this.setState({
        Information: nextProps.Mokedata,
      });
    }
    return true;
  }

  render() {
    const { type, formCreate, Mokedata } = this.props;
    const { Information } = this.state;

    // eslint-disable-next-line
    function TEXTDETAIL(item, changeValue, type, Mokedata, isMax, formCreate, index) {
      return (
        <Col span={12} className={styles.tipSet}>
          <span className={index % 2 == 0 ? styles.textRight : styles.textRightsView}>
            {type !== 'lookup' && item.tip ? <span className={styles.textTip}>*</span> : null}
            {item.name}
            <Tooltip
              title={item.tips}
              overlayClassName="overtoop"
              overlayStyle={{ fontColor: 'red' }}
            >
              <QuestionCircleOutlined
                style={{ marginLeft: '3px', cursor: 'pointer', color: '#888E95', fontSize: '12px' }}
              />
            </Tooltip>
          </span>
          {
            <Form.Item
              {...labelCol}
              style={{ width: '39%' }}
              name={item.detil}
              validateTrigger={'onBlur'}
              validateFirst={true}
              rules={[
                () => ({
                  validator(rule, value) {
                    if (value < item.minnumber) {
                      return Promise.reject(`输入的数值应该不能小于${item.minnumber}`);
                    }
                    if (value > item.maxnumber) {
                      return Promise.reject(`输入的数值应该不能大于${item.maxnumber}`);
                    }
                  },
                }),
                {
                  required: item.tip,
                  message: item.placeholder,
                },
              ]}
            >
              {type === 'lookup' ? (
                <span className={styles.inputs}>{Mokedata[item.detil]}</span>
              ) : item.tip ? (
                <div className={styles.centers}>
                  <span className={styles.input}>
                    <Input
                      placeholder={item.placeholder || ''}
                      defaultValue={item.defaultValue}
                      value={Information ? Information[item.detil] : null}
                      onChange={(value) => {
                        changeValue(value, item);
                      }}
                      onBlur={(value) => {
                        isMax(value, item);
                      }}
                    />
                  </span>
                </div>
              ) : (
                <div className={styles.bgtag}>
                  <Input
                    placeholder="Basic usage"
                    onChange={(value) => {
                      changeValue(value, item);
                    }}
                    defaultValue={item.defaultValue}
                    value={Information ? Information[item.detil] : null}
                    onBlur={(value) => {
                      isMax(value, item);
                    }}
                  />
                </div>
              )}
            </Form.Item>
          }
        </Col>
      );
    }

    return (
      <div className={styles.centerF}>
        <Row>
          {config.map((item, index) => {
            return TEXTDETAIL(
              item,
              this.changeValue,
              type,
              Mokedata,
              this.isMax,
              formCreate,
              index,
            );
          })}
        </Row>
      </div>
    );
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Row, Col, Spin, Card, message, Select, Modal } from 'antd';
import FormItem from '../../common/formItem';
import PanelTitle from '#/components/PanelTitle';
import { HttpCode } from '#/utils/contacts';
import { data1 } from './helper';
import { setExernarToken, resetToken, resetstok } from '@/services/exernarToken';
import tAlert from '#/components/Alert';
import PropTypes from 'prop-types';
import styles from './style.less';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 15 },
};
const { TextArea } = Input;
function Particulars({ data, handleClose, status, resetData }) {
  const [lodingadd, setLodingadd] = useState(true);
  const [useLoding, setUseLoding] = useState(false);
  const [menuLoding, setMenuLoding] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [timer, setTimer] = useState(5);
  const [time, setTime] = useState();
  const [resetSelectKey] = useState(() => {
    return Object.keys(resetData);
  });
  const [resetSelectValue] = useState(() => {
    return Object.values(resetData);
  });
  const [selectData, setSelectData] = useState('');
  const [form] = Form.useForm();
  const selectRef = useRef();
  const [itemArr] = useState(() => {
    const _arr = Object.values(data1).reduce((start, val) => {
      start.push({
        label: val.colName,
        name: val.dataIndex,
      });
      return start;
    }, []);
    if (status === 'edit') {
      return _arr.filter((val) => val.label !== 'ID');
    }
    return _arr;
  });

  useEffect(() => {
    setLodingadd(false);
  }, []);

  const setbtn = async () => {
    setUseLoding(true);
    const setExer = form.getFieldsValue();
    const res = await setExernarToken({
      id: data.id,
      ...setExer,
    });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success({
        content: '保存成功',
        duration: 0.6,
      });
      handleClose();
      setUseLoding(false);
    } else if (res.statusCode) {
      tAlert.warning(res.message);
      setUseLoding(false);
    }
  };

  const timerList = () => {
    let flagFalse = 5;
    const times = setInterval(() => {
      flagFalse -= 1;
      setTimer(flagFalse);
      timer === 0 ? clearInterval(time) : '';
    }, 1000);
    setTimeout(() => {
      resetstok({ whiteList: 'zuu_white_refresh' });
    }, 5000);
    setTime(times);
  };

  const resetbtn = async (falg) => {
    !falg ? setMenuLoding(true) : '';
    if (falg) {
      const whiteRes = await resetstok(selectData);
      if (whiteRes && whiteRes.statusCode === HttpCode.SUCCESS) {
        setisModalVisible(true);
        timerList();
      } else if (whiteRes.statusCode) {
        tAlert.warning(whiteRes.message);
      }
    } else {
      const res = await resetToken(selectData);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success('重置成功！');
      } else if (res.statusCode) {
        tAlert.warning(res.message);
      }
      setMenuLoding(false);
    }
  };

  const handleCancel = () => {
    clearInterval(time);
    setTimer(5);
    setisModalVisible(false);
  };
  const selectChang = (value) => {
    setSelectData(value);
  };

  return (
    <Spin spinning={lodingadd} style={{ marginTop: '20%' }}>
      <Card bordered={false} bodyStyle={{ padding: '10px 30px' }}>
        <div className={styles.add_stationMap}>
          <div className={styles.plans}>
            <PanelTitle title="外部Token" />
          </div>
          <Form {...layout} form={form} name="basic" labelAlign="right" initialValues={data}>
            {
              <Row>
                {itemArr.map(({ label, name }) => (
                  <Col span={8} key={label}>
                    {
                      <FormItem
                        label={label}
                        name={name}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: '不能为空！',
                          },
                        ]}
                      >
                        {!(name === 'url') ? (
                          <Input bordered={status !== 'lookup'} disabled={status === 'lookup'} />
                        ) : (
                          <TextArea bordered={status !== 'lookup'} disabled={status === 'lookup'} />
                        )}
                      </FormItem>
                    }
                  </Col>
                ))}
              </Row>
            }
          </Form>
          {status === 'edit' ? (
            <div className={styles.styleButtonApp}>
              <Button type="primary" htmlType="submit" onClick={setbtn} loading={useLoding}>
                保存
              </Button>
            </div>
          ) : (
            ''
          )}
          <div className={styles.plans}>
            <PanelTitle title="重置" />
          </div>
          <Select
            style={{ width: '100%', marginBottom: '20px' }}
            ref={selectRef}
            onSelect={selectChang}
            placeholder="不选择重置所有缓存"
          >
            {resetSelectValue.map((v, i) => (
              <Select.Option key={v} value={resetSelectKey[i]}>
                {v}
              </Select.Option>
            ))}
          </Select>
          <div className={styles.styleButtonApp}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                resetbtn(false);
              }}
              loading={menuLoding}
            >
              重置
            </Button>
          </div>
          <div className={styles.plans}>
            <PanelTitle title="重置白名单" />
          </div>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              resetbtn(true);
            }}
          >
            重置
          </Button>
        </div>
        <Modal title="Basic Modal" visible={isModalVisible} onCancel={handleCancel} footer={null}>
          <p>重置中，重置还需要一些时间，大约需要30秒</p>
          <p>{timer >= 1 ? `${timer}秒` : '重置完成'}</p>
        </Modal>
      </Card>
    </Spin>
  );
}

Particulars.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  status: PropTypes.string,
  resetData: PropTypes.object,
};

export default Particulars;

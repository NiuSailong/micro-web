import React from 'react';
import TBasePage from '#/base/TBasePage';
import styles from './index.less';
import { Select, Button, Row, Col, Form, Input, DatePicker, Upload, message, Spin } from 'antd';
import consigneeModel from './components/ConsigneeModal';
import announcementModel from './components/AnnouncementModal';
import incidentModal from './components/IncidentModal';
import deviceModel from './components/DeviceModal';
import PanelTitle from '#/components/PanelTitle';
import { GetFileBase64 } from '@/utils/utils';
import Zmage from 'react-zmage';
import Consignee from './components/consignee';
import { connect } from 'dva';
import Message from '#/components/Message';

import { CloseOutlined } from '#/utils/antdIcons';

const dateFormat1 = 'YYYY.MM.DD HH:mm';
import incon_upload from '@/assets/img/incon_upload.png';
import icon_close from '@/assets/img/icon_close.png';
import { getNoticeWebInfo } from '@/services/notice';
import { HttpCode } from '#/utils/contacts';
import moment from 'moment';

@connect(({ global }) => ({
  currentUser: global.configure.currentUser,
}))
class NoticeAdd extends TBasePage {
  __SelRecipientList__ = [];

  __SelAnnounceObj__ = {};

  __SelDeptObj__ = [];

  __SelDevice__ = [];

  __SelDeptExpandData__ = [];

  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      imgList: props.tempObj.imgs || [],
      isHasDet: !!(props.tempObj.device && props.tempObj.device.length > 0),
      isLoading: false,
      id: '',
      addresseeType: '',
    };
  }

  componentDidMount() {
    if (this.props?.editData?.id) {
      this._onGetInfo();
    } else {
      this.setInitFormData(this.props.tempObj);
    }
  }

  setInitFormData = (data, setForm) => {
    const {
      sentTime,
      eventTime,
      title,
      type,
      content,
      device = [],
      recipient = [],
      announce = [],
      dept = [],
      addressee,
      addresseeType = 'department',
    } = data;
    if (sentTime || setForm) {
      this.__SelRecipientList__ = [...recipient];
      this.__SelAnnounceObj__ = { ...announce };
      this.__SelDeptObj__ = [...dept];
      this.__SelDevice__ = [...device];
      let nRecipient = [];
      if (addressee) {
        nRecipient = addressee.split('、');
      } else {
        nRecipient = recipient.map((item) => `${item.label}(${item.value.length})`);
      }
      this.setState({
        addresseeType,
      });
      this.formRef &&
        this.formRef.current.setFieldsValue({
          recipient: nRecipient,
          quoteNoticeIds: announce?.title,
          deptBodies: dept.map((item) => item.deptName),
          deviceBodies: device.map((item) => item.assetname),
          content,
          type,
          title,
          sentTime: sentTime ? moment(sentTime) : null,
          eventTime: eventTime ? moment(eventTime) : null,
        });
    }
    this.setState({
      isHasDet: !!(data?.device && data?.device?.length > 0),
    });
  };

  _onGetInfo = async () => {
    this.setState({ isLoading: true });
    const { stateList, editData } = this.props;
    const res = await getNoticeWebInfo({ id: editData.id });
    if (res.statusCode === HttpCode.SUCCESS) {
      let data = res.notice || {};
      data.typeName = stateList?.filter((item) => item.value === res.notice.type)[0].description;
      data.device = (data.device || []).map((item) => {
        item.id = item.deviceId;
        item.assetname = item.deviceName;
        return item;
      });
      data.recipient = Object.keys(data.addressees || {}).map((key) => {
        return { label: key, value: data.addressees[key] };
      });
      this.setState({
        id: data.id,
      });
      this.setInitFormData(data, true);
    } else {
      message.error(res?.message || '获取数据失败');
    }
    this.setState({ isLoading: false });
  };

  componentWillUnmount() {
    super.componentWillUnmount();
    consigneeModel.dismiss();
    announcementModel.dismiss();
    incidentModal.dismiss();
    deviceModel.dismiss();
  }

  async _onFocus() {
    const { addresseeType } = this.state;
    this._recipientsSelect && this._recipientsSelect.blur();
    const rest = await consigneeModel.show(this.__SelRecipientList__, addresseeType);
    if (rest.index === 1) {
      this.__SelRecipientList__ = [...rest.dataList];
      this.setState({
        addresseeType: rest.addresseeType,
      });
      this.formRef.current.setFieldsValue({
        recipient: rest.dataList.map((item) => `${item.label}(${item.value.length}人)`),
      });
    }
  }

  _onDeselectRecipient(number) {
    let array = [...this.__SelRecipientList__];
    array = array.filter((item) => number.indexOf(item.label) < 0);
    this.__SelRecipientList__ = [...array];
    const relust = [];
    array.forEach((item) => {
      relust.concat(item.value.map((k) => k.personId));
    });
    let arr = [];
    array.forEach((item) => {
      arr = arr.concat(item.value);
    });
    arr = Array.from(new Set(arr));
    if (Consignee.selectTab === 'department') {
      Consignee.department.personList = arr.map((item) => item.personId);
    } else {
      Consignee.role.personList = arr.map((item) => item.personId);
    }
  }

  async _onAnnouncementFocus() {
    this._announcementInput && this._announcementInput.blur();
    const rest = await announcementModel.show(this.props.stateList);
    if (rest.index === 1) {
      this.__SelAnnounceObj__ = rest.data;
      this.formRef.current.setFieldsValue({
        quoteNoticeIds: rest.data.title,
      });
    }
  }

  _onAnnouncementChange() {
    this.__SelAnnounceObj__ = {};
  }

  async _onDeptBodiesFocus() {
    this._deptBodiesSelect && this._deptBodiesSelect.blur();
    const rest = await incidentModal.show(this.__SelDeptObj__, this.__SelDeptExpandData__);
    if (rest.index === 1) {
      this.__SelDeptObj__ = [...rest.data];

      this.__SelDeptExpandData__ = [...rest.expandTreeData];
      this.__SelDevice__ = [];
      this.formRef.current.setFieldsValue({
        deptBodies: rest.data.map((n) => n.deptName),
        deviceBodies: [],
      });
      this.setState({ isHasDet: true });
    }
  }

  _onDeselectDept(e) {
    const cur = this.__SelDeptObj__.filter((n) => n.deptName === e)[0] || {};
    this.__SelDeptObj__ = this.__SelDeptObj__.filter((n) => n.deptName !== e);
    this.__SelDevice__ = this.__SelDevice__.filter((n) => n.deptNum !== cur.deptNum);
    this.formRef.current.setFieldsValue({
      deptBodies: this.__SelDeptObj__.map((n) => n.deptName),
      deviceBodies: this.__SelDevice__.map((item) => item.assetname),
    });
    this.setState({ isHasDet: this.__SelDeptObj__.length });
  }

  _onDeselectDevic(number) {
    this.__SelDevice__ = this.__SelDevice__.filter((n) => n.assetname !== number);
    this.formRef.current.setFieldsValue({
      deviceBodies: this.__SelDevice__.map((item) => item.assetname),
    });
    if (!this.__SelDevice__.length) {
      this.setState({ isHasDet: false });
    }
  }

  async _onDeviceBodiesFocus() {
    this._deviceBodiesSelect && this._deviceBodiesSelect.blur();
    const rest = await deviceModel.show(this.__SelDeptObj__, this.__SelDevice__);
    if (rest.index === 1) {
      this.__SelDevice__ = [...rest.data];
      this.formRef.current.setFieldsValue({
        deviceBodies: rest.data.map((item) => item.assetname),
      });
    }
  }

  _onPrevPress() {}

  _onBackPress() {
    this.props.goBack();
  }

  async _onHandleSubmit() {
    await this.formRef.current.validateFields();
    const values = this.formRef.current.getFieldsValue();
    const obj = { id: this.state.id };
    obj.sentTime = values.sentTime;
    obj.eventTime = values.eventTime;
    obj.title = values.title;
    obj.type = values.type;
    obj.content = values.content;
    obj.device = this.__SelDevice__;
    obj.recipient = this.__SelRecipientList__;
    obj.announce = this.__SelAnnounceObj__;
    obj.dept = this.__SelDeptObj__;
    obj.imgs = this.state.imgList;
    obj.addresseeType = this.state.addresseeType;
    this.props.onPrevPress && this.props.onPrevPress(obj);
  }

  async _onUpload({ file, fileList }) {
    if (file.size > 1024 * 1024 * 10) {
      return Message.warning('上传附件单个大小不可超过10MB!');
    }
    const imgs = await Promise.all(
      fileList.map(async (item) => {
        return { ...item, preimage: await GetFileBase64(item.originFileObj) };
      }),
    );
    this.setState({
      imgList: this.state.imgList.concat(imgs),
    });
  }

  _onDelImage(uid) {
    this.setState({
      imgList: this.state.imgList.filter((item) => item.uid !== uid),
    });
  }

  _onImageCompent() {
    const { imgList } = this.state;
    return (
      <div className={styles.imgbox}>
        {imgList.length > 0 ? (
          <div className={styles.preimagebox}>
            {imgList.map((item) => {
              return (
                <div key={`pre${item.uid}`} className={styles.imgprebox}>
                  <Zmage
                    edge={100}
                    controller={{ zoom: false, rotate: false }}
                    className={styles.imgpre}
                    src={item.preimage}
                  />{' '}
                  <div className={styles.close} onClick={this._onDelImage.bind(this, item.uid)}>
                    <img src={icon_close} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        {imgList.length < 3 ? (
          <Upload
            accept=".png, .jpg, .jpeg"
            fileList={[]}
            beforeUpload={() => {
              return false;
            }}
            showUploadList={false}
            onChange={this._onUpload.bind(this)}
          >
            <div className={styles.upload_button}>
              <img src={incon_upload} />
              上传图片
            </div>
          </Upload>
        ) : null}
      </div>
    );
  }

  render() {
    const { stateList, currentUser } = this.props;
    const { isLoading } = this.state;
    return (
      <div className={styles.container}>
        <PanelTitle title="公告录入" />
        <div
          className={styles.close}
          onClick={() => {
            this._onBackPress();
          }}
        >
          <CloseOutlined />
        </div>
        <Spin spinning={isLoading}>
          <div className={styles.cardbox}>
            <Form ref={this.formRef} className={styles.stepForm} scrollToFirstError>
              <Form.Item
                label="收件人"
                name={'recipient'}
                rules={[
                  {
                    required: true,
                    message: '请选择收件人',
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  maxTagCount={5}
                  ref={(node) => {
                    this._recipientsSelect = node;
                  }}
                  open={false}
                  onDeselect={this._onDeselectRecipient.bind(this)}
                  onFocus={this._onFocus.bind(this)}
                  placeholder="请选择收件人"
                />
              </Form.Item>
              <Form.Item
                label="公告标题"
                name={'title'}
                rules={[
                  {
                    required: true,
                    message: '请填写公告标题',
                    whitespace: true,
                  },
                ]}
              >
                <Input maxLength={100} placeholder="请填写公告标题" allowClear />
              </Form.Item>
              <Form.Item
                label="公告类型"
                name={'type'}
                rules={[
                  {
                    required: true,
                    message: '请选择公告类型',
                  },
                ]}
              >
                <Select placeholder="请选择公告类型">
                  {stateList.map((item, index) => {
                    return (
                      <Select.Option value={item.value} key={index}>
                        {item.description}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label="引用公告" name={'quoteNoticeIds'}>
                <Input
                  ref={(node) => {
                    this._announcementInput = node;
                  }}
                  allowClear
                  onChange={this._onAnnouncementChange.bind(this)}
                  placeholder="请选择引用公告"
                  onFocus={this._onAnnouncementFocus.bind(this)}
                />
              </Form.Item>
              <Form.Item
                label="事件发生单位"
                name={'deptBodies'}
                rules={[
                  {
                    required: true,
                    message: '请选择事件发生单位',
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  ref={(node) => {
                    this._deptBodiesSelect = node;
                  }}
                  open={false}
                  onDeselect={this._onDeselectDept.bind(this)}
                  onFocus={this._onDeptBodiesFocus.bind(this)}
                  placeholder="请选择事件发生单位"
                />
              </Form.Item>
              {this.state.isHasDet ? (
                <Form.Item label="设备" name={'deviceBodies'}>
                  <Select
                    mode="multiple"
                    ref={(node) => {
                      this._deviceBodiesSelect = node;
                    }}
                    open={false}
                    maxTagCount={5}
                    onDeselect={this._onDeselectDevic.bind(this)}
                    onFocus={this._onDeviceBodiesFocus.bind(this)}
                    placeholder="请选择设备"
                  />
                </Form.Item>
              ) : null}
              <Form.Item
                label="事件时间"
                name={'eventTime'}
                rules={[
                  {
                    required: true,
                    message: '请选择事件时间',
                  },
                ]}
              >
                <DatePicker format={dateFormat1} showTime placeholder="请选择事件时间" />
              </Form.Item>
              <Form.Item
                label="公告内容"
                name={'content'}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请填写公告内容',
                  },
                ]}
              >
                <Input.TextArea maxLength={5000} rows={6} placeholder="请填写公告内容" />
              </Form.Item>
              <Form.Item label="公告图片" name={'imgs'}>
                <div> {this._onImageCompent()}</div>
              </Form.Item>
              <Form.Item
                label="发送时间"
                name={'sentTime'}
                rules={[
                  {
                    required: true,
                    message: '请选择发送时间',
                  },
                ]}
              >
                <DatePicker showTime format={dateFormat1} placeholder="请选择发送时间" />
              </Form.Item>
              <Form.Item label={<span style={{ color: '#AFAFAF' }}>发件人</span>} name={'persion'}>
                <div style={{ color: '#AFAFAF', textAlign: 'left' }}>{currentUser.name || '-'}</div>
              </Form.Item>
            </Form>
          </div>
          <Row type="flex" justify="center" className={styles.button_box}>
            <Col>
              <Button
                style={{ marginRight: 10, marginBottom: 20 }}
                onClick={this._onBackPress.bind(this)}
              >
                返回
              </Button>
              <Button
                style={{ marginRight: 10, marginBottom: 20 }}
                onClick={this._onHandleSubmit.bind(this)}
                htmlType="submit"
                type="primary"
              >
                下一步
              </Button>
            </Col>
          </Row>
        </Spin>
      </div>
    );
  }
}

export default NoticeAdd;

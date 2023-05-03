import React, { Component } from 'react';
import styles from '../NoticeDetails/index.less';
import { connect } from 'dva';
import Preview from './components/preview';
import Look from './components/look';
import { Tabs, Row, Button, Col } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import pLoading from '#/components/PLoading';
import Alert from '#/components/Alert';
import { HttpCode } from '#/utils/contacts';
import { getSiteType, getRecipient } from './components/helper';
import { createNotice, updateNotice } from '@/services/notice';
import NoticeSuccess from './components/Notice_success';
import { Debounce } from '#/utils/utils';

const { TabPane } = Tabs;

@connect(({ global }) => ({
  currentUser: global.configure.currentUser,
}))
class NoticeDetail extends Component {
  componentDidMount() {
    this.createNoticeHandlerDebounce = Debounce(this.createNoticeHandler, 500);
  }

  componentWillUnmount() {
    pLoading.dismiss();
  }

  async createNoticeHandler() {
    const { tempObj = {}, stateList, currentUser } = this.props;
    const { dept = [] } = tempObj;
    const pdata = new FormData();
    pdata.append('title', tempObj.title);
    pdata.append('type', tempObj.type);
    pdata.append('typeTitle', getSiteType(stateList, tempObj.type));
    pdata.append('eventTime', tempObj.eventTime.valueOf());
    pdata.append('sentTime', tempObj.sentTime.valueOf());
    pdata.append('content', tempObj.content);
    pdata.append('userId', currentUser.personId);
    pdata.append('userName', currentUser.name);
    pdata.append('addressee', getRecipient(tempObj.recipient));
    pdata.append('addresseeType', tempObj.addresseeType);

    let array = [];
    tempObj.recipient.forEach((item) => {
      array = array.concat(item.value);
    });
    array.forEach((item, index) => {
      pdata.append(`addresseeBodies[${index}].userId`, item.personId || item.userId);
      pdata.append(`addresseeBodies[${index}].userName`, item.name);
      pdata.append(`addresseeBodies[${index}].deptId`, item.deptId ? item.deptId : -1);
      pdata.append(`addresseeBodies[${index}].name`, item.name);
    });
    dept.forEach((item, index) => {
      pdata.append(`deptBodies[${index}].deptId`, item.deptId);
      pdata.append(`deptBodies[${index}].deptNum`, item.deptNum);
      pdata.append(`deptBodies[${index}].deptName`, item.deptName);
    });
    tempObj.device.forEach((item, index) => {
      pdata.append(`deviceBodies[${index}].deviceId`, item.id);
      pdata.append(`deviceBodies[${index}].deviceNum`, item.assetnum || item.deviceNum);
      pdata.append(`deviceBodies[${index}].deviceName`, item.assetname);
      pdata.append(`deviceBodies[${index}].deptNum`, item.deptNum);
    });
    if (tempObj.announce.id) {
      pdata.append('quoteNoticeIds', tempObj.announce.id);
    }
    tempObj.imgs.forEach((item, index) => {
      pdata.append(`images[${index}]`, item.originFileObj);
    });
    pLoading.show('提交中...');
    let response;
    if (tempObj.id) {
      pdata.append('id', tempObj.id);
      response = await updateNotice(pdata);
    } else {
      response = await createNotice(pdata);
    }
    pLoading.dismiss();
    if (response && response.statusCode === HttpCode.SUCCESS) {
      this.Notice_success &&
        this.Notice_success.showConfirm((isBack) => {
          this.props.onAlertPress && this.props.onAlertPress(isBack);
        });
    } else {
      Alert.error(response.message || '发布失败');
    }
  }

  render() {
    return (
      <div className={styles.noticeDetails}>
        <PanelTitle title="公告详情" />
        <div className={styles.cardbox}>
          <Tabs type="card">
            <TabPane tab={<div style={{ width: '100%' }}>公告预览</div>} key="1">
              <Preview {...this.props} />
            </TabPane>
            <TabPane tab={<div style={{ width: '100%' }}>公告查看</div>} key="2">
              <Look {...this.props} />
            </TabPane>
          </Tabs>
        </div>
        <Row type="flex" justify="center" className={styles.button_box}>
          <Col>
            <Button
              style={{ marginRight: 10, marginBottom: 20 }}
              onClick={() => {
                this.props.onBackPress && this.props.onBackPress();
              }}
            >
              返回
            </Button>
            <Button
              style={{ marginRight: 10, marginBottom: 20 }}
              onClick={() => {
                this.createNoticeHandlerDebounce();
              }}
              type="primary"
            >
              发布
            </Button>
          </Col>
        </Row>
        <NoticeSuccess ref={(cur) => (this.Notice_success = cur)} />
      </div>
    );
  }
}

export default NoticeDetail;

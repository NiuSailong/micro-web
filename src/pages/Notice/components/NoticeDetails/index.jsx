import React, { Component } from 'react';
import styles from './index.less';
import PanelTitle from '#/components/PanelTitle';
import { Row, Button, Spin } from 'antd';
import Look from './components/look';
import { getNoticeWebInfo } from '@/services/notice';
import { HttpCode } from '#/utils/contacts';
import PropTypes from 'prop-types';

class NoticeDetails extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      detailsData: {},
    };
  }

  componentDidMount() {
    this._onGetInfo();
  }

  async _onGetInfo() {
    this.setState({ isLoading: true });
    const { stateList, selectObj } = this.props;
    const res = await getNoticeWebInfo({ id: selectObj.id });
    if (res.statusCode === HttpCode.SUCCESS) {
      res.notice.typeName = stateList.filter(
        (item) => item.value === res.notice.type,
      )[0].description;
      this.setState({
        detailsData: res.notice,
        isLoading: false,
        detailsVisible: true,
      });
    }
  }

  render() {
    const { detailsData, isLoading } = this.state;
    if (isLoading) {
      return <Spin style={{ marginLeft: 'calc(50% - 10px)', marginTop: '40px' }} />;
    }
    return (
      <div className={styles.noticeDetails}>
        <PanelTitle title="公告详情" />
        <div className={styles.cardbox}>
          <div className={styles.lookBox}>
            <Look detailsData={detailsData} />
          </div>
        </div>
        <Row type="flex" justify="center">
          <Button onClick={this.props.goBack} className={styles.goBack}>
            返回列表
          </Button>
        </Row>
      </div>
    );
  }
}

NoticeDetails.propTypes = {
  goBack: PropTypes.func,
  stateList: PropTypes.array,
  selectObj: PropTypes.object,
};

export default NoticeDetails;

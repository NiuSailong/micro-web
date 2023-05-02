import React, { Component } from 'react';
import styles from '../../NoticeDetails/index.less';
import { Input } from 'antd';
import moment from 'moment';
import Zmage from 'react-zmage';
import PropTypes from 'prop-types';

const { TextArea } = Input;

import icon_plan from '@/assets/img/notice/icon_plan.png';
import icon_unplan from '@/assets/img/notice/icon_unplan.png';
import icon_sysup from '@/assets/img/notice/icon_sysup.png';
import icon_main from '@/assets/img/notice/icon_main.png';
import icon_comloss from '@/assets/img/notice/icon_comloss.png';
import icon_other from '@/assets/img/notice/icon_other.png';
import incon_link from '@/assets/img/incon_link.png';

const ICON_OBJ = {
  PLAN_NOTICE: icon_plan,
  UNPLAN_NOTICE: icon_unplan,
  SYS_UP_NOTICE: icon_sysup,
  MAIN_WORK_NOTICE: icon_main,
  COMLOSS_NOTICE: icon_comloss,
  OTHER_NOTICE: icon_other,
};

class Preview extends Component {
  time = () => {
    const { eventTime } = this.props.tempObj;
    if (!eventTime) return '-';

    switch (moment(eventTime.valueOf()).startOf('date').diff(moment().startOf('date'), 'days')) {
      case 0:
        return moment(eventTime).format('HH:mm');
      case -1:
        return `昨天 ${moment(eventTime).format('HH:mm')}`;
      default:
        return moment(eventTime).format('YYYY年MM月DD日 HH:mm');
    }
  };

  render() {
    const { tempObj = {} } = this.props;
    const images = tempObj.imgs || [];
    const announce = tempObj.announce || {};
    return (
      <div className={styles.tabContent}>
        <div className={styles.previewContent}>
          <div className={styles.left}>
            <div className={styles.icon}>
              <img src={ICON_OBJ[tempObj.type] || ''} alt="" />
            </div>
            <span> </span>
          </div>
          <div className={styles.right}>
            <div className={styles.titlerow}>
              <div className={styles.time}>事件时间：{tempObj.eventTime ? this.time() : '-'} </div>
              {announce.id ? <img className={styles.link} src={incon_link} /> : null}
            </div>

            <p className={styles.title}>{tempObj.title || ''}</p>
            <TextArea
              disabled={true}
              autoSize={true}
              value={tempObj.content || ''}
              className={styles.detailsContent}
            />
            <div className={styles.imgBox}>
              {images.map((item, index) => {
                return (
                  <Zmage
                    controller={{ zoom: false, rotate: false }}
                    key={index}
                    src={item.preimage}
                    alt=""
                  />
                );
              })}
            </div>
            {announce.id ? (
              <div className={styles.announceContent}>
                <div className={styles.titlecol}>
                  <img className={styles.link} src={incon_link} />
                  <div className={styles.time}>
                    事件时间：{moment(announce.createTime).format('HH:mm')}{' '}
                  </div>
                </div>
                <p className={styles.announcetitle}>{announce.title || ''}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

Preview.propTypes = {
  tempObj: PropTypes.object,
};

export default Preview;

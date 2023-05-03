import React, { Component } from 'react';
import styles from '../index.less';
import { Input } from 'antd';
import moment from 'moment';
import Zmage from 'react-zmage';

const { TextArea } = Input;

import details_preview from '@/assets/img/notice/details_preview.png';

class Preview extends Component {
  time = () => {
    const { sentTime } = this.props.detailsData;
    if (!sentTime) return '';

    switch (moment(sentTime).startOf('date').diff(moment().startOf('date'), 'days')) {
      case 0:
        return '今天';
      case 1:
        return '明天';
      case -1:
        return '昨天';
      default:
        return moment(sentTime).format('YYYY年MM月DD日');
    }
  };

  render() {
    const { sentTime = '', title, content, images = [] } = this.props.detailsData;
    return (
      <div className={styles.tabContent}>
        <div className={styles.previewContent}>
          <div className={styles.left}>
            <div className={styles.icon}>
              <img src={details_preview} alt="" />
            </div>
            <span>-</span>
          </div>
          <div className={styles.right}>
            <p className={styles.time}>
              {moment(sentTime).format('HH:mm')}
              <span>/</span>
              <span>{this.time()}</span>
            </p>
            <p className={styles.title}>{title || ''}</p>
            <TextArea
              disabled={true}
              autoSize={true}
              value={content || ''}
              className={styles.detailsContent}
            />
            <div className={styles.imgBox}>
              {images.map((item, index) => {
                return (
                  <Zmage
                    controller={{ zoom: false, rotate: false }}
                    key={index}
                    src={item}
                    alt=""
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Preview;

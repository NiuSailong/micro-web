import React, { Component } from 'react';
import styles from '../index.less';
import moment from 'moment';
import { Input } from 'antd';
import Zmage from 'react-zmage';

const { TextArea } = Input;

class Look extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    const {
      order,
      addressee,
      typeName,
      title,
      quote = [],
      dept = [],
      device = [],
      eventTime,
      content,
      images = [],
      sentTime,
      userName,
    } = this.props.detailsData;
    const data = [
      { key: '序号', value: order || '-', isShow: true },
      { key: '收件人', value: addressee || '-', isShow: true },
      { key: '公告标题', value: title || '-', isShow: true },
      { key: '公告类型', value: typeName || '-', isShow: true },
      { key: '引用公告', value: (quote.length && quote[0].title) || '-', isShow: !!quote.length },
      { key: '事件发生单位', value: this.getArrContent(dept, 'deptName'), isShow: true },
      {
        key: '设备',
        value: this.getArrContent(device, 'deviceName'),
        isShow: !!device.length,
        type: 'device',
      },
      {
        key: '事件时间',
        value: eventTime ? moment(eventTime).format('YYYY年MM月DD日 HH:mm') : '-',
        isShow: true,
      },
      { key: '公告内容', value: content || '-', type: 'content', isShow: true },
      { key: '公告图片', value: images, type: 'images', isShow: !!images.length },
      {
        key: '发送时间',
        value: sentTime ? moment(sentTime).format('YYYY年MM月DD日 HH:mm') : '-',
        isShow: true,
      },
      { key: '发送人', value: userName || '-', isShow: true },
    ];
    this.setState({ data });
  }

  getArrContent = (arr = [], key) => {
    if (!arr.length) return '-';

    const data = arr.map((item) => {
      return item[key];
    });
    return data.join('、');
  };

  render() {
    return (
      <div className={styles.tabContent}>
        <div className={styles.lookContent}>
          {this.state.data.length &&
            this.state.data.map((item, index) => {
              if (!item.isShow) return null;

              return (
                <p key={index}>
                  <span className={styles.title}>{item.key}：</span>
                  {item.type === 'content' ? (
                    <TextArea
                      disabled={true}
                      autoSize={true}
                      value={item.value}
                      className={`${styles.itemContent} ${styles.lookDetailsContent}`}
                    />
                  ) : item.type === 'images' ? (
                    <div className={styles.imgBox}>
                      {item.value.map((n, nIndex) => {
                        return (
                          <Zmage
                            controller={{ zoom: false, rotate: false }}
                            key={nIndex}
                            src={n}
                            alt=""
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <span className={`${styles.itemContent} `}>{item.value}</span>
                  )}
                </p>
              );
            })}
        </div>
      </div>
    );
  }
}
export default Look;

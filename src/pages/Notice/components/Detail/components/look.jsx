import React, { Component } from 'react';
import styles from '../../NoticeDetails/index.less';
import { Input } from 'antd';
import Zmage from 'react-zmage';
import { getSiteType, getRecipient, getAnnounce, getDept, getDevice } from './helper';

const { TextArea } = Input;

class Look extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    const { tempObj = {}, stateList = [], currentUser } = this.props;
    const deviceStr = getDevice(tempObj.device);
    const images = tempObj.imgs || [];
    const announceStr = getAnnounce(tempObj.announce);
    const deptStr = tempObj.dept?.map((n) => n.deptName).join('、');
    const data = [
      { key: '序号', value: tempObj.order || '-', isShow: false },
      {
        key: '收件人',
        value: tempObj.recipient ? getRecipient(tempObj.recipient) : '-',
        isShow: true,
      },
      { key: '公告标题', value: tempObj.title || '-', isShow: true },
      {
        key: '公告类型',
        value: tempObj.type ? getSiteType(stateList, tempObj.type) : '-',
        isShow: true,
      },
      { key: '引用公告', value: announceStr || '-', isShow: !!announceStr.length },
      { key: '事件发生单位', value: deptStr, isShow: true },
      { key: '设备', value: deviceStr, isShow: !!deviceStr.length },
      {
        key: '事件时间',
        value: tempObj.eventTime ? tempObj.eventTime.format('YYYY年MM月DD日 HH:mm') : '-',
        isShow: true,
      },
      { key: '公告内容', value: tempObj.content || '-', type: 'content', isShow: true },
      { key: '公告图片', value: images, type: 'images', isShow: !!images.length },
      {
        key: '发送时间',
        value: tempObj.sentTime ? tempObj.sentTime.format('YYYY年MM月DD日 HH:mm') : '-',
        isShow: true,
      },
      { key: '发送人', value: currentUser.name || '-', isShow: true },
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
                            src={n.preimage}
                            alt=""
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <span className={styles.itemContent}>{item.value}</span>
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

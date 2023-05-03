import React, { Component } from 'react';
import styles from './index.less';
import { Icon, Button } from 'antd';

export default class index extends Component {
  render() {
    const { message, type } = this.props;
    let addArr = [];
    let objArr = [];
    let newArr = message.message.split('：') || [];
    if (type === 'adduser') {
      addArr = (newArr && newArr[1].split('*')) || [];
    } else {
      let xingArr = (newArr && newArr[1].split('*')) || [];
      xingArr &&
        xingArr.forEach((item) => {
          if (item) {
            let newItem = item.split('  ') || [];
            objArr.push({ name: newItem[0], quan: newItem[1] });
          }
        });
    }
    return (
      <div className={styles.box}>
        <div style={{ marginTop: '10px' }}>
          {' '}
          <span style={{ color: '#F58D29', fontSize: '18px' }}>
            {' '}
            <Icon type="exclamation-circle" />
          </span>
          <span style={{ marginLeft: '10px', fontSize: '16px', fontWeight: 800, color: '#373e48' }}>
            {(newArr && newArr[0]) || '-'}
          </span>{' '}
        </div>
        {this.props.type === 'adduser' ? (
          <div>
            {addArr &&
              addArr.map((item, ind) => {
                return (
                  <li key={ind} style={{ paddingLeft: '27px', lineHeight: '40px' }}>
                    {item}
                  </li>
                );
              })}
          </div>
        ) : (
          <div className={styles.cont} style={objArr.length <= 2 ? { maxHeight: '120px' } : null}>
            {objArr &&
              objArr.map((item, cIndex) => {
                return (
                  <div key={cIndex} className={styles.block}>
                    <h5 style={{ fontSize: '14px' }}>{item.name}</h5>
                    <div>
                      {item.quan &&
                        item.quan.split('、').map((ite, ind) => (
                          <span className={styles.itemList} key={ind}>
                            {ite}
                          </span>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        <div className={styles.foot}>
          <Button
            type="primary"
            onClick={() => {
              this.props.onCloseDetails();
            }}
          >
            确定
          </Button>
        </div>
      </div>
    );
  }
}

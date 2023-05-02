import React, { Component } from 'react';
import { Card, Button } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import styles from './style.less';
import TableList from './component/index';
import { provincecolumn, citycolumns, poncolumns } from './helper';
export default class area extends Component {
  state = {
    city: '',
    provinceName: '',
    pon: '',
    provinceadd: '',
    cityadd: '',
    prefectureadd: '',
  };
  province = React.createRef();
  setassignment = (item, val, selectedRows) => {
    if (item === '省') {
      this.setState({ city: val || '', provinceName: selectedRows?.provinceName || '' });
      this.setState({ pon: '', cityName: '' });
    } else if (item === '市') {
      this.setState({ pon: val, cityName: selectedRows?.cityName || '' });
    }
  };
  add = (val) => {
    if (val === '省') {
      this.setState({ provinceadd: val });
    } else if (val === '市') {
      this.setState({ cityadd: val });
    } else if (val === '区县') {
      this.setState({ prefectureadd: val });
    }
  };
  clear = (val) => {
    if (val === '省') {
      this.setState({ provinceadd: '' });
    } else if (val === '市') {
      this.setState({ cityadd: '' });
    } else if (val === '区县') {
      this.setState({ prefectureadd: '' });
    }
  };
  render() {
    let { city, provinceName, pon, provinceadd, cityadd, prefectureadd } = this.state;
    return (
      <div className={styles.body}>
        <Card bordered={false}>
          <div className={styles.stationMap_wrap}>
            <div className={styles.plans}>
              <PanelTitle title="省" style={{ margin: '0px' }} />
              <Button type="primary" onClick={this.add.bind(this, '省')}>
                添加
              </Button>
            </div>
            <TableList
              type={'省'}
              add={provinceadd}
              column={provincecolumn}
              setassignment={this.setassignment}
              clear={this.clear}
            />
          </div>
          <div className={styles.stationMap_wrap}>
            <div className={styles.plans}>
              <PanelTitle title="市" style={{ margin: '0px' }} />
              <Button
                type="primary"
                onClick={this.add.bind(this, '市')}
                disabled={city ? false : true}
              >
                添加
              </Button>
            </div>
            <TableList
              type={'市'}
              column={citycolumns}
              id={city}
              add={cityadd}
              provinceName={provinceName}
              setassignment={this.setassignment}
              clear={this.clear}
            />
          </div>
          <div className={styles.stationMap_wrap}>
            <div className={styles.plans}>
              <PanelTitle title="区县" style={{ margin: '0px' }} />
              <Button
                type="primary"
                onClick={this.add.bind(this, '区县')}
                disabled={pon ? false : true}
              >
                添加
              </Button>
            </div>
            <TableList
              type={'区县'}
              add={prefectureadd}
              column={poncolumns}
              id={pon}
              clear={this.clear}
            />
          </div>
        </Card>
      </div>
    );
  }
}

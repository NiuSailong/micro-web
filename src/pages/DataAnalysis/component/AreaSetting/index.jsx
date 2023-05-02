import React, { Component } from 'react';
import { Card, Button } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import styles from './style.less';
import TableList from './component/index';
import { provincecolumn } from './helper';
export default class area extends Component {
  state = {
    city: '',
    provinceName: '',
    pon: '',
    add: '',
  };
  province = React.createRef();
  setassignment = (item, val, selectedRows) => {
    if (item === '省') {
      this.setState({ city: val || '', provinceName: selectedRows.provinceName || '' });
      this.setState({ pon: '', cityName: '' });
    }
  };
  add = () => {
    this.setState({ add: 'add' });
  };
  clear = (val) => {
    if (val === 'clear') {
      this.setState({ add: '' });
    }
  };
  render() {
    let { add } = this.state;
    return (
      <div className={styles.body}>
        <Card bordered={false}>
          <div className={styles.stationMap_wrap}>
            <div className={styles.plans}>
              <PanelTitle title="区域" style={{ margin: '0px' }} />
              <Button type="primary" onClick={this.add}>
                添加
              </Button>
            </div>
            <TableList
              type={'省'}
              add={add}
              column={provincecolumn}
              setassignment={this.setassignment}
              clear={this.clear}
            />
          </div>
        </Card>
      </div>
    );
  }
}

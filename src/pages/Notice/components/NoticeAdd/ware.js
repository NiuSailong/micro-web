import React, { Component } from 'react';
import styles from './index.less';
import NoticeAdd from './index';
import Detail from '../Detail';
import Consignee from './components/consignee';

class Ware extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 'info',
      tempObj: {},
    };
  }

  getCurrentStep() {
    const { current } = this.state;
    switch (current) {
      case 'info':
        return 0;
      case 'result':
        return 1;
      default:
        return 0;
    }
  }

  componentDidMount() {
    Consignee.clear();
  }

  _onBackPress() {
    this.setState({
      current: 'info',
    });
  }

  _onPrevPress(pream) {
    this.setState({
      tempObj: pream,
      current: 'result',
    });
  }

  _onSuccessPress(isGo) {
    if (!isGo) {
      this.setState({
        tempObj: {},
        current: 'info',
      });
      Consignee.clear();
    } else {
      this.props.goBack && this.props.goBack(true);
    }
  }

  render() {
    const { tempObj, data } = this.state;
    const currentStep = this.getCurrentStep();
    let stepComponent;
    if (currentStep === 1) {
      stepComponent = (
        <Detail
          {...this.props}
          tempObj={tempObj}
          onBackPress={this._onBackPress.bind(this)}
          onAlertPress={this._onSuccessPress.bind(this)}
        />
      );
    } else {
      stepComponent = (
        <NoticeAdd
          {...this.props}
          data={data}
          tempObj={tempObj}
          onPrevPress={this._onPrevPress.bind(this)}
        />
      );
    }
    return <div className={styles.ware}>{stepComponent}</div>;
  }
}

export default Ware;

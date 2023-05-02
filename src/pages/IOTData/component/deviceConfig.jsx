import React, { Component } from 'react';
import styles from '@/pages/IOTData/index.less';
import PanelTitle from '#/components/PanelTitle';
import { Button, message, Upload } from 'antd';
import { getDeviceConfig, PAGE_TYPE, handleResult, deviceConfigMax, messageWait } from '../helper';
import FormList from './fromList';
import { datainfoExport, datainfoLineImport, listDataInfoLine } from '@/services/iotData';
import { HttpCode } from '#/utils/contacts';
import { downloadHandle } from '#/utils/utils';
import _ from 'lodash';
import moment from 'moment';
export default class DeviceConfig extends Component {
  deviceConfigRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      updateData: [],
    };
  }

  componentDidMount() {
    if (this.props.topic || this.props?.formData?.topic) {
      this.getList();
    }
  }

  getResultList = async (topicValue) => {
    let data = await this.deviceConfigRef?.current?.getCheckFormList();
    const { updateData } = this.state;
    const { topic, formData } = this.props;
    const topicVal = topicValue || topic || formData?.topic;
    data = handleResult(data || [], topicVal, updateData);

    return data;
  };

  getList = async (propsTopic) => {
    const { topic, formData, setLoading } = this.props;
    setLoading && setLoading(true);
    let res = await listDataInfoLine({
      topIc: propsTopic || topic || formData?.topic,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      let list = [];
      const deviceNumObj = {};
      res?.data.forEach((n) => {
        if (!deviceNumObj[n.deviceNum]) {
          deviceNumObj[n.deviceNum] = n;
          list.push(n);
        }
      });
      this.deviceConfigRef?.current?.setFormList(list);
      this.setState({ list });
    }
    setLoading && setLoading(false);
  };

  add = async (pasteData, count = 1, index, pasteArr) => {
    let result = [];
    let arr = (await this.deviceConfigRef?.current?.getFormList()) || [];
    let pasteIndex = index;
    const addNum = arr.length + count >= deviceConfigMax ? deviceConfigMax - arr.length : count;

    if (pasteData instanceof Array) {
      pasteData.forEach((n) => {
        let obj = { add: true };
        n.forEach((j, ind) => {
          obj[pasteArr[ind]] = j;
        });
        if (arr[pasteIndex]) {
          arr[pasteIndex] = { ...arr[pasteIndex], ...obj };
          pasteIndex++;
        }
      });
    } else {
      if (arr.length >= deviceConfigMax || addNum !== count) {
        message.warning('设备配置页面最多可添加500条数据');
        if (arr.length >= deviceConfigMax) {
          return;
        }
      }
      let resultObj = { deptNum: '同上', model: '同上' };
      if (arr.length) {
        result = _.fill(Array(addNum), { add: true, ...resultObj });
      } else {
        result = _.fill(Array(addNum - 1), { add: true, ...resultObj });
        result.unshift({ add: true });
      }
    }
    this.deviceConfigRef?.current?.setFormList([...arr, ...result]);
    this.setState({
      list: [...arr, ...result],
    });
  };

  getFormList = async () => {
    return (await this.deviceConfigRef?.current?.getFormList()) || [];
  };
  setFormList = (list) => {
    this.deviceConfigRef?.current?.setFormList(list);
    this.setState({
      list,
    });
  };

  changeValue = async (current, index) => {
    let list = (await this.deviceConfigRef?.current?.getFormList()) || [];
    list[index] = { ...list[index], ...current };

    this.deviceConfigRef?.current?.setFormList(list);

    this.setState({
      list,
    });
  };

  recordUpdate = (current) => {
    const { updateData } = this.state;
    if (!current?.add && !updateData.includes(current.id)) {
      this.setState({
        updateData: [...this.state.updateData, current.id],
      });
    }
  };

  importFn = (e) => {
    const { topic, formData } = this.props;
    if (!topic && !formData?.topic) {
      message.warning('请先保存基本信息');
      e.stopPropagation();
    }
  };

  fileChange = async (file) => {
    const { topic, formData, setLoading } = this.props;
    let pData = new FormData();
    pData.append('file', file.file);
    pData.append('topic', topic || formData?.topic);
    setLoading && setLoading(true);
    let res = await datainfoLineImport(pData);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(messageWait);
      this.getList();
    } else {
      message.error(res?.message || '导入失败');
    }
    setLoading && setLoading(false);
  };

  exportFn = async () => {
    const { topic, formData, setLoading } = this.props;
    if (!topic && !formData?.topic) {
      return;
    }
    setLoading && setLoading(true);
    let res = await datainfoExport(topic || formData?.topic);
    if (res?.data && res?.data instanceof Blob) {
      try {
        const realFileName = formData.datainfoName + moment().format('YYYY-MM-DD');
        // const type = res.response.headers
        // .get('content-disposition')
        // .split('filename=')[1]
        // .split('.');
        downloadHandle(res.data, decodeURIComponent(realFileName + '.xlsx'));
      } catch (e) {
        message.error('导出失败');
      }
    }
    setLoading && setLoading(false);
  };

  deleteFn = async (current, index) => {
    let list = await this.deviceConfigRef?.current?.getFormList();
    if (list[index].add) {
      list = list.filter((n, ind) => ind !== index);
    } else {
      list[index].deleteFlag = true;
    }
    this.deviceConfigRef?.current?.setFormList(list);
    this.setState({
      list,
    });
  };
  render() {
    const { pageState, topic, formData } = this.props;
    const { list } = this.state;
    return (
      <div>
        <div className={styles.IOTCreat_title} style={{ paddingRight: 45 }}>
          <PanelTitle title={'设备配置'} style={{ margin: '25px 0 22px', flex: 1 }} />
          {pageState !== PAGE_TYPE.READONLY ? (
            <div>
              <Button style={{ marginRight: 10 }} onClick={this.exportFn}>
                导出
              </Button>
              <Upload
                fileList={[]}
                beforeUpload={() => {
                  return false;
                }}
                showUploadList={false}
                onChange={this.fileChange}
              >
                <Button onClick={this.importFn}>导入</Button>
              </Upload>
            </div>
          ) : (
            ''
          )}
        </div>
        <FormList
          ref={this.deviceConfigRef}
          list={list}
          id={'deviceConfig'}
          addFn={this.add}
          changeValue={this.changeValue}
          config={getDeviceConfig()}
          modalData={{ topic: topic || formData?.topic }}
          deleteFn={this.deleteFn}
          showAddNum={true}
          recordUpdate={this.recordUpdate}
          pageState={pageState}
        />
      </div>
    );
  }
}

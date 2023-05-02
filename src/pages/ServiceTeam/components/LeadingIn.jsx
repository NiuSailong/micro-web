import React, { Component } from 'react';
import styles from '#/components/LeadingIn/index.less';
import { Modal, Form, Button, Upload, List } from 'antd';
import TRNotification from '#/utils/notification';
import { HttpCode } from '#/utils/contacts';
import alert from '#/components/Alert';
import PropTypes from 'prop-types';
import { CloseOutlined, DownloadOutlined } from '#/utils/antdIcons';
import planIcon from '@/assets/img/plan_icon.png';
import { Debounce } from '#/utils/utils';

class LeadingInComponent extends Component {
  static defaultProps = {
    data: [],
    otherParam: '',
    exportModel: '',
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false, //对话框是否可见
      isdisabled: true, //
      loading: false, //是否加载中
      isError: false, //是否有错

      fileList: [],
      errorList: [],
    };
    this.getExEportInfoData = Debounce(this._getExEportInfoData, 1000);
  }
  componentDidMount() {
    this.setState({
      visible: true,
    });
  }
  _onCancel() {
    const { onPress } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 0 });
      },
    );
  }

  _onUpLoad({ fileList }) {
    var obj = {};
    obj.errorList = [];
    obj.isError = false;
    this.setState({
      fileList: fileList,
      ...obj,
    });
  }

  _onGetParams() {
    const { params, moduleId } = this.props;
    const { fileList } = this.state;
    const pdata = new FormData();
    fileList.forEach((file) => {
      pdata.append('excelFile', file.originFileObj);
      if (moduleId === 0) {
        pdata.append('deptId', params.deptId);
        pdata.append('methodFlag', params.methodFlag);
        pdata.append('windModel', params.windModel);
        pdata.append('faultCodeList', params.faultCodeList || []);
        pdata.append('maxLineNum', params.maxLineNum);
      }
    });

    return pdata;
  }

  _onError(response) {
    var obj = {};
    var errorList = [];
    let listArr = [...this.state.fileList];
    if (response) {
      if (response.result && response.result.constructor == Array) {
        var list = this.state.fileList.map((item, index) => {
          listArr[index].response = '导入失败';
          listArr[index].status = 'error';
          return { ...item };
        });
        obj.fileList = list;
        obj.isError = true;
        errorList = response.result;
      } else if (response.statusCode === '9003') {
        obj.isError = true;
        errorList = [...(response.importMessageList || '发生未知错误,请重试')];
      } else {
        obj.isError = true;
        errorList.push(response.message || '发生未知错误,请重试');
      }
    } else {
      obj.isError = true;
      errorList.push('发生未知错误,请重试');
    }
    listArr[0].response = '导入失败';
    listArr[0].status = 'error';
    this.setState({ loading: false, errorList: errorList, ...obj, fileList: listArr });
  }

  async _onOk() {
    this.setState({ loading: true });
    const { exportUrl } = this.props;
    let response = await exportUrl(this._onGetParams());
    if (response && response.statusCode === HttpCode.SUCCESS) {
      this.setState({ loading: false });
      const { onPress } = this.props;
      onPress({ index: 1, data: response });
    } else {
      this._onError(response);
    }
  }

  _onCheckDisabled() {
    const { fileList, isError } = this.state;
    if (fileList.length > 0 && !isError) {
      return false;
    }
    return true;
  }

  //下载模板
  async _getExEportInfoData() {
    const { downloadUrl } = this.props;
    try {
      const data = await downloadUrl({});
      window.location.href = data;
    } catch (error) {
      alert.error('下载失败');
    }
  }

  render() {
    const { loading, isError } = this.state;
    const { exportModel } = this.props;
    return (
      <Modal
        width={408}
        centered={true}
        closable={false}
        okText="提交"
        cancelText="取消"
        maskClosable={false}
        okButtonProps={{ disabled: this._onCheckDisabled(), loading: loading }}
        visible={this.state.visible}
        onOk={this._onOk.bind(this)}
        onCancel={this._onCancel.bind(this)}
      >
        <div className={styles.row}>
          <img src={planIcon} />
          <div className={styles.content}>导入</div>
          <div className={styles.suffix} />
          <CloseOutlined className={styles.close} onClick={this._onCancel.bind(this)} />
        </div>
        <div className={`${styles.form} ${isError ? styles.formerror : null}`}>
          <Form layout={'vertical'}>
            <div className={styles.importName}>
              <span>导入文件</span>
              {exportModel.length > 0 ? (
                <span onClick={this.getExEportInfoData.bind(this)}>下载模板</span>
              ) : null}
            </div>

            <Form.Item>
              <Upload
                name="logo"
                beforeUpload={() => {
                  return false;
                }}
                accept=".xlsx"
                fileList={[...this.state.fileList]}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: !loading,
                  showDownloadIcon: false,
                }}
                onChange={this._onUpLoad.bind(this)}
              >
                {this.state.fileList.length == 0 ? (
                  <Button type="primary" ghost>
                    <DownloadOutlined />
                    导入
                  </Button>
                ) : null}
              </Upload>
            </Form.Item>
          </Form>
          {this.state.errorList.length > 0 ? (
            <List
              size="small"
              style={{ marginTop: -10 }}
              header={<div className={styles.headertitle}>导入失败，原因：</div>}
              dataSource={this.state.errorList}
              renderItem={(item, index) => (
                <List.Item key={index} className={styles.listcell}>
                  {item}
                </List.Item>
              )}
            />
          ) : null}
        </div>
      </Modal>
    );
  }
}

LeadingInComponent.propTypes = {
  onPress: PropTypes.func,
  exportModel: PropTypes.node,
  downloadUrl: PropTypes.node,
  exportUrl: PropTypes.node,
  params: PropTypes.object,
  moduleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/*
@params
moduleId: 模块类型Id  0: 大群服务团队 1:大群场站规则
exportUrl：导出地址
downloadUrl:下载文件
params: 下载文件需要提供的参数
*/
class LeadingInModal {
  __key__ = '';
  show = ({ moduleId, exportUrl, downloadUrl, params }) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <LeadingInComponent
            moduleId={moduleId}
            exportUrl={exportUrl}
            downloadUrl={downloadUrl}
            params={params}
            // data={data}
            // otherParam={otherParam}
            // exportParam={exportParam}
            exportModel={[1]}
            // serviceType={serviceType}
            onPress={(reslt) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(reslt);
            }}
          />
        ),
        duration: null,
      });
    });
  };
}

const leadingInModal = new LeadingInModal();
export default leadingInModal;

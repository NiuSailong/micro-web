import React, { Component } from 'react';
import styles from './index.less';
import { Form, Button, Checkbox, List, Upload, Row, Input, Space, message, Spin } from 'antd';
import { HttpCode } from '#/utils/contacts';
import alert from '#/components/Alert';
import { DownloadOutlined } from '#/utils/antdIcons';
import { AutoSizer, List as VList } from 'react-virtualized';
import PropTypes from 'prop-types';
import {
  getrole,
  asydetection,
  exportrole,
  importrole,
  asyroleupdate,
} from '@/services/roleManage';
import { Debounce, downloadHandle } from '#/utils/utils';

const { Search } = Input;
export default class RoleUpdate extends Component {
  /*继承propos State变量区域*/
  constructor(props) {
    super(props);
    this.state = {
      isdisabled: true, //是否禁用
      loading: false, //是否加载中
      isError: false, //是否有错
      Loading: false,
      selectIndex: -1,
      fileList: [],
      errorList: [],
      data: [],
      searchdata: [],
      checkgroup: {
        checkedList: [], //选中的项
        indeterminate: '',
        checkAll: '', //全选
        defaultCheckedList: '', //默认选中
      },
    };
    this.getExEportInfoData = Debounce(this._getExEportInfoData, 1000);
  }
  /*生命周期区域*/
  componentDidMount() {
    let { checkedList } = this.state.checkgroup;
    if (checkedList.length == this.state.data.length) {
      this.setState({
        checkgroup: {
          checkedList: [], //选中的项
          indeterminate: '',
          checkAll: false,
          defaultCheckedList: '', //默认选中
        },
      });
    }
    this.GetRole();
  }
  /**
   *@name {自定义事件区域}
   *@function  _onDownLoad 下载模板
   *@function _onErrorList 导入文件错误
   *@function _onUpLoad 更新上传文件
   */
  //接口调用
  GetRole = async () => {
    this.setState({ Loading: true });
    let { statusCode, list } = await getrole();
    if (statusCode == HttpCode.SUCCESS) {
      this.setState({
        data: list,
        searchdata: list,
      });
    }
    this.setState({ Loading: false });
  };
  //上传导入文件
  getupdateToken = async () => {
    let { currentRoleId } = this.props;
    let { fileList } = this.state;
    const pdata = new window.FormData();
    fileList.forEach((file) => {
      pdata.append('file', file.originFileObj);
      pdata.append('currentRoleId', currentRoleId);
    });
    let data = await importrole(pdata);
    return data;
  };

  //提交选中的数据
  update = async (fn) => {
    let { checkedList } = this.state.checkgroup;
    let { fileList } = this.state;
    let { currentRoleId } = this.props;
    let lists = [];
    let datamsg = {};
    if (checkedList.length > 0) {
      lists = checkedList.map((item) => {
        return item.roleId;
      });
      datamsg = await asydetection({
        currentRoleId: currentRoleId,
        selectRoleIds: lists,
      });
    } else if (fileList.length > 0) {
      datamsg = await this.getupdateToken();
    } else {
      message.error('没有选中数据，请重新选择');
      fn(false, true);
    }
    let params = {
      currentRoleId: currentRoleId,
      selectRoleIds: lists,
    };
    params.confirmToken = datamsg.confirmToken;
    if (datamsg.confirm) {
      let { index } = await alert.eamDelete('同步的角色与当前角色的应用不一致，是否确认提交?');
      if (index == 1) {
        let { statusCode } = await asyroleupdate(params);
        if (statusCode == HttpCode.SUCCESS) {
          message.success('更新数据成功');
          fn(false, false);
        } else {
          message.error('更新数据失败');
          fn(false, false);
        }
      } else if (index == 0) {
        fn(false, false);
      }
    } else if (!datamsg.confirm) {
      let { statusCode } = await asyroleupdate(params);
      if (statusCode == HttpCode.SUCCESS) {
        message.success('更新数据成功');
        fn(false, false);
      } else {
        message.error('更新数据失败');
        fn(false, false);
      }
    }
  };
  //下载模板
  async _getExEportInfoData() {
    try {
      let data = await exportrole();
      if (data.data && data.data instanceof Blob) {
        const realFileName = '角色信息.xlsx';
        downloadHandle(data.data, decodeURI(realFileName));
      } else {
        alert.error(data.message);
      }
    } catch (e) {
      //alert.error("下发失败",data.message)
      alert.error('下载失败');
    }
  }
  //上传交互事件
  async _onUpLoad({ fileList }) {
    let { searchdata, checkgroup } = this.state;
    let list = [];

    if (checkgroup.checkedList?.length) {
      searchdata.filter((item) => {
        item.checkNode = '';
        list.push(item);
      });
    } else {
      list = [...searchdata];
    }

    this.setState({
      checkgroup: {
        checkedList: [],
        checkAll: false,
      },
      searchdata: list,
      fileList: fileList,
    });
  }

  _onDownLoad() {
    this.getExEportInfoData();
  }

  _onErrorList() {
    if (this.state.errorList.length > 10) {
      return (
        <div style={{ height: '200px', marginTop: '10ppx' }}>
          <AutoSizer>
            {({ height, width }) => (
              <VList
                height={height}
                rowCount={this.state.errorList.length}
                rowHeight={20}
                rowRenderer={({ index, style }) => (
                  <div key={index} style={style} className={styles.listcell}>
                    {this.state.errorList[index]}
                  </div>
                )}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      );
    }
    return (
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
    );
  }

  _onError(response) {
    var obj = {};
    var errorList = [];
    if (response) {
      if (response.result.constructor == Array && response.result) {
        var list = this.state.fileList.map((item) => {
          return { ...item };
        });
        obj.fileList = list;
        obj.isError = true;
        errorList = response.result;
      } else {
        obj.isError = true;
        errorList.push(response.message || '发生未知错误,请重试');
      }
    } else {
      obj.isError = true;
      errorList.push('发生未知错误,请重试');
    }
    this.setState({ loading: false, errorList: errorList, ...obj });
  }

  onChangeselsct = (item) => {
    let { data, checkgroup } = this.state;
    let list = [];
    if (item.checkNode == undefined || item.checkNode == '' || item.checkNode == null) {
      list = checkgroup.checkedList.length > 0 ? [...checkgroup.checkedList, item] : [item];
      item.checkNode = item.roleName;
    } else {
      checkgroup.checkedList.filter((keys) => {
        if (item.roleName != keys.roleName) {
          list.push(keys);
        }
      });
      item.checkNode = '';
    }
    this.setState({
      fileList: [],
      checkgroup: {
        checkedList: list,
        indeterminate:
          checkgroup.checkedList.length > 0
            ? !!checkgroup.checkedList.length && checkgroup.checkedList.length < data.length
            : checkgroup.checkedList.length < data.length,
        checkAll: item.length === data.length,
      },
    });
  };

  onCheckAllChange = (e) => {
    let { data } = this.state;
    let list = [],
      datas = [];
    if (e.target.checked) {
      data.map((item) => {
        item.checkNode = item.roleName;
        list.push(item);
        datas.push(item);
      });
    } else {
      data.map((item) => {
        item.checkNode = '';
        datas.push(item);
      });
      list = [];
    }
    this.setState({
      fileList: [],
      data: datas,
      checkgroup: {
        checkedList: list,
        indeterminate: false,
        checkAll: e.target.checked,
        defaultCheckedList: e.target.checked ? list : [],
      },
    });
  };
  //搜索
  onSearch = (val) => {
    let { data } = this.state;
    if (val != '') {
      let lists = [];
      data.map((item) => {
        if (item.roleName.indexOf(val) != -1) {
          lists.push(item);
        }
      });
      this.setState({
        searchdata: lists,
      });
    } else if (!val) {
      this.setState({
        searchdata: data,
      });
    }
  };
  /*render渲染区域*/
  render() {
    const { loading, searchdata, checkgroup, Loading } = this.state;
    return (
      <div className={styles.subject}>
        <div style={{ marginBottom: '10px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Search placeholder="搜索" onSearch={this.onSearch} />
          </Space>
        </div>
        <Checkbox
          style={{ marginBottom: '10px' }}
          indeterminate={checkgroup.indeterminate}
          onChange={this.onCheckAllChange}
          checked={checkgroup.checkAll}
        >
          全选
        </Checkbox>

        <Spin spinning={Loading}>
          <div
            style={{ width: '100%', height: '205px', overflow: 'auto' }}
            defaultValue={checkgroup.checkedList}
          >
            {searchdata.map((item) => {
              return (
                <Row key={item.roleId} style={{ marginBottom: '10px' }}>
                  <Checkbox
                    value={item.roleName}
                    onChange={this.onChangeselsct.bind(this, item)}
                    checked={item.checkNode}
                  >
                    {item.roleName}
                  </Checkbox>
                </Row>
              );
            })}
          </div>
        </Spin>
        <Form layout={'vertical'} style={{ borderTop: '1px solid #E6E6E6', marginTop: '10px' }}>
          {
            <div className={styles.importName}>
              <span>导入文件</span>

              <span onClick={this._onDownLoad.bind(this)}>下载模板</span>
            </div>
          }
          <Form.Item>
            <Upload
              name="logo"
              beforeUpload={() => {
                return false;
              }}
              accept=".xls,.xlsx"
              fileList={this.state.fileList}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: !loading,
                showDownloadIcon: false,
              }}
              onChange={this._onUpLoad.bind(this)}
            >
              {this.state.fileList.length == 0 ? (
                <Button type="primary" ghost disabled={false}>
                  <DownloadOutlined />
                  导入
                </Button>
              ) : null}
            </Upload>
          </Form.Item>
        </Form>
        {this.state.errorList.length > 0 ? this._onErrorList() : null}
      </div>
    );
  }
}
RoleUpdate.propTypes = {
  currentRoleId: PropTypes.number,
};

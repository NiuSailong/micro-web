import React from 'react';
import { Button, Form, Input, Spin, Table, Select } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import { getPositionList, getStaffingConfigure } from '@/services/staffing';
import TRStaff from '../staff';
import styles from './index.less';
import { COLUMNS_OPTIONS } from './helper';
import Message from '#/components/Message';
import { HttpCode } from '#/utils/contacts';
import Empty from '#/components/Empty';
import { relationUserList } from '@/services/roleManage';
import userAlert from './UserAlert/userAlert';

const layout = {
  wrapperCol: {
    span: 7,
  },
};

export default class Particular extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: props.type,
      isLoading: true,
      stationId: '',
      levelId: '',
      userList: [],
      errorMsg: '',
      formId: props?.info?.value || '',
    };
    this.fromRef = React.createRef();
  }
  componentDidMount() {
    const { info = {}, type } = this.props;
    const isRead = type === 'lookup';
    this.fromRef.current.setFieldsValue({
      title: info.title || (isRead ? '-' : ''),
      explain: info.explain || (isRead ? '-' : '-'),
    });
    this.onFetchData(TRStaff.defultStationId || '', TRStaff.defultLevelId || '');
  }
  async onFetchData(sId, lId) {
    if (TRStaff.stationList.length > 0) {
      let res = await getPositionList({
        deptId: sId,
        positionNum: this.state.formId,
        level: lId,
        keyword: '',
      });
      if (res?.statusCode === HttpCode.SUCCESS) {
        TRStaff.defultStationId = sId;
        TRStaff.defultLevelId = lId;
        this.setState({
          userList: res.data || [],
          levelId: lId,
          stationId: sId || '',
          errorMsg: '',
          isLoading: false,
        });
      } else {
        Message.error(res?.message || '系统异常');
        this.setState({
          isLoading: false,
        });
      }
    } else {
      let res = await getStaffingConfigure();
      if (res?.statusCode === HttpCode.SUCCESS) {
        TRStaff.onSetList(
          (res?.dataList || []).map((m) => {
            return { label: m.deptName, value: String(m.deptId) };
          }),
          (res?.treeList || []).map((m) => {
            return { label: m.title, value: String(m.value) };
          }),
        );
        TRStaff.defultStationId = TRStaff.stationList[0]?.value || '';
        TRStaff.defultLevelId = TRStaff.levelList[0]?.value || '';
        if (TRStaff.stationList.length > 0) {
          this.onFetchData(TRStaff.defultStationId, TRStaff.defultLevelId);
        } else {
          this.setState({
            isLoading: false,
          });
        }
      } else {
        this.setState({
          errorMsg: res?.message || '系统异常',
          isLoading: false,
        });
      }
    }
  }
  columns = (text, row, index, keyVal) => {
    if (keyVal === 'stop') {
      return text === true ? '是' : '否';
    }
    return text || '-';
  };
  onRelation = async () => {
    let res = {};
    if (TRStaff.roleIds.length === 0) {
      res = await relationUserList({ roleIds: [0] });
      if (res?.statusCode !== HttpCode.SUCCESS) {
        return Message.error(res?.message || '获取用户列表失败');
      }
      TRStaff.onSetRoleIds((res?.relationUserBodyList || []).map((m) => m.userId));
    }
    const { info = {} } = this.props;
    res = await userAlert.show({
      roleIds: TRStaff.roleIds,
      checkUsers: this.state.userList,
      params: {
        description: info.title || '',
        deptId: this.state.stationId,
        level: this.state.levelId,
        positionNum: this.state.formId,
      },
    });
    if (res?.index === 1) {
      this.onFetchData(this.state.stationId, this.state.levelId);
    }
  };
  _onGetShowUserList = () => {
    const { searchValue = '' } = this.state;
    if (searchValue.length === 0) return this.state.userList;
    return this.state.userList.filter((item) => {
      return (
        (item.name + '').includes(searchValue) ||
        (item.mobile + '').includes(searchValue) ||
        (item.email + '').includes(searchValue)
      );
    });
  };
  _rendContent(isRead) {
    const { errorMsg, stationId, levelId } = this.state;
    if (errorMsg?.length > 0) {
      return <Empty description={errorMsg} />;
    }
    return (
      <Spin spinning={this.state.isLoading}>
        {TRStaff.stationList.length > 0 ? (
          <React.Fragment>
            <div className={styles.container_row} style={{ justifyContent: 'flex-start' }}>
              <div style={{ marginLeft: '10px' }}>所选场站：</div>
              <Select
                showSearch
                showArrow={false}
                filterOption={(inputValue, option) => {
                  return option.label.includes(inputValue);
                }}
                className={styles.container_row_select}
                options={TRStaff.stationList}
                onChange={(e) => {
                  this.setState({ isLoading: true }, () => {
                    this.onFetchData(e, this.state.levelId);
                  });
                }}
                value={stationId}
              />
              <div style={{ marginLeft: '10px' }}>等级：</div>
              <Select
                className={styles.container_row_select}
                options={TRStaff.levelList}
                onChange={(e) => {
                  this.setState({ isLoading: true }, () => {
                    this.onFetchData(this.state.stationId, e);
                  });
                }}
                value={levelId}
              />
            </div>
            <div className={styles.container_row}>
              <Input.Search
                className={styles.container_search}
                onChange={({ target: { value } }) => {
                  this.setState({ searchValue: value });
                }}
              />

              {isRead ? null : (
                <Button type="primary" onClick={this.onRelation.bind(this)}>
                  关联用户
                </Button>
              )}
            </div>
          </React.Fragment>
        ) : null}
        <Table
          rowKey={'userId'}
          size={'small'}
          columns={COLUMNS_OPTIONS(this.columns.bind(this))}
          dataSource={this._onGetShowUserList()}
        />
      </Spin>
    );
  }
  render() {
    const { title, type } = this.props;
    const isRead = type === 'lookup';
    return (
      <div className={styles.container} data-type={'lookup'}>
        <PanelTitle style={{ marginBottom: '20px' }} title={`岗位${title || ''}`} />
        <Form ref={this.fromRef} labelAlign={'left'} name="basic" {...layout}>
          <Form.Item
            name={'title'}
            label={'岗位名称'}
            rules={[
              {
                required: true,
                message: '请输入岗位名称',
              },
            ]}
          >
            <Input disabled={true} placeholder="请输入岗位名称" />
          </Form.Item>
          <Form.Item
            name={'explain'}
            label={'描述'}
            rules={[
              {
                required: true,
                message: '请输入岗位描述',
              },
            ]}
          >
            <Input disabled={true} placeholder="请输入岗位描述" />
          </Form.Item>
        </Form>
        {this._rendContent(isRead)}
      </div>
    );
  }
}

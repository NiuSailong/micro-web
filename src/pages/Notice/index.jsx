import React from 'react';
import { Table, Button, Select, DatePicker, Input, Drawer, Tooltip, message } from 'antd';
import rcpagination from '@/locales/zh-CN/rcpagination';
import { noticeList, noticeStateList, removeNotice, revokeNotice } from '@/services/notice';
import { HttpCode } from '#/utils/contacts';
import moment from 'moment';
import styles from './index.less';
import { Debounce } from '#/utils/utils';
import PanelTitle from '#/components/PanelTitle';
import { COLUMNS_OPTIONS } from './helper';
import Ware from './components/NoticeAdd/ware';
import NoticeDetails from './components/NoticeDetails';
import alert from '#/components/Alert';
import { PlusCircleOutlined, SearchOutlined } from '#/utils/antdIcons';
import { onCheckFeed } from '#/utils/interactive';
import cls from 'classnames';

const { Option } = Select;
const PAGESIZE = 10;
const STATUSARRAY = [
  { value: '已发送', name: '已发送' },
  { value: '待发送', name: '待发送' },
];

const dateFormat1 = 'YYYY.MM.DD';

class BasicTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      studentInfo: [],
      dataList: [],
      filterObj: {},
      sortObj: { type: 'order', value: 'descend' },
      selectObj: {},
      drawerVisible: false,
      stateList: [],
      editData: {},
    };
    this._PLANOBJ_ = {};
    this.searchData = Debounce(this._searchData, 500);
    this.onResetData = Debounce(this._onResetData, 500);
  }

  componentDidMount() {
    this._onFectDataList();
    this._onFectDataListState();
  }

  async _onFectDataList(page = 1, pageSize = PAGESIZE) {
    const { sortObj } = this.state;
    this.setState({ isLoading: true });
    const response = await noticeList({
      size: pageSize,
      current: page,
      column: sortObj.type,
      sort: sortObj.value === 'ascend' ? 'asc' : 'desc',
      ...this.state.filterObj,
    });
    if (response && response.statusCode === HttpCode.SUCCESS) {
      onCheckFeed();
      this.setState({
        dataList: response.list,
        total: response.total,
        currpage: page,
        isLoading: false,
      });
    } else {
      this.setState({ isLoading: false });
      if (response && response.message) {
        MessageChannel.error(response.message);
      }
    }
  }

  async _onFectDataListState() {
    const response = await noticeStateList('Notice');
    if (response && response.statusCode === HttpCode.SUCCESS) {
      response.dictionaryValueBodies.forEach((item) => {
        this._PLANOBJ_[item.value] = item.description;
      });
      this.setState({
        stateList: response.dictionaryValueBodies,
      });
    }
  }

  _onChangeFilterObj(keyVal, data, tobj) {
    let obj = { ...this.state.filterObj };
    if (tobj) {
      obj = { ...obj, ...tobj };
    } else {
      obj[keyVal] = data;
    }
    this.setState({ filterObj: obj });
  }

  // 搜索
  _searchData() {
    this._onFectDataList();
  }

  // 重置
  _onResetData() {
    this.setState(
      {
        filterObj: {},
      },
      () => {
        this._onFectDataList();
      },
    );
  }

  _onTabChange(pagination, filters, sorter) {
    const { sortObj } = this.state;
    this.setState(
      {
        sortObj: {
          type: sorter.field,
          value: sortObj.type !== sorter.field ? 'descend' : sorter.order ? sorter.order : 'ascend',
        },
      },
      () => {
        this._onFectDataList(pagination.current);
      },
    );
  }

  _onRangeTime(current) {
    const { presetStart, presetEnd } = this.state;
    if (current && moment.isMoment(presetStart)) {
      return current < presetStart || current > presetEnd;
    }
    return false;
  }

  _onChangeDatePicker(dates) {
    if (dates && dates.length > 0) {
      this._onChangeFilterObj('', '', {
        endSentTime: dates[1].endOf('date').valueOf(),
        beginSentTime: dates[0].startOf('date').valueOf(),
      });
    } else {
      this._onChangeFilterObj('', '', { endSentTime: '', beginSentTime: '' });
    }
  }

  _onColumn(text, row, index, type) {
    if (type === 'title' || type === 'addressee') {
      return (
        <Tooltip overlayClassName="overtoop" title={text || ''}>
          <span style={{ width: '90%' }} className={styles.celltext}>
            {text}
          </span>
        </Tooltip>
      );
    }
    if (type === 'type') {
      return <span>{this._PLANOBJ_[text] || ''}</span>;
    }
    if (type === 'sentTime') {
      return <span>{text > 0 ? moment(text).format('YYYY.MM.DD HH:mm:ss') : '-'}</span>;
    }
    return <div style={{ textAlign: 'center' }}>{text}</div>;
  }

  _onLook(text, row) {
    this.setState({
      selectObj: row,
      detailsVisible: true,
    });
  }
  _onRevoke = async (id) => {
    const obj = await alert.show('确定撤销本条公告吗？');
    if (obj.index === 1) {
      this.setState({ isLoading: true });
      const res = await revokeNotice({ id });
      if (res.statusCode === HttpCode.SUCCESS) {
        message.success(res?.message || '撤销成功！');
        this._onFectDataList();
      } else {
        message.warning(res?.message || '撤销失败！');
        this.setState({ isLoading: false });
      }
    }
  };

  _onCloseDetails() {
    this.setState({
      detailsVisible: false,
    });
  }

  _onDelte = async (text, row) => {
    const obj = await alert.show('确定删除本条公告吗？');
    if (obj.index === 1) {
      this.setState({ isLoading: true });
      const res = await removeNotice({ id: row.id });
      if (res.statusCode === HttpCode.SUCCESS) {
        this._onFectDataList();
      } else {
        this.setState({ isLoading: false });
      }
    }
  };

  _onCloseDrawer(isRefash) {
    const obj = {};
    if (isRefash) {
      obj.filterObj = {};
    }
    this.setState({
      drawerVisible: false,
      ...obj,
      editData: {},
    });
    if (isRefash) {
      this._onFectDataList();
    }
  }

  render() {
    const operation = [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 160,
        render: (text, row, index) => {
          const { dispatchTime, id } = row;
          const minute = moment().diff(moment(dispatchTime), 'minute');
          const revoke = minute <= 5 && row.state === '已发送';
          const deleteFlag = row.state === '待发送' || row.state === '已撤回';
          return (
            <div className={styles.option}>
              <a style={{ width: 30 }} onClick={this._onLook.bind(this, text, row, index)}>
                查看
              </a>
              <a
                style={{ width: 30 }}
                className={cls({
                  [styles.disabled]: !deleteFlag,
                })}
                onClick={() => {
                  if (!deleteFlag) {
                    message.warning('本条公告不可以编辑！');
                    return;
                  }
                  this.setState({ drawerVisible: true, editData: row });
                }}
              >
                编辑
              </a>
              <a
                style={{ width: 30 }}
                className={cls({
                  [styles.disabled]: !deleteFlag,
                })}
                onClick={() => {
                  if (!deleteFlag) {
                    message.warning('本条公告不可以删除！');
                    return;
                  }
                  this._onDelte(text, row, index);
                }}
              >
                删除
              </a>
              <a
                style={{ width: 30 }}
                className={cls({
                  [styles.disabled]: !revoke,
                })}
                onClick={() => {
                  if (!revoke) {
                    message.warning('本条公告不可以撤销！');
                    return;
                  }
                  this._onRevoke(id);
                }}
              >
                撤销
              </a>
            </div>
          );
        },
      },
    ];

    const { filterObj, total, isLoading, stateList, dataList, editData } = this.state;
    let tableParams = {};
    if (dataList.length) {
      tableParams.scroll = { x: 500 };
    }
    const timeArr = filterObj.beginSentTime
      ? [moment(filterObj.beginSentTime), moment(filterObj.endSentTime)]
      : [];
    return (
      <div className={styles.contain}>
        <div className={styles.title}>
          <PanelTitle title="历史公告查询" />
          <Button
            type="primary"
            onClick={() => {
              this.setState({ drawerVisible: true });
            }}
          >
            <PlusCircleOutlined />
            发布公告
          </Button>
        </div>
        <div className={styles.example}>
          <span>发送人</span>
          <Input
            style={{ width: '20%' }}
            placeholder="输入关键字"
            value={filterObj.userName || ''}
            onPressEnter={() => {
              this.searchData();
            }}
            onChange={(e) => {
              this._onChangeFilterObj('userName', e.target.value);
            }}
          />
          <span>发送时间</span>
          <DatePicker.RangePicker
            disabledDate={this._onRangeTime.bind(this)}
            value={timeArr}
            style={{ width: '300px' }}
            onChange={this._onChangeDatePicker.bind(this)}
            format={dateFormat1}
            separator="-"
            allowClear={true}
          />
          <span className={styles.list} style={{ mrginLeft: '5px' }}>
            公告标题{' '}
          </span>
          <Input
            style={{ flex: 1, marginRight: '44px' }}
            placeholder="输入关键字"
            value={filterObj.title || ''}
            onPressEnter={() => {
              this.searchData();
            }}
            onChange={(e) => {
              this._onChangeFilterObj('title', e.target.value);
            }}
          />
        </div>
        <div className={styles.btn}>
          <span className={styles.statu}>状态 </span>
          <Select
            style={{ width: '20%' }}
            placeholder="请选择公告状态"
            value={filterObj.state}
            onChange={(e) => {
              this._onChangeFilterObj('state', e);
            }}
          >
            {STATUSARRAY.map((item) => {
              return (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
          <span className={styles.announce}>公告类型 </span>
          <Select
            style={{ width: '20%' }}
            placeholder="请选择公告类型"
            value={filterObj.type}
            onChange={(e) => {
              this._onChangeFilterObj('type', [e]);
            }}
          >
            {this.state.stateList.map((item) => {
              return (
                <Option key={item.value} value={item.value}>
                  {item.description}
                </Option>
              );
            })}
          </Select>
          <div style={{ flex: 1 }} />
          <Button
            onClick={() => {
              this.searchData();
            }}
          >
            <SearchOutlined />
            搜索
          </Button>
          <Button
            onClick={() => {
              this.onResetData();
            }}
            style={{ marginLeft: 16, marginRight: 44 }}
          >
            重置
          </Button>
        </div>
        <Table
          className={styles.table}
          columns={COLUMNS_OPTIONS(this._onColumn.bind(this), this.state.sortObj).concat(operation)}
          dataSource={dataList}
          loading={isLoading}
          {...tableParams}
          onChange={this._onTabChange.bind(this)}
          rowKey={'id'}
          pagination={{
            size: 'small',
            current: this.state.currpage,
            defaultPageSize: PAGESIZE,
            locale: rcpagination,
            showSizeChanger: false,
            total,
            showQuickJumper: true,
            showTotal: () => {
              return `${PAGESIZE}条/页`;
            },
          }}
        />
        <Drawer
          placement="right"
          closable={false}
          getContainer={false}
          maskClosable={false}
          zIndex={200}
          onClose={this._onCloseDrawer.bind(this)}
          open={this.state.drawerVisible}
          width="95%"
          destroyOnClose={true}
        >
          {this.state.drawerVisible ? (
            <Ware
              stateList={stateList}
              editData={editData}
              goBack={this._onCloseDrawer.bind(this)}
            />
          ) : null}
        </Drawer>

        {/* 查看 */}
        <Drawer
          placement="right"
          getContainer={false}
          closable={false}
          maskClosable={false}
          onClose={this._onCloseDetails.bind(this)}
          open={this.state.detailsVisible}
          width="95%"
          destroyOnClose={true}
        >
          {this.state.detailsVisible ? (
            <NoticeDetails
              stateList={stateList}
              selectObj={this.state.selectObj}
              goBack={this._onCloseDetails.bind(this)}
            />
          ) : null}
        </Drawer>
      </div>
    );
  }
}

export default BasicTable;

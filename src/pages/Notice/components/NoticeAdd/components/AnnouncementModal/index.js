import React, { Component } from 'react';
import {
  Modal,
  Input,
  Row,
  Col,
  Checkbox,
  Empty,
  Button,
  DatePicker,
  Select,
  Table,
  Tooltip,
} from 'antd';
import styles from './index.less';
import TRNotification from '#/utils/notification';
import moment from 'moment';
import rcpagination from '@/locales/zh-CN/rcpagination';
import { COLUMNS_OPTIONS } from './helper';
import Message from '#/components/Message';
import Alert from '#/components/Alert';
import { noticeList } from '@/services/notice';
import { HttpCode } from '#/utils/contacts';
import { Debounce } from '#/utils/utils';
import { SearchOutlined } from '#/utils/antdIcons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';


const dateFormat1 = 'YYYY.MM.DD';
const PAGESIZE = 10;

class AnnouncementComponent extends Component {
  static defaultProps = {
    stateList: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      filterObj: {},
      total: 0,
      isLoading: false,
      selObj: {},
      dataList: [],
    };
    this.searchData = Debounce(this._searchData, 500);
    this.onResetData = Debounce(this._onResetData, 500);
    this._PLANOBJ_ = {};
    props.stateList.forEach((item) => {
      this._PLANOBJ_[item.value] = item.description;
    });
  }

  componentDidMount() {
    this.setState(
      {
        visible: true,
      },
      () => {
        this._onFectDataList();
      },
    );
  }

  async _onFectDataList(page = 1, pageSize = PAGESIZE) {
    const { startData, endData } = this.state;
    this.setState({ isLoading: true });
    const response = await noticeList({
      size: pageSize,
      current: page,
      ...this.state.filterObj,
      quoteSearch: true,
    });
    if (response && response.statusCode === HttpCode.SUCCESS) {
      this.setState({
        endDate: endData,
        startDate: startData,
        dataList: response.list,
        total: response.total,
        currpage: page,
        selObj: {},
        isLoading: false,
      });
    } else {
      this.setState({ isLoading: false });
      if (response.message) {
        Alert.error(response.message);
      }
    }
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

  _onOk() {
    const { selObj } = this.state;
    const { onPress } = this.props;
    if (selObj.id === undefined) {
      return Message.info('请选择要引用的公告');
    }
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 1, data: selObj });
      },
    );
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

  _onCheckChange(row) {
    this.setState({
      selObj: row,
    });
  }

  _onColumn(text, row, index, type) {
    const { selObj } = this.state;
    if (type === 'title') {
      return (
        <Tooltip placement="topLeft" overlayClassName="overtoop" title={text || ''}>
          <span style={{ width: '90%' }} className={styles.celltext}>
            {text}
          </span>
        </Tooltip>
      );
    }
    if (type === 'type') {
      return <span>{this._PLANOBJ_[text] || ''}</span>;
    }
    if (type === 'order') {
      return (
        <div>
          <Checkbox checked={row.id === selObj.id} onChange={this._onCheckChange.bind(this, row)} />
          <span style={{ marginLeft: '10px' }}>{text || ''}</span>
        </div>
      );
    }
    if (type === 'dept1') {
      const dept = row.dept || [];
      const tooip = dept[0] ? dept[0].deptName : '-';
      return (
        <Tooltip overlayClassName="overtoop" title={tooip || ''}>
          <span style={{ width: '90%' }} className={styles.celltext}>
            {tooip}
          </span>
        </Tooltip>
      );
    }
    if (type === 'sentTime' || type === 'createTime') {
      return <span>{text > 0 ? moment(text).format('YYYY.MM.DD HH:mm:ss') : '-'}</span>;
    }
    return <div style={{ width: '120px' }}>{text}</div>;
  }

  _onTabChange(pagination) {
    this._onFectDataList(pagination.current);
  }

  render() {
    const { filterObj, total, isLoading, dataList } = this.state;
    const { stateList } = this.props;
    const timeArr = filterObj.beginSentTime
      ? [moment(filterObj.beginSentTime), moment(filterObj.endSentTime)]
      : [];
    let tableParams = {};
    if (dataList && dataList.length) {
      tableParams.scroll = { x: 500 };
    }
    return (
      <Modal
        width={1100}
        centered
        cancelText="取消"
        open={this.state.visible}
        footer={[
          <Button key="ttest1" onClick={this._onCancel.bind(this)}>
            取消
          </Button>,
          <Button key="ttest2" onClick={this._onOk.bind(this)} type="primary">
            确定
          </Button>,
        ]}
        onCancel={this._onCancel.bind(this)}
        className="modalWraps"
      >
        <div className={styles.modalx} id="annoucementmodal">
          <div className={styles.modaltitle}>引用公告</div>
          <Row type="flex" className={styles.button_box}>
            <Col>
              <span className={styles.input_span}>公告标题</span>
              <Input
                style={{ width: '160px' }}
                placeholder="输入关键字"
                value={filterObj.title || ''}
                onChange={(e) => {
                  this._onChangeFilterObj('title', e.target.value);
                }}
              />
            </Col>
            <Col style={{ marginLeft: '20px' }}>
              <span className={styles.input_span}>发送时间</span>
              <DatePicker.RangePicker
                locale={locale}
                value={timeArr}
                style={{ width: '240px' }}
                getCalendarContainer={() => document.getElementById('annoucementmodal')}
                placeholder={['开始时间', '结束时间']}
                onChange={this._onChangeDatePicker.bind(this)}
                format={dateFormat1}
                separator="-"
                allowClear={true}
              />
            </Col>
            <Col style={{ marginLeft: '20px' }}>
              <span className={styles.input_span}>公告类型</span>
              <Select
                style={{ width: '150px' }}
                placeholder="请选择公告类型"
                value={filterObj.type}
                getPopupContainer={() => document.getElementById('annoucementmodal')}
                onChange={(e) => {
                  this._onChangeFilterObj('type', [e]);
                }}
              >
                {stateList.map((item) => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.description}
                    </Select.Option>
                  );
                })}
              </Select>
            </Col>
            <div style={{ flex: 1 }} />
            <Col>
              <Button
                onClick={() => {
                  this.searchData();
                }}
              >
                <SearchOutlined />
                搜索
              </Button>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  this.onResetData();
                }}
                style={{ marginLeft: 16 }}
              >
                重置
              </Button>
            </Col>
          </Row>
          <Table
            className={styles.table}
            columns={COLUMNS_OPTIONS(this._onColumn.bind(this))}
            dataSource={dataList}
            loading={isLoading}
            locale={{
              emptyText: (
                <div className={styles.emptybox}>
                  <Empty imageStyle={{ height: 65 }} description="暂无数据" />
                </div>
              ),
            }}
            {...tableParams}
            onChange={this._onTabChange.bind(this)}
            rowKey={'id'}
            pagination={{
              size: 'small',
              defaultPageSize: PAGESIZE,
              locale: rcpagination,
              total,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: () => {
                return `${PAGESIZE}条/页`;
              },
            }}
          />
        </div>
      </Modal>
    );
  }
}
class AnnouncementModel {
  __key__ = '';

  show = (stateList, planObj) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <AnnouncementComponent
            stateList={stateList}
            planObj={planObj}
            onPress={(obj) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(obj);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = () => {
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
}
const announcementModel = new AnnouncementModel();
export default announcementModel;

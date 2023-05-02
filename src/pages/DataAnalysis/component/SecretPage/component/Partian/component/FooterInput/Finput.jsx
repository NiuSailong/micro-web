import React, { Component } from 'react';
import { Table, Select, Tooltip, Empty, TimePicker, Input } from 'antd';
import styles from './index.less';
import {
  MinusCircleOutlined,
  RollbackOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from '#/utils/antdIcons';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import styler from './Finput.less';

const { Option } = Select;
const aFormat = 'HH:mm';
export default class FooterInput extends Component {
  state = {
    dataSource: this.props.plantable || [],
    selectedItems: [],
    currentPage: 1,
    flagData: [],
    selectType: this.props.selectType || [],
    newValue: {},
    aValue: {},
    menuSelect: {},
    updataMenuSelect: {},
    managaDel: [],
  };

  shouldComponentUpdate(props) {
    if (JSON.stringify(this.props.plantable) !== JSON.stringify(props.plantable)) {
      const plantable = [...props.plantable];
      this.setState({
        dataSource: [...plantable],
      });
    }
    return true;
  }

  removeSelect = () => {
    const selected = [...this.state.selectType];
    const oldsel = [];
    if (this.props.plan === 'plan') {
      this.state.dataSource.forEach((item) => {
        if (oldsel.indexOf(item.type) === -1 && !item.del) {
          oldsel.push(item.type);
        }
      });
      selected.forEach((i) => {
        if (oldsel.indexOf(i.value) !== -1 || oldsel.indexOf(i.description) !== -1) {
          i.disable = true;
        } else {
          i.disable = false;
        }
      });
      this.setState({ selectType: selected });
    }
  };

  checkTable = () => {
    const newData = [].concat(this.state.dataSource);
    const array = _.chunk(newData, 5);
    const pagecur =
      newData.length + 1 > 1 && (newData.length + 1) % 5 === 1 ? array.length + 1 : array.length;
    this.setState({ currentPage: pagecur });
  };

  addNewCol = () => {
    const newData = [].concat(this.state.dataSource);
    this.checkTable(true);
    if (this.props.plan === 'plan') {
      newData.push({
        ids: `${Date.parse(new Date())} + ${Math.floor(Math.random() * 100000)}`,
        type: '',
        newData: true,
        del: false,
        update: true,
      });
    }
    this.setState({ dataSource: newData });
  };

  removeClo = (record, flag) => {
    const newData = this.state.dataSource;
    newData.forEach((item, index) => {
      if ((record.id && record.id === item.id) || (record.ids && record.ids === item.ids)) {
        if (item.newData) {
          newData.splice(index, 1);
        } else {
          item.update = true;
          item.del = flag;
        }
      }
    });
    this.props.chang(newData, this.props.planId);
    this.setState({ dataSource: newData }, () => {
      this.removeSelect();
      record.del = record.newData ? true : flag;
    });
  };

  handleProjec = async (e, row, text) => {
    const newData = [...this.state.dataSource];
    const selected = [...this.state.selectType];
    newData.forEach((item) => {
      if ((item.id && item.id === row.id) || (item.ids && item.ids === row.ids)) {
        item.update = true;
        if (text === 'rateName') {
          item[text] = e.target ? e.target.value : e;
        } else if (text === 'startTime' || text === 'endTime') {
          item[text] = e.target ? e.target.value : e;
        } else {
          item[text] = e ? moment(e).format('HH:mm') : moment().format('HH:mm');
        }
      }
    });
    this.props.chang(newData, this.props.planId);
    this.setState({
      dataSource: newData,
      selectType: selected,
    });
  };

  _onTableChange(pagination) {
    this.setState({ currentPage: pagination.current });
  }

  render() {
    const { currentPage } = this.state;
    const { type, column } = this.props;
    const columns = [];
    column.forEach((item) => {
      columns.push({
        title: (
          <div>
            {item.tip && type !== 'lookup' ? <span style={{ color: 'red' }}>*</span> : null}
            <span className={styles.setSpnColor}>{item.colName}</span>
            {item.tips ? (
              <Tooltip
                title={item.tipNews}
                overlayClassName="overtoop"
                overlayStyle={{ fontColor: 'red' }}
              >
                <QuestionCircleOutlined
                  style={{
                    marginLeft: '3px',
                    cursor: 'pointer',
                    color: '#888E95',
                    fontSize: '12px',
                  }}
                />
              </Tooltip>
            ) : null}
          </div>
        ),
        dataIndex: item.dataIndex,
        width: item.width,
        align: 'center',
        ellipsis: true,
        render: (text, record, n) => {
          if (this.props.status === 'lookup') {
            return (
              <span className={styles.setSpnColor}>
                {item.dataIndex === 'linenum' ? currentPage * 5 - (5 - (n + 1)) : text}
              </span>
            );
          }
          if (item.colType === 'select') {
            return (
              <Select
                defaultValue={record[item.dataIndex]}
                style={{ width: '100%' }}
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex, item);
                }}
              >
                <Option value="平段">平段</Option>
                <Option value="谷段">谷段</Option>
                <Option value="峰段">峰段</Option>
                <Option value="尖段">尖段</Option>
              </Select>
            );
          }
          if (item.colType === 'input') {
            return (
              <Input
                defaultValue={record[item.dataIndex]}
                style={{ width: '100%' }}
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex, item);
                }}
              />
            );
          }
          return (
            <TimePicker
              defaultValue={record[item.dataIndex] && moment(record[item.dataIndex], 'HH:mm:ss')}
              format={aFormat}
              onOk={(e) => {
                this.handleProjec(e, record, item.dataIndex, item);
              }}
              showNow={false}
              // chang(dataSource)
            />
          );
        },
      });
    });

    if (this.props.status !== 'lookup') {
      columns.push({
        title: '',
        width: 40,
        /* eslint-disable */
        render: (_, record) => {
          /* eslint-disable */
          if (this.props.status !== 'lookup') {
            return record.del ? (
              <div style={{ textAlign: 'center' }}>
                <RollbackOutlined
                  onClick={() => {
                    this.removeClo(record, false);
                  }}
                  style={{ color: '#ACB1C1', fontSize: '17px' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <MinusCircleOutlined
                  onClick={() => {
                    this.removeClo(record, true);
                  }}
                  style={{ color: '#ACB1C1', fontSize: '17px' }}
                />
              </div>
            );
          }
        },
      });
    }
    return (
      <div className={styles.projectTbale} className={styler.tables} style={{ overflow: 'auto' }}>
        <Table
          columns={columns}
          showHeader={false}
          dataSource={[...this.state.dataSource]}
          pagination={false}
          bordered
          // scroll={{ y: 110 }}
          locale={<Empty />}
          rowKey={(text) => text.ids}
          onChange={this._onTableChange.bind(this)}
          rowClassName={(text) => {
            return text.del && type !== 'lookup' ? styles.tableViewCss : '';
          }}
        />
        {this.props.status !== 'lookup' ? (
          <div className={styles.addCol}>
            <span
              onClick={() => {
                this.addNewCol();
              }}
            >
              <PlusCircleOutlined style={{ color: '#1E7CE8', fontSize: '17px' }} />
              <span>继续添加</span>
            </span>
          </div>
        ) : null}
      </div>
    );
  }
}
FooterInput.propTypes = {
  plantable: PropTypes.array,
  selectType: PropTypes.array,
  plan: PropTypes.string,
  column: PropTypes.array,
  type: PropTypes.string,
  chang: PropTypes.func,
  planId: PropTypes.number,
};

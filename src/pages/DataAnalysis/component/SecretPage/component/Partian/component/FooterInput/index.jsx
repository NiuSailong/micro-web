import React, { Component } from 'react';
import { Table, Input, Select, Tooltip, Empty, DatePicker } from 'antd';
import styles from './index.less';
import {
  MinusCircleOutlined,
  RollbackOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from '#/utils/antdIcons';
import PropTypes from 'prop-types';
import Finput from './Finput';
import moment from 'moment';
import { TimeOucker, handlePaste } from './helper';
import _ from 'lodash';

const { Option } = Select;
const { RangePicker } = DatePicker;
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
    this.setState({ dataSource: newData }, () => {
      this.removeSelect();
      record.del = record.newData ? true : flag;
    });
  };

  handleProjec = (e, row, text) => {
    const newData = [...this.state.dataSource];
    const selected = [...this.state.selectType];
    newData.forEach((item) => {
      if (
        (item.id && item.id === row.id) ||
        (item.ids && item.ids === row.ids) ||
        (item.rateId && item.rateId === row.rateId)
      ) {
        item.update = true;
        if (e.target) {
          let emptyReg = /^\S*$/;
          if (emptyReg.test(e.target.value)) {
            item[text] = e.target.value;
          }
        } else {
          if (e === '0') {
            // eslint-disable-next-line
            e = null;
          }
          item[text] = e;
        }
      }
    });
    this.setState({
      dataSource: newData,
      selectType: selected,
    });
  };

  _onTableChange(pagination) {
    this.setState({ currentPage: pagination.current });
  }

  dateOk(value, row) {
    const newData = [...this.state.dataSource];
    newData.forEach((v) => {
      if (v.rateId && v.rateId === row.rateId) {
        v.rateDeadline = value.format('YYYY-MM-DDTHH:mm');
      }
    });
    this.setState({
      dataSource: newData,
    });
  }
  pasteFn = (e, record, dataIndex) => {
    let newData = [...this.state.dataSource];
    let value = handlePaste(e.clipboardData.getData('Text'));
    let isPaste = -1;
    newData = newData.map((item) => {
      if (item.ids === record.ids) {
        isPaste = isPaste + 1;
        return {
          ...item,
          [dataIndex]: value[isPaste],
        };
      } else if (isPaste >= 0) {
        isPaste = isPaste + 1;
        return {
          ...item,
          [dataIndex]: value[isPaste],
        };
      }
      return {
        ...item,
      };
    });
    this.setState({
      dataSource: newData,
    });
  };
  render() {
    const { currentPage, selectedRowKeys } = this.state;
    const { type, column, setbtn, setSelectData } = this.props;
    const columns = [];
    const rowSelection = {
      type: 'checkout',
      selectedRowKeys,
      onChange: (selectedRowKeyt, selectRow) => {
        setbtn && setbtn(selectedRowKeyt);
        setSelectData && setSelectData(selectRow);
      },
    };
    const chang = (e, record, row) => {
      const newDataSoue = [...this.state.dataSource];
      const selected = [...this.state.selectType];
      newDataSoue.forEach((item) => {
        e.forEach((z) => {
          if (z.newData) {
            item.list = item.rateId === record || item.ids === record ? e : item.list;
          }
        });

        if (
          (item.rateId && row && item.rateId === row.rateId && !record) ||
          (item.ids && row && item.ids === row.ids && !record)
        ) {
          item.update = true;
          item.startMonth = e[0] ? moment(e[0]).format('MM') : moment().format('MM');
          item.endMonth = e[1] ? moment(e[1]).format('MM') : moment().format('MM');
        }
      });
      this.setState({
        dataSource: newDataSoue,
        selectType: selected,
      });
    };
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
          if (type === 'lookup') {
            return (
              <span className={styles.setSpnColor}>
                {item.dataIndex === 'linenum' ? currentPage * 5 - (5 - (n + 1)) : text}
              </span>
            );
          }
          if (item.colType === 'input') {
            return (
              <Input
                value={record[item.dataIndex]}
                placeholder={item.placeholder}
                disabled={item.dataIndex === 'deptNum' ? true : item.disable}
                maxLength={item.MaxLength ? item.MaxLength : null}
                style={{ width: '100%' }}
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex, item);
                }}
                onPaste={(e) => this.pasteFn(e, record, item.dataIndex, item)}
              />
            );
          }
          if (item.colType === 'select') {
            const newArr = [''];
            this.props.plantable.forEach((v) => {
              if (v.assetnum !== record.assetnum) {
                newArr.push({ assetnum: v.assetnum, assetname: v.assetname });
              }
            });
            return (
              <Select
                defaultValue={String(text)}
                value={record[item.dataIndex] || '重置'}
                style={{ width: '100%' }}
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex);
                }}
              >
                {newArr &&
                  newArr.map((v, i) => {
                    return (
                      <Option key={i} value={v.assetnum}>
                        <p className={styles.pSpace}>
                          <span className={styles.spCol}>{v === '' ? '重置' : v.assetnum}</span>
                          <span className={styles.spMar}>{v === '' ? '' : v.assetname}</span>
                        </p>
                      </Option>
                    );
                  })}
              </Select>
            );
          }
          if (item.colType === 'RangePicker') {
            return (
              <RangePicker
                allowClear={false}
                disabled={this.props.status === 'lookup'}
                picker="month"
                allowEmpty={[false, false]}
                defaultValue={
                  record.startMonth && [
                    moment(record.startMonth, 'MM'),
                    moment(record.endMonth, 'MM'),
                  ]
                }
                format={'MM'}
                onChange={(e) => {
                  chang(e, false, record);
                }}
              />
            );
          }
          if (item.colType === 'RangePickers') {
            return (
              <DatePicker
                allowClear={false}
                showTime
                defaultValue={
                  record.rateDeadline ? moment(record.rateDeadline, 'YYYY-MM-DD HH:mm') : ''
                }
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex);
                }}
                format={'YYYY-MM-DD HH:mm'}
                onOk={(value) => this.dateOk(value, record)}
              />
            );
          }
          return (
            <Finput
              column={TimeOucker}
              plan="plan"
              plantable={record.list}
              planId={record.rateId || record.ids}
              chang={chang}
              status={this.props.status}
            />
          );
        },
      });
    });

    if (type !== 'lookup') {
      columns.push({
        title: '',
        width: 40,
        /* eslint-disable */
        render: (_, record) => {
          /* eslint-disable */
          if (this.props.status !== 'lookup') {
            return record.del ? (
              <div>
                <RollbackOutlined
                  onClick={() => {
                    this.removeClo(record, false);
                  }}
                  style={{ color: '#ACB1C1', fontSize: '17px' }}
                />
              </div>
            ) : (
              <div>
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
      <div className={styles.projectTbale} id="tables" style={{ overflow: 'auto' }}>
        <Table
          columns={columns}
          dataSource={[...this.state.dataSource]}
          pagination={{
            pageSize: 5,
            current: currentPage === 0 ? (this.state.dataSource.length > 0 ? 1 : 0) : currentPage,
            showSizeChanger: false,
            size: 'small',
          }}
          rowSelection={type !== 'pick' && rowSelection}
          locale={<Empty />}
          bordered
          loading={this.props.loading}
          rowKey={(text) => text.ids || text.id}
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
  setbtn: PropTypes.func,
};

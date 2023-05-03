import React, { Component } from 'react';
import { Table, Select, Tooltip, Empty, TimePicker, Input } from 'antd';
import styles from './index.less';
import {
  MinusCircleOutlined,
  RollbackOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from '#/utils/antdIcons';
import moment from 'moment';
import _ from 'lodash';
import styler from './FooterInput/Finput.less';

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
    newLength: '',
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
      for (let i = 0; i < 5; i += 1) {
        newData.push({
          ids: `${Date.parse(new Date())} + ${Math.floor(Math.random() * 100000)}`,
          type: '',
          newData: true,
          del: false,
          update: true,
        });
      }
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
        item[text] = e.target ? e.target.value : e;
      }
    });
    this.setState({
      dataSource: newData,
      selectType: selected,
    });
  };
  handlePastes = (values) => {
    const value = values.trim();
    const hiddenInputValue =
      value.indexOf('\\n') >= 0 ? value.replace(/[\s+]/g, ';') : value.replace(/[\r\n]/g, ';');
    const valueSplit =
      hiddenInputValue.indexOf(';;') > -1
        ? hiddenInputValue
        : hiddenInputValue.replace(/\s{1,}/g, ';');
    const data =
      hiddenInputValue.indexOf(';;') > -1
        ? hiddenInputValue.split(';;')
        : valueSplit.indexOf(';') > -1
        ? valueSplit.split(';')
        : valueSplit.split(/[\s+\n\f\r]/g);
    let NumReg = /^\D$/;
    let result = data.find((item) => NumReg.test(item));
    if (result) {
      return [];
    }
    return data;
  };

  handlePaste = (e, row, dataIndex) => {
    e.preventDefault();
    const { dataSource } = this.state;
    if (e.clipboardData) {
      const newList = _.cloneDeep(dataSource);
      let valueArr = this.handlePastes(e.clipboardData.getData('Text'));
      let idsIndex = 0;
      if (!valueArr.length) return;
      newList.forEach((v, i) => {
        if (v.ids === row.ids) {
          idsIndex = i;
        }
      });
      valueArr.forEach((v) => {
        if (!newList[idsIndex]) return;
        newList[idsIndex][dataIndex] = `${v}`;
        idsIndex++;
      });
      // newList.forEach(v => {
      //   if (v[dataIndex]) {
      //     const ids = v[dataIndex].indexOf(',');
      //     v[dataIndex] = v[dataIndex].substring(0, ids);
      //   }
      // });
      this.setState({ dataSource: newList });
    }
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
          if (type === 'lookup') {
            return (
              <span className={styles.setSpnColor}>
                {item.dataIndex === 'linenum' ? currentPage * 5 - (5 - (n + 1)) : text}
              </span>
            );
          }
          if (item.colType === 'input') {
            return item.dataIndex !== 'id' ? (
              <Input
                className={styles.inputs}
                value={record[item.dataIndex]}
                onChange={(e) => this.handleProjec(e, record, item.dataIndex, item)}
                onPaste={(e) => this.handlePaste(e, record, item.dataIndex)}
                onFocus={this.handleFouces}
              />
            ) : (
              <Input
                className={styles.inputs}
                defaultValue={record[item.dataIndex]}
                onChange={(e) => this.handleProjec(e, record, item.dataIndex, item)}
                hidden
              />
            );
          }
          if (item.colType === 'select') {
            const newArr = [''];
            this.props.selectOptions.forEach((v) => {
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
                        <p className={styler.pSpace}>
                          <span className={styler.spCol}>{v === '' ? '重置' : v.assetnum}</span>
                          <span className={styler.spMar}>{v === '' ? '' : v.assetname}</span>
                        </p>
                      </Option>
                    );
                  })}
              </Select>
            );
          }
          return (
            <TimePicker
              defaultValue={record[item.dataIndex] && moment(record[item.dataIndex], 'HH:mm')}
              format={aFormat}
              onOk={(e) => {
                this.handleProjec(e, record, item.dataIndex, item);
              }}
              // chang(dataSource)
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
        },
      });
    }
    return (
      <div className={styles.projectTbale} className={styler.tables} style={{ overflow: 'auto' }}>
        <Table
          columns={columns}
          showHeader={true}
          dataSource={[...this.state.dataSource]}
          pagination={false}
          loading={this.props.loading}
          locale={<Empty />}
          rowKey={(text) => text.ids || text.assetId}
          onChange={this._onTableChange.bind(this)}
          rowClassName={(text) => {
            return text.del && type !== 'lookup' ? styles.tableViewCss : '';
          }}
        />
        {type !== 'lookup' ? (
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

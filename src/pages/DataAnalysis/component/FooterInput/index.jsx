/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { Table, Input, Select, Tooltip, Empty } from 'antd';
import styles from './index.less';
import {
  MinusCircleOutlined,
  RollbackOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from '#/utils/antdIcons';
import Message from '#/components/Message';
import PropTypes from 'prop-types';
import Expan from './expandable';
import _ from 'lodash';
import style from './index.less';
import CascaderProCity from '../OptionBtn/CascaderProCity';

const { Option } = Select;
export default class FooterInput extends Component {
  constructor(props) {
    super(props);
    this.exRef = React.createRef();
  }

  state = {
    dataSource: this.props.plantable || [],
    selectedItems: [],
    currentPage: 1,
    flagData: [],
    selectType: this.props.selectType || [],
    oldData: [],
    newValue: {},
    aValue: {},
    menuSelect: {},
    updataMenuSelect: {},
    managaDel: [],
    ResDel: '',
    listCol: '',
    resPlace: '',
    showRes: '',
    expn: {},
  };

  _SELECT_ = [
    { value: '1期', hold: '一期' },
    { value: '2期', hold: '二期' },
    { value: '3期', hold: '三期' },
    { value: '4期', hold: '四期' },
  ];

  shouldComponentUpdate(props) {
    if (JSON.stringify(this.props.plantable) !== JSON.stringify(props.plantable)) {
      this.changeId(props.plantable, true);
      const plantable = [...props.plantable];
      const even = _.remove(plantable, function (n) {
        return n.del && n.old;
      });
      this.setState({
        oldData: even,
      });
    }
    // if (JSON.stringify(state.dataSource) !== JSON.stringify(this.state.dataSource)) {
    //   this.addNewCol(props.plantable)
    // }
    return true;
  }

  changeId = (value) => {
    const dataSoure = JSON.parse(JSON.stringify(value));
    dataSoure.forEach((item, index) => {
      item.ids = `${Date.parse(new Date())}${Math.floor(Math.random() * 10000)}${index}`;
    });
    const even = _.remove(dataSoure, function (n) {
      return n.del && n.old;
    });
    this.setState({
      oldData: even,
      dataSource: dataSoure,
    });
  };

  checkTable = (saveflag) => {
    const newData = [].concat(this.state.dataSource);
    const array = _.chunk(newData, 5);
    const fal = true;
    const keys = [];
    this.props.column.forEach((i) => {
      keys.push(i.dataIndex);
    });
    if (fal && saveflag) {
      const pagecur =
        newData.length + 1 > 1 && (newData.length + 1) % 5 === 1 ? array.length + 1 : array.length;
      this.setState({ currentPage: pagecur });
    }
    return fal;
  };

  addNewCol = () => {
    const newData = [].concat(this.state.dataSource);
    const flag = newData.length > 0 ? this.checkTable(true) : true;
    if (this.props.plan === 'plan' && flag) {
      newData.push({
        ids: `${Date.parse(new Date())}${Math.floor(Math.random() * 100000)}`,
        type: '',
        flag: '',
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
      if (
        (record.id && record.id === item.id) ||
        (record.ids && record.ids === item.ids) ||
        (record.faultrulelineId && record.faultrulelineId === item.faultrulelineId) ||
        (record.menuId && record.menuId === item.menuId)
      ) {
        if (item.newData) {
          newData.splice(index, 1);
        } else {
          item.update = true;
          item.del = flag;
        }
      }
    });
    this.setState(
      {
        dataSource: newData,
      },
      () => {
        record.del = record.newData ? true : flag;
      },
    );
  };

  handleProjec = async (e, row, text) => {
    const newData = [...this.state.dataSource];
    const selected = [...this.state.selectType];
    newData.forEach((item) => {
      if (item.ids) {
        if ((item.id && item.id === row.id) || (item.ids && item.ids === row.ids)) {
          item.update = true;
          if (!(text === 'prefix')) {
            item[text] = e.target ? e.target.value : e;
          }
        }
      }
    });
    this.setState({
      dataSource: newData,
      selectType: selected,
    });
  };

  _onTableChange(pagination) {
    const flag = this.checkTable();
    if (!flag && this.props.type !== 'lookup') {
      return Message.error('有必填内容未填，请填写完整后到下一页');
    }
    this.setState({ currentPage: pagination.current });
  }

  render() {
    const { currentPage, expn, showRes } = this.state;
    const { type, column, addAirId, dictionaryMap } = this.props;
    const columns = [];
    const showBtn = (record) => {
      this.setState({
        showRes: true,
        expn: record,
      });
    };
    const hideBtn = (val) => {
      this.setState({ showRes: false });
      val ? this.props.getData(this.props.dataNames) : '';
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
        ellipsis: true,
        render: (text, record, n) => {
          if (type === 'lookup') {
            if (item.colType === 'show') {
              const newFlag =
                record.flag === 1
                  ? '资管'
                  : record.flag === 2
                  ? '客户'
                  : record.flag === 3
                  ? '资/客'
                  : '';
              return (
                <>
                  <a
                    onClick={() => {
                      showBtn(record);
                    }}
                  >
                    详细信息
                  </a>
                  <div className={style.spans}>
                    <span>{newFlag}</span>
                  </div>
                </>
              );
            }
            return (
              <span className={styles.setSpnColor}>
                {Array.isArray(text) ? text.join('/') : typeof text === 'string' && text}
              </span>
            );
          }
          if (item.colType === 'select' && type !== 'lookup') {
            return (
              <Select
                defaultValue={String(text)}
                value={record[item.dataIndex] || '请选择'}
                style={{ width: '100%' }}
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex);
                }}
              >
                {dictionaryMap.project.map((v, ind) => (
                  <Option key={ind} value={v.value}>
                    {v.description}
                  </Option>
                ))}
              </Select>
            );
          }
          if (item.colType === 'input') {
            return (
              <>
                <Input
                  value={record[item.dataIndex]}
                  placeholder={item.placeholder}
                  maxLength={item.MaxLength ? item.MaxLength : null}
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    this.handleProjec(e, record, item.dataIndex, item);
                  }}
                />
              </>
            );
          }
          if (item.colType === 'cascader') {
            return (
              <CascaderProCity
                value={record[item.dataIndex]}
                onChange={(e) => {
                  this.handleProjec(e, record, item.dataIndex, item);
                }}
              />
            );
          }
          if (item.colType === 'show') {
            const newFlag =
              record.flag === 1
                ? '资管'
                : record.flag === 2
                ? '客户'
                : record.flag === 3
                ? '资/客'
                : '';
            return (
              <>
                <a
                  onClick={() => {
                    showBtn(record);
                  }}
                >
                  详细信息
                </a>
                {type !== 'add' ? (
                  <div className={style.spans}>
                    <span>{newFlag}</span>
                  </div>
                ) : (
                  ''
                )}
              </>
            );
          }
          const ind =
            currentPage === 0 || currentPage === '0'
              ? 1 * 5 - (5 - (n + 1))
              : currentPage * 5 - (5 - (n + 1));
          return <span>{ind > 0 ? ind : 1}</span>;
        },
      });
    });

    if (type !== 'lookup') {
      columns.push({
        title: '',
        width: 40,
        /*  eslint-disable */
        render: (_, record) => {
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
            current:
              currentPage === 0 || currentPage === '0'
                ? this.state.dataSource.length > 0
                  ? 1
                  : 0
                : currentPage,
            showSizeChanger: false,
            size: 'small',
          }}
          locale={<Empty />}
          rowKey={(text) => {
            return text.ids || text.key || text.id || text.faultrulelineId || text.menuId;
          }}
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
        {showRes ? (
          <Expan
            visible={showRes}
            hidBtn={hideBtn}
            data={expn}
            addAirId={addAirId}
            type={type}
            dictionaryMap={dictionaryMap}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}
FooterInput.propTypes = {
  plantable: PropTypes.array,
  selectType: PropTypes.array,
  plan: PropTypes.string,
  column: PropTypes.array,
  windmodal: PropTypes.node,
  type: PropTypes.string,
  returnRow: PropTypes.func,
  tipData: PropTypes.node,
  perdata: PropTypes.string,
  addAirId: PropTypes.number || PropTypes.string,
  getData: PropTypes.func,
  dataNames: PropTypes.string,
};

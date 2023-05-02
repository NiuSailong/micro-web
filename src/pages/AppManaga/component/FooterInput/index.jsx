import React, { Component } from 'react';
import { Table, Input, Select, Tooltip, Empty, Button, Form } from 'antd';
import styles from './index.less';
import {
  MinusCircleOutlined,
  RollbackOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  CaretRightOutlined,
} from '#/utils/antdIcons';
import Message from '#/components/Message';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { TYPE_LIST } from './helper.js';

const { Option } = Select;
const FormItem = Form.Item;

export default class FooterInput extends Component {
  formRef = React.createRef();
  state = {
    dataSource: this.props.plantable || [],
    tableSource: [],
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
    ResDel: [],
    listCol: '',
    resPlace: this.props.code || '',
  };

  componentDidMount() {
    this.removeSelect();
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (JSON.stringify(props.plantable) !== JSON.stringify(state.dataSource)) {
  //     if (state?.dataSource?.length === 0) {
  //       return {
  //         tableSource: [...(props.plantable || [])],
  //       };
  //     } else {
  //       return {
  //         tableSource: [...(state.dataSource || [])],
  //       };
  //     }
  //   }
  //   return null;
  // }

  shouldComponentUpdate(props) {
    if (JSON.stringify(this.props.plantable) !== JSON.stringify(props.plantable)) {
      this.changeId(props.plantable, true);
      const plantable = [...props.plantable];
      const even = _.remove(plantable, function (n) {
        return n.del && n.old;
      });
      this.setState({
        oldData: even,
        dataSource: [...plantable],
        tableSource: [...(plantable || [])],
      });
    }
    if (this.props.code !== props.code) {
      this.setState({
        resPlace: props.code,
      });
    }
    return true;
  }

  changeId = (data) => {
    const dataSoure = [...data];
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

  checkTable = (saveflag) => {
    const newData = [].concat(this.state.dataSource);
    const array = _.chunk(newData, 10);
    let fal = true;
    const { currentPage } = this.state;
    const pageTable =
      array[currentPage > 0 && currentPage < array.length ? currentPage - 1 : currentPage - 1];
    const keys = [];
    this.props.column.forEach((i) => {
      keys.push(i.dataIndex);
    });
    pageTable.forEach((item) => {
      /*eslint-disable*/
      for (let key in item) {
        /*eslint-disable*/
        let out =
          key !== 'powerId' &&
          key !== 'component' &&
          key !== 'description' &&
          key !== 'icon' &&
          key !== 'menupath' &&
          key !== 'orderNum' &&
          key !== 'perms';
        if (out && _.trimStart(item[key]) === '' && keys.indexOf(key) !== -1 && !item.del && fal) {
          return (fal = false);
        }
      }
    });
    if (fal && saveflag) {
      let pagecur =
        newData.length + 1 > 1 && (newData.length + 1) % 5 === 1 ? array.length + 1 : array.length;
      this.setState({ currentPage: pagecur });
    }
    return fal;
  };

  addNewCol = (val) => {
    let newData = [].concat(this.state.dataSource);
    const flag = newData.length > 0 && !val ? this.checkTable(true) : true;
    if (this.props.plan === 'plan' && flag) {
      newData.push({
        ids: Date.parse(new Date()) + `${Math.floor(Math.random() * 100000)}`,
        type: '',
        resourcesCode: this.state.resPlace || '',
        personNumber: '',
        stdhhours: '',
        stdcosts: '',
        workType: '',
        deptNum: '',
        flag: '',
        strict: '',
        newData: true,
        del: false,
        update: true,
      });
    }
    this.setState({ dataSource: newData, tableSource: newData });
  };
  removeClo = (record, flag) => {
    let newData = this.state.dataSource;
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
        tableSource: newData,
      },
      () => {
        this.removeSelect();
        record.del = record.newData ? true : flag;
      },
    );
  };

  handleChange = (selectedItems) => {
    this.setState({ selectedItems });
  };

  handleProjec = async (e, row, text) => {
    let newData = [...this.state.dataSource];
    let selected = [...this.state.selectType];
    newData.forEach((item) => {
      if (item.ids) {
        if ((item.id && item.id === row.id) || (item.ids && item.ids === row.ids)) {
          item['update'] = true;
          if (!(text === 'prefix')) {
            item[text] = e?.target ? e.target.value : e;
          }
        }
      }
    });
    this.setState(
      {
        dataSource: newData,
        selectType: selected,
      },
      () => {
        if (this.props.plan === 'plan' && text === 'type') {
          this.removeSelect();
        }
      },
    );
  };

  checkList = (selectedRowKeys, selectedRows) => {
    const tips = this.props.tipData || 'plan';
    this.setState({
      selectedRowKeys: selectedRowKeys,
    });
    this.props.returnRow(selectedRows, tips);
  };

  setValue = (record, item) => {
    let newData = [...this.state.dataSource];
    newData.forEach((i) => {
      if (
        (record.id && record.id === i.id) ||
        (record.ids && record.ids === i.ids) ||
        (record.faultrulelineId && record.faultrulelineId === i.faultrulelineId)
      ) {
        i['update'] = true;
        i[item.dataIndex] = null;
      }
    });
    this.setState({
      dataSource: newData,
    });
  };
  _onTableChange(pagination) {
    let flag = this.checkTable();
    if (!flag && this.props.type !== 'lookup') {
      return Message.error('有必填内容未填，请填写完整后到下一页');
    } else {
      this.setState({ currentPage: pagination.current });
    }
  }
  async onClickRow(item) {
    let { UseName, setUseName, showSub } = this.props;
    let selectedRows = [item];
    if (UseName == '') {
      setUseName(item.menuCode);
    } else if (UseName == item.menuCode) {
      setUseName('');
    } else if (UseName !== item.menuCode) {
      setUseName('');
      setTimeout(() => {
        setUseName(item.menuCode);
      }, 500);
    }
    showSub(selectedRows[0].menuId, selectedRows[0].menuCode);
  }

  _handleEcho = (colName, text) => {
    const { perselect, menuCodeS, powerList } = this.props;
    switch (colName) {
      case '上级菜单ID':
        const _findIndex = _.findIndex(perselect, function (o) {
          return o === text;
        });
        return _findIndex > -1 ? menuCodeS[_findIndex] : text;
      case 'type选择':
        return _.find(TYPE_LIST, ['id', text])?.name || text;
      case '权限选择':
        return _.find(powerList, ['powerId', text])?.powerName || text;
      default:
        return text;
    }
  };

  handleReset = () => {
    const { dataSource } = this.state;
    this.formRef.current.resetFields();
    this.setState({ tableSource: dataSource });
  };

  onFinish = (value) => {
    const { dataSource } = this.state;
    const arr = _.filter(dataSource, (_o) => {
      const isContain = _.map(_.compact(Object.keys(value)), (_v) => _o[_v].includes(value[_v]));
      return isContain.includes(true);
    });
    this.setState({ tableSource: [...(arr || [])] });
  };

  render() {
    const { currentPage, selectedRowKeys } = this.state;
    const { type, column, showSub, menuCodeS } = this.props;
    let columns = [];
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        selectedRows[0] && showSub(selectedRows[0].menuId, selectedRows[0].menuCode);
        this.checkList(selectedRowKeys, selectedRows);
      },
    };
    const subRes = (data, value) => {
      showSub(data, value);
      this.setState({
        selectedRowKeys: [],
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
        width: type === 'lookup' ? item.lookWidth : item.width,
        // ellipsis: true,
        render: (text, record, n) => {
          let { UseName } = this.props;
          if (type === 'lookup') {
            return (
              <span className={styles.setSpnColor}>
                {item.dataIndex == 'menuCode' ? (
                  record[item.dataIndex] == UseName ? (
                    <CaretDownOutlined
                      style={{
                        fontSize: '15px',
                        verticalAlign: 'middle',
                        position: 'absolute',
                        left: 0,
                        top: '15px',
                      }}
                      onClick={this.onClickRow.bind(this, record)}
                    />
                  ) : (
                    <CaretRightOutlined
                      style={{
                        fontSize: '15px',
                        verticalAlign: 'middle',
                        position: 'absolute',
                        left: 0,
                        top: '15px',
                      }}
                      onClick={this.onClickRow.bind(this, record)}
                    />
                  )
                ) : null}
                {/* {item.dataIndex === 'linenum' ? currentPage * 5 - (5 - (n + 1)) : text} */}
                {this._handleEcho(item.colName, text)}
              </span>
            );
          } else {
            if (item.colType === 'input') {
              return (
                <div style={{ width: '100%', margin: '0 auto' }}>
                  {item.dataIndex == 'menuCode' ? (
                    record[item.dataIndex] == UseName ? (
                      <CaretDownOutlined
                        style={{
                          fontSize: '15px',
                          verticalAlign: 'middle',
                          position: 'absolute',
                          left: 0,
                          top: '15px',
                        }}
                        onClick={this.onClickRow.bind(this, record)}
                      />
                    ) : (
                      <CaretRightOutlined
                        style={{
                          fontSize: '15px',
                          verticalAlign: 'middle',
                          position: 'absolute',
                          left: 0,
                          top: '15px',
                        }}
                        onClick={this.onClickRow.bind(this, record)}
                      />
                    )
                  ) : null}
                  <Input
                    title={record[item.dataIndex]}
                    value={record[item.dataIndex]}
                    placeholder={item.placeholder}
                    disabled={item.dataIndex === 'deptNum' ? true : item.disable}
                    maxLength={item.MaxLength ? item.MaxLength : null}
                    style={{ width: '90%' }}
                    onClick={() => {
                      this.props.SubText ? subRes(record.menuId, record.menuCode) : '';
                    }}
                    onChange={(e) => {
                      this.props.SubText ? subRes(record.menuId, record.menuCode) : '';
                      this.handleProjec(e, record, item.dataIndex, item);
                    }}
                  />
                </div>
              );
            } else if (item.colType === 'select') {
              item.select = this.props.perselect ? this.props.perselect : item.select;
              return (
                <Select
                  showSearch={true}
                  defaultValue={String(text)}
                  value={record[item.dataIndex] || '根节点'}
                  style={{ width: '100%' }}
                  onClick={() => {
                    this.props.SubText ? subRes(record.menuId, record.menuCode) : '';
                  }}
                  onChange={(e) => {
                    this.handleProjec(e, record, item.dataIndex);
                    this.props.SubText ? subRes(record.menuId, record.menuCode) : '';
                  }}
                  dropdownClassName={styles.powerSelect}
                  optionLabelProp="label"
                  optionFilterProp="label"
                >
                  {item.select &&
                    item.select.map((_v, _i) => {
                      return (
                        <Option key={_i} value={_v} label={menuCodeS[_i]}>
                          <Tooltip placement="topLeft" title={menuCodeS[_i]}>
                            <div className={styles.upperMenu}>
                              <span className={styles.serNum}>{_v}</span>
                              <span>{menuCodeS[_i]}</span>
                            </div>
                          </Tooltip>
                        </Option>
                      );
                    })}
                </Select>
              );
            } else if (item.colType === 'SELECT') {
              return (
                <Select
                  defaultValue={String(text)}
                  value={record[item.dataIndex] || '请选择'}
                  style={{ width: '100%' }}
                  onClick={() => {
                    this.props.SubText ? subRes(record.menuId, record.menuCode) : '';
                  }}
                  onChange={(e) => {
                    this.handleProjec(e, record, item.dataIndex);
                    this.props.SubText ? subRes(record.menuId, record.menuCode) : '';
                  }}
                  dropdownClassName={styles.powerSelect}
                  optionLabelProp="label"
                >
                  {TYPE_LIST.map((_v) => (
                    <Option key={_v.id} value={_v.id} label={_v.name}>
                      <Tooltip placement="topLeft" title={_v.name}>
                        <div className={styles.upperMenu}>
                          <span>{_v.id}</span>
                          <span>{_v.name}</span>
                        </div>
                      </Tooltip>
                    </Option>
                  ))}
                </Select>
              );
            } else if (item.colType === 'powerId') {
              return (
                <Select
                  defaultValue={text ? String(text) : ''}
                  value={record[item.dataIndex] || '请选择'}
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    this.handleProjec(e, record, item.dataIndex);
                  }}
                  allowClear
                  optionLabelProp="label"
                  dropdownClassName={styles.powerSelect}
                >
                  {this.props.powerList?.length
                    ? this.props.powerList.map((_v) => (
                        <Option key={_v.powerId} value={_v.powerId} label={_v.powerName}>
                          {/* <Tooltip
                            placement="topLeft"
                            title={
                              <>
                                <div>{_v.tableName} </div>
                                <div>{_v.powerName}</div>
                              </>
                            }
                          > */}
                          <div>{_v.tableName}</div>
                          <div style={{ textAlign: 'right' }}>{_v.powerName}</div>
                          {/* </Tooltip> */}
                        </Option>
                      ))
                    : null}
                </Select>
              );
            } else {
              let ind = currentPage == 0 ? 1 * 5 - (5 - (n + 1)) : currentPage * 5 - (5 - (n + 1));
              return <span>{ind > 0 ? ind : 1}</span>;
            }
          }
        },
      });
    });
    if (type !== 'lookup') {
      columns.push({
        title: '',
        width: 40,
        render: (_, record) => {
          return record.del ? (
            <div>
              <RollbackOutlined
                onClick={() => {
                  this.removeClo(record, false);
                }}
                style={{ color: '#ACB1C1', fontSize: '17px', pointerEvents: 'all' }}
              />
              <div></div>
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
    } else if (this.props.lookup !== 'lookups') {
      columns.push({
        title: '',
        width: 40,
        render: (text) => {
          return !(this.state.listCol === text.menuCode) ? (
            <p className={styles.pflex}>
              <CaretDownOutlined
                onClick={() => {
                  this.setState({ listCol: text.menuCode });
                  showSub(text.menuId);
                }}
                style={{ color: '#ACB1C1', fontSize: '17px' }}
              />
              <span style={{ whiteSpace: 'nowrap' }}>展开</span>
            </p>
          ) : (
            <p className={styles.pflex}>
              <CaretUpOutlined
                onClick={() => {
                  this.setState({ listCol: '' });
                  showSub('');
                }}
                style={{ color: '#ACB1C1', fontSize: '17px' }}
              />
              <span style={{ whiteSpace: 'nowrap' }}>收起</span>
            </p>
          );
        },
      });
    }

    return (
      <div className={styles.projectTbale} id="tables">
        {this.props.filter ? (
          <Form
            layout="inline"
            ref={this.formRef}
            onFinish={this.onFinish}
            style={{ marginBottom: '15px' }}
          >
            <FormItem label="菜单编码" name="menuCode">
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem label="菜单/按钮名称" name="menuName">
              <Input placeholder="请输入" />
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                查询
              </Button>
              <Button onClick={() => this.handleReset()}>重置</Button>
            </FormItem>
          </Form>
        ) : null}

        <Table
          bordered={true}
          size="mini"
          columns={columns}
          loading={this.props.menuLoding}
          // dataSource={[...this.state.dataSource]}
          dataSource={[...(this.state.tableSource || [])]}
          pagination={
            this.props.lookup !== 'lookups'
              ? {
                  pageSize: 10,
                  current:
                    currentPage == 0 ? (this.state.dataSource.length > 0 ? 1 : 0) : currentPage,
                  showSizeChanger: false,
                  size: 'small',
                }
              : false
          }
          // rowSelection={this.props.SubText ? rowSelection : false}
          locale={<Empty />}
          rowKey={(text) => {
            return text.ids || text.key || text.id || text.faultrulelineId || text.menuId;
          }}
          scroll={this.props.scroll}
          onChange={this._onTableChange.bind(this)}
          rowClassName={(text) => {
            return text.del && type !== 'lookup' ? styles.tableViewCss : '';
          }}
          expandable={{
            rowExpandable: true,
          }}
        />
        {type !== 'lookup' ? (
          <Button
            icon={<PlusCircleOutlined style={{ color: '#1E7CE8', fontSize: '15px' }} />}
            onClick={() => {
              this.addNewCol(this.props.code);
            }}
            style={{ marginTop: 15 }}
          >
            继续添加
          </Button>
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
  windmodal: PropTypes.node,
  type: PropTypes.string,
  returnRow: PropTypes.func,
  tipData: PropTypes.node,
  perdata: PropTypes.string,
  perselect: PropTypes.array,
  menuCodeRele: PropTypes.func,
  menuCodeS: PropTypes.array,
  showSub: PropTypes.func,
  SubText: PropTypes.bool,
  code: PropTypes.string,
  lookup: PropTypes.string,
  powerList: PropTypes.array,
};

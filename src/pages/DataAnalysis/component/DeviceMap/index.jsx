import React, { Component } from 'react';
import { Table, Input, Select, Tooltip, Empty, Drawer } from 'antd';
import styles from './index.less';
import { fiflter } from './helper';
import Tablemodaling from '../Modal';
import {
  MinusCircleOutlined,
  RollbackOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  DownOutlined,
} from '#/utils/antdIcons';
import { getFaultList } from '@/services/stationMap';
import Message from '#/components/Message';
import _ from 'lodash';
import BatchStationList from '../OptionBtn/BacthAddComp';
import tAlert from '#/components/Alert';

const { Option } = Select;
export default class DeviceMap extends Component {
  state = {
    dataSource: this.props.plantable || [],
    selectedItems: [],
    currentPage: 1,
    flagData: [],
    selectType: this.props.selectType || [],
    oldData: [],
    batchAddVisible: false,
  };

  componentDidMount() {
    this.changeId(this.props.plantable, true);
    this.removeSelect();
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
      this.setState({
        selectType: selected,
      });
    }
  };

  checkTable = (saveflag) => {
    const newData = [].concat(this.state.dataSource);
    const array = _.chunk(newData, 5);
    let fal = true;
    const { currentPage } = this.state;

    const pageTable = array[currentPage > 0 && currentPage < array.length ? currentPage - 1 : 0];
    const keys = [];
    this.props.column.forEach((i) => {
      keys.push(i.dataIndex);
    });

    pageTable.forEach((item) => {
      /*eslint-disable*/
      for (let i in item) {
        /*eslint-disable*/
        if (_.trimStart(item[i]) === '' && keys.indexOf(i) !== -1 && !item.del && fal) {
          return (fal = false);
        }
      }
    });
    if (fal && saveflag) {
      let pagecur =
        newData.length + 1 > 1 && (newData.length + 1) % 5 === 1 ? array.length + 1 : array.length;
      this.setState({
        currentPage: pagecur,
      });
    }
    return fal;
  };

  addNewCol = () => {
    const { perdata } = this.props;
    let newData = [].concat(this.state.dataSource);
    const flag = newData.length > 0 ? this.checkTable(true) : true;
    if (this.props.plan === 'plan' && flag) {
      newData.push({
        ids: Date.parse(new Date()) + `${Math.floor(Math.random() * 100000)}`,
        type: '',
        personNumber: '',
        stdhhours: '',
        stdcosts: '',
        workType: '',
        assetNum: this.props.perselect[0],
        deptNum: perdata,
        flag: '',
        strict: '',
        newData: true,
      });
    } else if (this.props.plan === 'unplan' && flag) {
      let faultruleId = '';
      newData.map((item) => {
        if (!item.newData && !item.del) {
          faultruleId = item.faultruleId;
        }
      });
      newData.push({
        ids: Date.parse(new Date()) + `${Math.floor(Math.random() * 1000000)}`,
        linenum: newData.length > 0 ? newData[newData.length - 1].linenum + 1 : 1,
        faultCode: '',
        faultName: '',
        stdhhours: '',
        assetNum: this.props.perselect[0],
        stdcosts: '',
        faultruleId: faultruleId,
        workType: '',
        confirm: '',
        update: true,
      });
    } else {
      return Message.error('有必填内容未填，请填写完整后继续添加');
    }
    this.setState(
      {
        dataSource: newData,
      },
      () => {
        // this.removeSelect();
        this.props.returnData(this.state.dataSource, this.state.oldData, false, true);
      },
    );
  };
  removeClo = (record, flag) => {
    let newData = this.state.dataSource;
    newData.forEach((item, index) => {
      if (
        (record.id && record.id === item.id) ||
        (record.ids && record.ids === item.ids) ||
        (record.faultrulelineId && record.faultrulelineId === item.faultrulelineId)
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
        this.removeSelect();
        record.del = record.newData ? true : flag;
        this.props.returnData(this.state.dataSource, this.state.oldData, record, true);
      },
    );
  };

  handleChange = (selectedItems) => {
    this.setState({ selectedItems });
  };

  handleProjec = async (e, row, text) => {
    if (!this.props.windmodal && this.props.plan === 'unplan') {
      return Message.error('请先选择风机型号再填写规则信息');
    }
    let newData = [...this.state.dataSource];
    let selected = [...this.state.selectType];
    // eslint-disable-next-line no-useless-escape
    let patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im;
    if (text === 'faultCode') {
      return;
    }
    newData.forEach((item) => {
      if (item.id || item.ids) {
        if ((item.id && item.id === row.id) || (item.ids && item.ids === row.ids)) {
          if (text == 'assetNum') {
            item['assetNum'] = e;
          }

          if (item.newData === undefined) {
            item.update = true;
          }

          if (!(text === 'prefix' && patrn.test(e.target.value))) {
            item[text] = e.target ? e.target.value : e;
          }

          if (text == 'workType' && this.props.plan === 'unplan' && e === '手动指派') {
            item['confirm'] = '否';
          }
          if (text == 'workType' && this.props.plan === 'unplan' && e !== '手动指派') {
            item['confirm'] = '否';
          }
        }
      }
      if (item.faultrulelineId) {
        if (item.faultrulelineId === row.faultrulelineId) {
          // item['update'] = true;
          item[text] = e.target ? e.target.value : e;
          if (text == 'workType' && this.props.plan === 'unplan' && e === '手动指派') {
            item['confirm'] = '是';
          }
          if (text == 'workType' && this.props.plan === 'unplan' && e !== '手动指派') {
            item['confirm'] = '否';
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
        this.props.returnData(this.state.dataSource, this.state.oldData, true);
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

  faultCode = async (record, text) => {
    if (!this.props.windmodal && this.props.plan === 'unplan') {
      return Message.error('请先选择风机型号再填写规则信息');
    }
    if (text === 'faultCode') {
      let dataObj = [...this.state.dataSource];
      let request = await getFaultList({
        current: 0,
        faultCode: '',
        faultName: '',
        size: 10,
      });
      let res = await Tablemodaling.show(
        fiflter,
        request,
        {
          current: 0,
          faultCode: '故障编号',
          faultName: '故障名称',
          typeCode: 'faultCode',
          typeName: 'faultName',
          size: 10,
          title: '故障编号',
        },
        getFaultList,
        dataObj,
      );
      res.length > 0 &&
        dataObj.forEach((item) => {
          if (
            (item.id && item.id === record.id) ||
            (item.ids && item.ids === record.ids) ||
            (item.faultrulelineId && item.faultrulelineId === record.faultrulelineId)
          ) {
            item.faultCode = res[0].faultCode;
            item.faultName = res[0].faultName;
          }
        });
      this.setState(
        {
          dataSource: dataObj,
        },
        () => {
          this.props.returnData(this.state.dataSource, this.state.oldData, false, true);
        },
      );
    }
  };

  checkValue = (e, record, item) => {
    let reg = /^\+?[1-9][0-9]*$/; //验证非零的正整数
    let float = /^[0-9]+(.[0-9]{1,2})?$/; //验证小数点后两位
    let floats = /^[0-9]+(.[0-9]{0,1})?$/;
    if (item.verificationType === 'number') {
      if (!reg.test(e.target.value)) {
        Message.error(item.message);
        this.setValue(record, item);
      }
    } else if (item.verificationType === 'float' && !item.numberT) {
      if (e.target.value && !float.test(e.target.value)) {
        Message.error(item.message);
        this.setValue(record, item);
      }
    } else if (item.verificationType === 'floats' && !item.numberT) {
      if (e.target.value && !floats.test(e.target.value)) {
        Message.error(item.message);
        this.setValue(record, item);
      } else if (e.target.value && item.MaxLength < e.target.value.length) {
        Message.error(item.message);
      }
    }
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

  shouldComponentUpdate(props) {
    if (JSON.stringify(this.props.plantable) !== JSON.stringify(props.plantable)) {
      let plantable = [...props.plantable];
      let even = _.remove(plantable, function (n) {
        return n.del && n.old;
      });
      this.setState({
        oldData: even,
        dataSource: [...plantable],
      });
    }
    return true;
  }
  _onTableChange(pagination) {
    let flag = this.checkTable();
    if (!flag) {
      return Message.error('有必填内容未填，请填写完整后到下一页');
    } else {
      this.setState({ currentPage: pagination.current });
    }
  }

  _handleClose = async () => {
    const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
    if (obj.index === 1) {
      this.setState({ batchAddVisible: false }, () => {
        // this._onFectDataList();
      });
    }
  };

  _handleDirectClose = (list) => {
    const { perdata } = this.props;
    let copyDataSource = _.cloneDeep(this.state.dataSource);
    const flag = copyDataSource.length > 0 ? this.checkTable(true) : true;
    if (list.length && flag) {
      list.forEach((item) => {
        item.deptNum = perdata;
        item.newData = true;
      });
      copyDataSource.push(...list);
    }
    this.setState({ batchAddVisible: false, dataSource: copyDataSource });
  };

  _handleBatchAdd = () => {
    this.setState({ batchAddVisible: !this.state.batchAddVisible });
  };

  render() {
    // selectedItems
    const { dataSource, currentPage, selectType, selectedRowKeys, batchAddVisible } = this.state;

    const { type, column, pageFlag } = this.props;
    // const filteredOptions = OPTIONS.filter(o => !selectedItems.includes(o));

    let columns = [];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.checkList(selectedRowKeys, selectedRows);
      },
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
            return (
              <span className={styles.setSpnColor}>
                {item.dataIndex === 'linenum' ? currentPage * 5 - (5 - (n + 1)) : text}
              </span>
            );
          } else {
            if (item.details === 'type') {
              return (
                <Select
                  onChange={(value) => {
                    this.handleProjec(value, record, item.dataIndex, selectType);
                  }}
                  value={text}
                  placeholder={item.placeholder}
                  // getPopupContainer={() => document.getElementById('tables')}
                  getPopupContainer={() => document.getElementById('headBar')}
                  style={{ width: '100%' }}
                >
                  {selectType &&
                    selectType.map((v, ind) => {
                      return (
                        <Option key={ind} value={v.value}>
                          {v.description}
                        </Option>
                      );
                    })}
                </Select>
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
                  suffix={
                    item.suffix ? (
                      <DownOutlined
                        onClick={() => {
                          this.faultCode(record, item.dataIndex);
                        }}
                        style={{ color: 'rgba(0, 0, 0, 0.25)', fontSize: '12px' }}
                      />
                    ) : (
                      false
                    )
                  }
                  onClick={() => {
                    this.faultCode(record, item.dataIndex);
                  }}
                  onBlur={(e) => {
                    this.checkValue(e, record, item);
                  }}
                  onChange={(e) => {
                    this.handleProjec(e, record, item.dataIndex, item);
                  }}
                />
              );
            } else if (item.colType === 'select') {
              return (
                <Select
                  value={
                    item.dataIndex === 'confirm' || item.dataIndex === 'flag'
                      ? text === 0
                        ? '否'
                        : text === 1
                        ? '是'
                        : text
                      : text
                  }
                  onChange={(value) => {
                    this.handleProjec(value, record, item.dataIndex);
                  }}
                  disabled={
                    item.dataIndex === 'confirm' && record['workType'] === '手动指派' ? true : false
                  }
                  getPopupContainer={() => document.getElementById('tables')}
                  placeholder={item.placeholder}
                  style={{ width: '100%' }}
                >
                  {item.select &&
                    item.select.map((v, ind) => {
                      return (
                        <Option key={ind} value={v.value} disabled={v.disable}>
                          {v.description}
                        </Option>
                      );
                    })}
                </Select>
              );
            } else if (item.colType === 'SELECT') {
              item.select = this.props.perselect ? this.props.perselect : item.select;
              return (
                <Select
                  value={text ? text : item.select}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    this.handleProjec(value, record, item.dataIndex);
                  }}
                  disabled={record.newData ? false : true}
                >
                  {item.select &&
                    item.select.map((v, ind) => {
                      return (
                        <Option key={ind} value={v}>
                          {v}
                        </Option>
                      );
                    })}
                </Select>
              );
            } else if (item.colType === 'changetext') {
              return record[item.dataIndex] ? (
                <span className={styles.spnInput}>{record[item.dataIndex]}</span>
              ) : (
                <span style={{ color: '#888E95' }}>{item.placeholder}</span>
              );
            } else {
              let ind = currentPage == 0 ? 1 * 5 - (5 - (n + 1)) : currentPage * 5 - (5 - (n + 1));
              return <span>{ind > 0 ? ind : 1}</span>;
            }

            // if(item.colType==='MultipleChoice'){
            //   return  <Select
            //     mode="multiple"
            //     placeholder={item.placeholder}
            //     getPopupContainer={() => document.getElementById('tables')}
            //     value={text}
            //     maxTagCount={1}
            //     onChange={(value)=>{this.handleProjec(value,record,item.dataIndex)}}
            //     style={{ width: '100%' }}
            //   >
            //     {filteredOptions.map(item => (
            //       <Select.Option key={item} value={item}>
            //         {item}
            //       </Select.Option>
            //     ))}
            //   </Select>
            // }
          }
        },
      });
    });

    if (type !== 'lookup') {
      columns.push({
        title: '',
        // dataIndex: 'InstalledQuantity',
        width: 40,
        render: (text, record) => {
          return record.del ? (
            <RollbackOutlined
              onClick={() => {
                this.removeClo(record, false);
              }}
              style={{ color: '#ACB1C1', fontSize: '17px' }}
            />
          ) : (
            <MinusCircleOutlined
              onClick={() => {
                this.removeClo(record, true);
              }}
              style={{ color: '#ACB1C1', fontSize: '17px' }}
            />
          );
        },
      });
    }

    return (
      <div className={styles.projectTbale} id="tables">
        <Table
          columns={columns}
          dataSource={[...this.state.dataSource]}
          pagination={{
            pageSize: 5,
            current: currentPage == 0 ? (this.state.dataSource.length > 0 ? 1 : 0) : currentPage,
            showSizeChanger: false,
            size: 'small',
            total: this.props.total,
          }}
          rowSelection={type === 'lookup' ? false : rowSelection}
          scroll={type === 'lookup' ? false : dataSource.length < 5 ? { x: 700 } : { x: 700 }}
          locale={<Empty />}
          rowKey={(text) => {
            return text.key || text.id || text.faultrulelineId || text.ids;
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
            {pageFlag === 'deptMap' && this.props.perdata ? (
              <span style={{ marginLeft: '15px' }} onClick={this._handleBatchAdd}>
                批量添加
              </span>
            ) : (
              ''
            )}
          </div>
        ) : null}
        {batchAddVisible && (
          <Drawer
            width="90%"
            title="批量添加"
            placement="right"
            closable
            onClose={this._handleClose}
            open={batchAddVisible}
            destroyOnClose
            data-drawer-batch
          >
            {batchAddVisible && (
              <BatchStationList
                visible={batchAddVisible}
                onClose={this._handleDirectClose}
                onlyShowAssetmap
              />
            )}
          </Drawer>
        )}
      </div>
    );
  }
}

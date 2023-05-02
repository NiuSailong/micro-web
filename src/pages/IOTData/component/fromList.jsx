import React, { Component } from 'react';
import { Row, Col, Input, Radio, Empty, Tooltip, Form, InputNumber } from 'antd';
import styles from '../index.less';
import { MinusCircleOutlined, PlusCircleOutlined } from '#/utils/antdIcons';
import tAlert from '#/components/Alert';
import { AlertResult } from '#/utils/contacts';
import { modalComp, PAGE_TYPE, handlePastes, deviceConfigMax } from '@/pages/IOTData/helper';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VList from 'react-virtualized/dist/commonjs/List';
export default class FromList extends Component {
  fromRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      addNum: props?.showAddNum ? 10 : 1,
      length: 0,
    };
  }

  setFormList(list) {
    const { id } = this.props;
    this.setState(
      {
        length: list.length,
      },
      () => {
        this.fromRef?.current?.setFieldsValue({ [id]: list });
      },
    );
  }

  onDelete = async (item, index) => {
    const { deleteFn } = this.props;
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      deleteFn && deleteFn(item, index);
    }
  };
  showModal = async ({ modal, id }, dataItem, index) => {
    const { changeValue, modalData, recordUpdate, pageState } = this.props;
    const comp = modalComp[modal];
    if (!comp || (pageState === PAGE_TYPE.READONLY && !dataItem[id])) {
      return;
    }
    const propsData = { value: dataItem[id], dataItem, ...modalData };
    if (id === 'model') {
      propsData.rightList = dataItem?.labels;
      propsData.pageState = pageState;
    }
    let res = await comp.show(propsData);
    if (res.index === AlertResult.SUCCESS) {
      const result = { [id]: res.value };
      if (id === 'model') {
        if (res.value !== dataItem[id] && dataItem[id] && !dataItem.oldModel && !dataItem.add) {
          result.oldModel = dataItem[id];
        }
        result.labels = res.list.map((n) => {
          return { ...n, deleteFlag: n.deleteFlag || false };
        });
      }
      recordUpdate && recordUpdate(dataItem);
      changeValue(result, index);
    }
  };
  onPaste = (e, index, pasteArr) => {
    e.preventDefault();
    const data = handlePastes(e.clipboardData.getData('Text'));
    this.props?.addFn(data, 1, index, pasteArr);
  };

  getCheckFormList = async () => {
    const { id } = this.props;
    const result = await this.fromRef?.current?.validateFields();
    return result[id];
  };

  getFormList = async () => {
    const { id } = this.props;
    return await this.fromRef?.current?.getFieldsValue()[id];
  };

  render() {
    const {
      list = [],
      addFn,
      rowSelect,
      radioFn,
      rowKey,
      chooseValue,
      maxHeight = 415,
      showAddNum,
      config = [],
      hiddenDelete,
      pageState,
      paddingRight = 45,
      titleMarginBottom = 12,
      hiddenMargin,
      recordUpdate,
      hiddenAddBtn,
    } = this.props;
    const { addNum, length } = this.state;
    return (
      <div className={styles.IOTFromList}>
        <div
          className={styles.IOTFromList_title}
          style={{ paddingRight, marginBottom: titleMarginBottom }}
        >
          {rowSelect === 'radio' ? <div className={styles.IOTFromList_radio} /> : null}
          {list && list.length ? (
            <Row className={styles.IOTFromList_row}>
              {config.map((item, ind) => {
                const { label, span = 12 } = item;
                return (
                  <Col span={span} key={ind}>
                    {label}
                  </Col>
                );
              })}
            </Row>
          ) : null}

          {!hiddenDelete && pageState !== PAGE_TYPE.READONLY ? (
            <div className={styles.IOTFromList_delete} />
          ) : (
            ''
          )}
        </div>
        <div
          className={hiddenMargin ? styles.hiddenMargin : ''}
          style={{ paddingRight, height: length > 6 ? 270 : 42 * length }}
        >
          <Form ref={this.fromRef}>
            <Form.List name={this.props.id}>
              {(fields) => (
                <AutoSizer>
                  {({ width }) => {
                    return (
                      <VList
                        height={fields.length > 6 ? 270 : 42 * fields.length}
                        rowCount={fields.length}
                        rowHeight={42}
                        rowRenderer={({ index, style }) => {
                          const fieldsItem = fields[index];
                          const dataItem = list[index] || {};
                          if (dataItem?.delete || dataItem?.deleteFlag) {
                            return null;
                          }
                          return (
                            <div style={style} key={index} className={styles.IOTFromList_form}>
                              {rowSelect === 'radio' ? (
                                <div className={styles.IOTFromList_radio}>
                                  <Radio
                                    onChange={() => radioFn(dataItem)}
                                    value={dataItem[rowKey]}
                                    checked={chooseValue === dataItem[rowKey]}
                                  />
                                </div>
                              ) : null}
                              <Row className={styles.IOTFromList_row}>
                                {config.map((item, ind) => {
                                  const {
                                    label,
                                    span = 12,
                                    type,
                                    readonly,
                                    required,
                                    id,
                                    render,
                                    pasteArr = [],
                                    modal,
                                    other,
                                    paste,
                                    rules = [],
                                  } = item;
                                  let str = '';
                                  let showValue = '';
                                  if (other && id === 'ponitAndTemplateInfos') {
                                    showValue = dataItem[id] ? '已配置' : '未配置';
                                  }
                                  if (render) {
                                    str = render(dataItem);
                                  } else if (pageState === PAGE_TYPE.READONLY || readonly) {
                                    str = (
                                      <Tooltip
                                        title={showValue || dataItem[id]}
                                        overlayClassName="overtoop"
                                        placement="topLeft"
                                      >
                                        <div
                                          onClick={() => this.showModal(item, dataItem, index)}
                                          className={styles.IOTFromList_read}
                                        >
                                          {showValue || (dataItem.add ? '' : dataItem[id])}
                                        </div>
                                      </Tooltip>
                                    );
                                  } else if (modal) {
                                    str = (
                                      <div
                                        onClick={() => this.showModal(item, dataItem, index)}
                                        style={{ width: '100%' }}
                                        className={styles.IOTCreat_showModal}
                                      >
                                        {showValue || dataItem[id] || <span>请选择{label}</span>}
                                      </div>
                                    );
                                  } else if (type === 'input') {
                                    let inputParams = {};
                                    if (paste) {
                                      inputParams.onPaste = (e) => this.onPaste(e, index, pasteArr);
                                    }
                                    str = (
                                      <Input
                                        {...inputParams}
                                        onChange={() => {
                                          recordUpdate && recordUpdate(dataItem);
                                        }}
                                        placeholder={'请输入' + label}
                                      />
                                    );
                                  }
                                  let obj = { rules };
                                  if (!readonly && pageState !== PAGE_TYPE.READONLY && required) {
                                    obj.rules = [
                                      ...obj.rules,
                                      {
                                        required: true,
                                        message: type === 'input' ? '请输入' : '请选择' + label,
                                      },
                                    ];
                                  }

                                  return (
                                    <Col span={span} key={ind} className={styles.IOTFromList_col}>
                                      <Form.Item
                                        {...fieldsItem}
                                        key={id}
                                        {...obj}
                                        name={[fieldsItem.name, id]}
                                        fieldKey={[fieldsItem.fieldKey, id]}
                                      >
                                        {str}
                                      </Form.Item>
                                    </Col>
                                  );
                                })}
                              </Row>
                              {!hiddenDelete && pageState !== PAGE_TYPE.READONLY ? (
                                <div className={styles.IOTFromList_delete}>
                                  <MinusCircleOutlined
                                    className={styles.IOTFromList_delete_btn}
                                    onClick={() => this.onDelete(dataItem, index)}
                                  />
                                </div>
                              ) : (
                                ''
                              )}
                            </div>
                          );
                        }}
                        width={width}
                      />
                    );
                  }}
                </AutoSizer>
              )}
            </Form.List>
          </Form>
          {!list || !list.length ? (
            <div className={styles.IOTFromList_empty} style={{ paddingLeft: paddingRight }}>
              <Empty description={'暂无数据'} />
            </div>
          ) : null}
        </div>
        {pageState !== PAGE_TYPE.READONLY && !hiddenAddBtn ? (
          <div className={styles.IOTFromList_addBox}>
            <div
              onClick={() => {
                const num = Number(addNum) || 1;
                addFn(null, num);
              }}
              className={styles.IOTFromList_add}
            >
              <PlusCircleOutlined className={styles.IOTFromList_add_icon} />
              继续添加
            </div>
            {showAddNum ? (
              <div>
                <InputNumber
                  value={addNum}
                  max={deviceConfigMax}
                  style={{ width: 65, marginLeft: 15, marginRight: 8 }}
                  controls={false}
                  onChange={(val) => this.setState({ addNum: val })}
                />
                条
              </div>
            ) : (
              ''
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

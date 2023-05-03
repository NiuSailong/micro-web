import React, { Component } from 'react';
import { Row, Col, Select, Input, TreeSelect, Cascader, Form, message } from 'antd';
import styles from './index.less';
import { AllUserByCompany } from '@/services/stationrule';
const { Option } = Select;
const { TextArea } = Input;
const children = [];
const { TreeNode } = TreeSelect;

for (let i = 10; i < 36; i++) {
  children.push(i.toString(36) + i);
}

export class SelectType extends Component {
  render() {
    const { dataType, changeValue, Mokedata } = this.props;
    // eslint-disable-next-line
    function treeNode(dataType) {
      return dataType.map((item, index) => {
        return (
          <TreeNode
            value={item.deptId}
            key={`${index}${item.deptId || ''}`}
            title={item.deptName}
            selectable={item.deptType === 'D1' ? true : false}
          >
            {item.children && item.children.length > 0 ? treeNode(item.children) : ''}
          </TreeNode>
        );
      });
    }

    function selectNode(datatype) {
      return datatype.map((item) => {
        return (
          <TreeNode
            value={item.value}
            title={item.mobile ? `${item.title}-${item.mobile}` : item.title}
            selectable={true}
            key={String(item.value)}
          />
        );
      });
    }

    return (
      <span className={dataType.type === 'aera' ? styles.textArea : styles.contentEdit}>
        {dataType.type === 'input' ? (
          <Input
            placeholder={dataType.placeholder}
            onKeyCode={(e) => {
              if (e.keyCode == 13) return false;
            }}
            onChange={(e) => {
              changeValue(e, dataType);
            }}
          />
        ) : dataType.type === 'select' ? (
          <Select
            placeholder={dataType.placeholder}
            mode={dataType.mode}
            maxTagCount={2}
            virtual={true}
            getPopupContainer={() => document.getElementById('headBar')}
            showSearch={dataType.filterOption}
            defaultValue={Mokedata ? Mokedata[dataType.detail] : null}
            onKeyCode={(e) => {
              if (e.keyCode == 13) return false;
            }}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            style={{ width: '100%' }}
            onChange={(val) => {
              changeValue(val, dataType);
            }}
          >
            {dataType.select &&
              dataType.select.map((n, ind) => {
                return (
                  <Option key={ind} value={n.id}>
                    {n.name}
                  </Option>
                );
              })}
          </Select>
        ) : dataType.type === 'aera' ? (
          <TextArea
            id={dataType.detail}
            placeholder={dataType.placeholder}
            style={{ width: '51%' }}
            autoSize
            onChange={(e) => {
              changeValue(e, dataType);
            }}
          />
        ) : dataType.type === 'treeSelect' ? (
          <TreeSelect
            showSearch
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            value={Mokedata ? Mokedata.projectName : null}
            placeholder={dataType.placeholder}
            allowClear={false}
            labelInValue
            virtual={true}
            treeDefaultExpandAll={true}
            getPopupContainer={() => document.getElementById('headBar')}
            treeNodeFilterProp={'title'}
            selectable={false}
            onChange={(value) => {
              changeValue(value, dataType);
            }}
            onKeyCode={(e) => {
              if (e.keyCode == 13) return false;
            }}
          >
            {treeNode(dataType.select)}
          </TreeSelect>
        ) : dataType.type === 'cascader' ? (
          <Cascader
            options={dataType.select}
            popupClassName={styles.cascader}
            style={{ width: '100%' }}
            placeholder={dataType.placeholder}
          />
        ) : dataType.type === 'selectTree' ? (
          <TreeSelect
            // treeData ={ dataType.select}
            defaultValue={Mokedata ? Mokedata[dataType.detail] : null}
            placeholder={dataType.placeholder}
            allowClear={false}
            virtual={true}
            treeNodeFilterProp={'title'}
            getPopupContainer={() => document.getElementById('headBar')}
            treeCheckable={true}
            showArrow={true}
            maxTagCount={2}
            dropdownClassName={styles.RuledropdownClassName}
            onChange={(value) => {
              changeValue(value, dataType);
            }}
          >
            {selectNode(dataType.select)}
          </TreeSelect>
        ) : (
          <div>
            <span
              className={
                Mokedata[dataType.detail] && !dataType.color ? styles.contents : styles.contentView
              }
            >
              {Mokedata ? Mokedata[dataType.detail] || dataType.placeholder : '-'}
            </span>
          </div>
        )}
      </span>
    );
  }
}

export default class HeaderInput extends Component {
  state = {
    Information: {},
    detailValue: {},
    type: '',
  };

  componentDidMount() {
    const { Mokedata } = this.props;
    this.setState({
      detailValue: Mokedata,
      type: this.props.type,
    });
  }

  changeValue = async (value, data) => {
    let obj = { ...this.state.Information };
    const { type } = this.props;
    if (data.type === 'treeSelect') {
      if (type === 'newData') {
        if (!value) {
          return (obj[data.detail] = value);
        }
        const res = await AllUserByCompany(value.value);
        if (res.result === 'false') {
          this.inspectValue(data.select, value.value);
        } else {
          return message.error('该风场已有规则,请重新选择');
        }
      }
      this.inspectValue(data.select, value);
    }
    obj[data.detail] = value;
    this.setState(
      {
        Information: obj,
      },
      () => {
        this.props.callBack(data.detail, value, this.state.Information);
      },
    );
  };

  inspectValue = (data, value, deptparentName) => {
    data.forEach((item) => {
      if (item.deptId === value.value) {
        let obj = { ...this.state.detailValue };
        obj.infoOrg = item.parent.split('/').slice(-2).join('-');
        obj.forceStationName = deptparentName;
        obj.forceStationType = item.projectType;
        obj.projectName = value.label;
        this.props.callBack('forceStationName', obj.forceStationName, this.state.Information);
        this.props.callBack('forceStationType', obj.forceStationType, this.state.Information);
        this.props.callBack('infoOrg', obj.infoOrg, this.state.Information);
        this.setState({
          detailValue: obj,
        });
      } else {
        if (item.children && item.children.length > 0) {
          this.inspectValue(item.children, value, item.deptName);
        }
      }
    });
  };

  shouldComponentUpdate(nextProps) {
    if (nextProps.type !== this.props.type) {
      this.setState({
        type: nextProps.type,
      });
    }
    return true;
  }

  render() {
    const { Detail } = this.props;
    const { detailValue, type } = this.state;
    // eslint-disable-next-line
    function TEXTDETAIL(item, changeValue, type, Mokedata, index) {
      function text(del) {
        if (del === 'sceneryHousekeeperIds') {
          return 'sceneryHousekeeperNames';
        }
        if (del === 'serviceTeamIds') {
          return 'serviceTeamNames';
        }
        return del;
      }
      if (type === 'lookup' || (type === 'edit' && item.detail === 'projectName')) {
        return (
          <Col span={item.span} style={{ lineHeight: '56px' }}>
            <span
              className={index % 2 == 0 ? styles.textRightView : styles.textRightViewEdit}
              style={item.color ? { color: '#888E95' } : null}
            >
              {item.title}
            </span>
            <Form.Item
              name={item.detail}
              rules={[
                {
                  required: item.tip,
                  message: item.placeholder,
                },
              ]}
            >
              <div>
                <span
                  title={Mokedata[text(item.detail)]}
                  className={styles.contentsV}
                  style={item.color ? { color: '#888E95' } : null}
                >
                  {Mokedata[text(item.detail)] instanceof Array
                    ? Mokedata[text(item.detail)].join('、')
                    : Mokedata[text(item.detail)] || '-'}
                </span>
              </div>
            </Form.Item>
          </Col>
        );
      }
      if (type === 'edit' || type === 'newData') {
        return (
          <Col
            span={item.span}
            className={index % 2 == 0 ? styles.tipSet : styles.tipSets}
            style={{ lineHeight: '56px' }}
          >
            <Form.Item
              name={item.detail}
              rules={[
                {
                  required: item.tip,
                  message: item.placeholder,
                },
              ]}
            >
              {item.tip ? (
                <div
                  className={item.detail === 'projectName' ? null : styles.bgtag}
                  style={{ display: 'flex', lineHeight: '13px' }}
                >
                  <span className={index % 2 == 0 ? styles.textRight : styles.textRightEdit}>
                    <span className={styles.textTip}>*</span>
                    {item.title}
                  </span>
                  <SelectType
                    dataType={item}
                    tream={3}
                    changeValue={changeValue}
                    Mokedata={Mokedata}
                    type={type}
                  />
                </div>
              ) : (
                <div className={styles.bgtag}>
                  <span
                    className={
                      item.color
                        ? index % 2 == 0
                          ? styles.notes
                          : styles.notesEit
                        : index % 2 == 0
                        ? styles.textRight
                        : styles.textRightEdit
                    }
                  >
                    {item.title}
                  </span>
                  <SelectType
                    dataType={item}
                    changeValue={changeValue}
                    tream={4}
                    Mokedata={Mokedata}
                    type={type}
                  />
                </div>
              )}
            </Form.Item>
          </Col>
        );
      }
    }
    return (
      <div className={styles.headerCenter}>
        <Row id="headBar">
          {Detail.map((item, index) => {
            return TEXTDETAIL(item, this.changeValue, type, detailValue, index);
          })}
        </Row>
      </div>
    );
  }
}

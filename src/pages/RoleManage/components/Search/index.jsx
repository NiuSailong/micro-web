import React, { Component } from 'react';
import style from './index.less';
import { Button, Select, Input, message } from 'antd';
import PropTypes from 'prop-types';
import HistoryShot from '../HistoryShot';
import MyDrawer from '../MyDrawer';
import { FileTextOutlined } from '@ant-design/icons';

const { Option } = Select;

const selectType = { select: 'select', input: 'input' };
const appListAll = { appId: -1, appName: '全部' };

export default class Header extends Component {
  constructor(props) {
    super(props);
    const { relationAppBodyList = [], selectTypeList = [] } = this.props.data;
    this.state = {
      selectTypeValue: (selectTypeList && selectTypeList[0]) || {},
      selectTypeList: (selectTypeList && selectTypeList) || [],
      relationAppBodyList: [appListAll].concat(relationAppBodyList),
      relationAppBodyValue: appListAll.appId,
      roleInputValue: '',
    };
  }
  _changeSelectType = (e) => {
    this.setState({
      selectTypeValue: this.state.selectTypeList.filter((n) => n.typeId === e)[0],
      roleInputValue: '',
      relationAppBodyValue: appListAll.appId,
    });
  };
  _onSearch = () => {
    const { relationAppBodyValue, roleInputValue, selectTypeValue } = this.state;
    this.props._onSearch({
      keyWord: roleInputValue,
      appCode: relationAppBodyValue === appListAll.appId ? '' : relationAppBodyValue,
      type: selectTypeValue.typeId || '',
    });
  };
  reset = () => {
    this.setState(
      {
        roleInputValue: '',
        relationAppBodyValue: appListAll.appId,
        selectTypeValue: this.props.data.selectTypeList[0] || {},
      },
      () => {
        this.props._onReset();
      },
    );
  };
  showHistory = async () => {
    const hasSave =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'jueSeCaoZuoRiZhiAnNiu')
        .length > 0;
    if (!hasSave) {
      return message.info('请联系管理员获取相关权限');
    }
    const result = await MyDrawer.show({
      title: '操作日志',
      width: 612,
      MyComponent: (props) => <HistoryShot {...props} />,
    });
    if (result?.index === 1) {
    }
    MyDrawer.dismiss();
  };
  render() {
    const {
      selectTypeValue,
      selectTypeList,
      relationAppBodyList,
      relationAppBodyValue,
    } = this.state;
    return (
      <div className={style.searchBox}>
        <div className={style.left}>
          <Select
            value={selectTypeValue.typeId}
            style={{ width: 140, marginRight: 16 }}
            onChange={this._changeSelectType}
          >
            {selectTypeList.map((item, index) => {
              return (
                <Option key={index} value={item.typeId}>
                  {item.typeName}
                </Option>
              );
            })}
          </Select>
          {selectTypeValue.type === selectType.select ? (
            <Select
              value={relationAppBodyValue}
              style={{ width: 280 }}
              onChange={(e) => {
                this.setState({ relationAppBodyValue: e });
              }}
            >
              {relationAppBodyList.map((item, index) => {
                return (
                  <Option key={index} value={item.appId}>
                    {item.appName}
                  </Option>
                );
              })}
            </Select>
          ) : null}
          {selectTypeValue.type === selectType.input ? (
            <Input
              onPressEnter={this._onSearch}
              value={this.state.roleInputValue}
              placeholder="搜索"
              className={style.searchInput}
              onChange={(e) => {
                this.setState({ roleInputValue: e.target.value });
              }}
            />
          ) : null}
        </div>
        <div className={style.right}>
          <Button onClick={this._onSearch} type="primary" className={style.searchBtn}>
            查询
          </Button>
          <Button onClick={this.reset} className={style.searchBtn}>
            重置
          </Button>
          <div className={style.curs} onClick={this.showHistory}>
            <FileTextOutlined style={{ margin: '0 8px 0 4px' }} />
            操作日志
          </div>
        </div>
      </div>
    );
  }
}
Header.propTypes = {
  data: PropTypes.object,
  _onReset: PropTypes.func,
  _onSearch: PropTypes.func,
  buttonPermissions: PropTypes.array,
};

import TBasePage from '#/base/TBasePage';
import React from 'react';
import styles from '#/base/station.less';
import { CaretDownOutlined } from '#/utils/antdIcons';
import { Cascader, Select } from 'antd';
import renovate from '#/utils/renovate';
import { Spin } from 'antd';
import tstyle from '#/base/index.less';
import Empty from '#/components/Empty/index';
import { isDark } from '#/utils/utils';
import { queryDataPower } from '@/services/user';
import { powersDataType } from '#/utils/userHelper';
import { onCheckFeed } from '#/utils/interactive';
import { HttpCode } from '#/utils/contacts';
const { Option } = Select;

function filter(inputValue, path) {
  return path.some((option) => option.label.indexOf(inputValue) > -1);
}
import dark_error_img from '@/assets/img_dark_error.png';
import error_img from '@/assets/img_error.png';
import dark_empty_img from '@/assets/img_dark_emtyp.png';

const filterList = function (array) {
  let list = [];
  array.forEach((item) => {
    let obj = { value: item.value, label: item.lable };
    if (item.children) {
      obj.children = filterList(item.children || []);
    }
    list.push(obj);
  });
  return list;
};

export default class TMainBasePage extends TBasePage {
  _isSpinLoading_ = false;
  constructor(props) {
    super(props);
    this.state.iconD = false;
    this.state.iconR = false;
    this.state.spinLoding = false;
    this.state.stationList = []; //结算单元
    this.state.selectStationList = []; //所选中的结算单元
    this.state.selectStationId = 0; //所选中的结算单元id
    this.state.selectRegionList = []; //所选中的区域
    this.state.dataSourceList = []; //数据线信息
    // this.state.selectDeptList = [];
    this.state.deptList = [];
    this.state.selectDeptId = 0;
    this.state.decomposeStrategyList = []; //策略集数组
    this.state.regionList = []; //区域
    this.state.errorMsg = '';
    this._isSpinLoading_ = false; //判断是否需要请求结算单元 第一次请求所用参数
  }
  componentDidMount() {
    renovate.isRenovate = false;
  }

  async _onGetStation(callBack, menuCode) {
    this.setState({ spinLoding: true });
    let res = await queryDataPower(menuCode);
    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      let powerObj = {};
      Object.keys(powersDataType).forEach((item) => {
        const array = res.powers.filter((n) => n.type === powersDataType[item]);
        if (array.length > 0) {
          powerObj[item] = array[0].json || [];
        }
      });
      if (
        Object.keys(powerObj?.settlement || {}).length > 0 &&
        Object.keys(powerObj?.region || {}).length === 0
      ) {
        powerObj.region = [...powerObj.settlement];
      }
      let obj = {};
      if (powerObj.station && powerObj.station.length > 0) {
        const item = powerObj.station[0];
        obj.selectStationList = [item.value, item.children[0].value];
        obj.selectStationId = item.children[0].value;
      }
      let tDept = powerObj.dept ? powerObj.dept.manageList || [] : [];
      if (tDept.length > 0) {
        const item = tDept[0];
        obj.selectDeptList = [item.deptNum, ''];
        obj.selectDeptId = item.deptId;
      }
      if (powerObj.region && powerObj.region.length > 0) {
        const item = powerObj.region[0];
        obj.selectRegionList = [item.value, item.children[0].value];
      }
      this.setState(
        {
          spinLoding: false,
          errorMsg: '',
          deptList: tDept,
          dataSourceList: powerObj.source,
          decomposeStrategyList: powerObj.strategy,
          stationList: powerObj.station,
          regionList: powerObj.region,
          ...obj,
        },
        () => {
          // jurisdiction.onCheckFeed();
          onCheckFeed();
          callBack && callBack();
        },
      );
    } else {
      this.setState({ spinLoding: false, errorMsg: (res && res.message) || '' });
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }
  _onLoadingRender(isBorder = true, isDack = false) {
    return (
      <div
        className={`${isDark() || isDack ? tstyle.tDarkbasebox : tstyle.tbasebox}`}
        style={{ borderTopWidth: `${isBorder ? 1 : 0}px` }}
      >
        <Spin className={tstyle.spin} />
      </div>
    );
  }
  _onEmptyRender(isBorder = true, isDack = false) {
    let obj = {};
    if (isDark() || isDack) {
      obj.icon = dark_empty_img;
    }
    return <Empty isBorder={isBorder} isDack={isDack} {...obj} />;
  }
  _onErrorRender(message, isBorder = true, isDack = false) {
    let obj = {};
    if (isDark() || isDack) {
      obj.icon = dark_error_img;
    }
    return (
      <Empty
        isBorder={isBorder}
        isDack={isDack}
        icon={error_img}
        {...obj}
        description={message || this.state.errorMsg}
      />
    );
  }

  _onStationRender() {
    const { stationList = [], selectStationList } = this.state;
    const options = filterList(stationList);
    let lastItem = this._onGetStationName(stationList, selectStationList);
    return (
      <div className={styles.header}>
        <div className={styles.main} style={{ marginTop: 0 }}>
          <Cascader
            className={tstyle.header}
            options={options}
            onPopupVisibleChange={() => {
              this.setState({
                iconD: !this.state.iconD,
              });
            }}
            allowClear={false}
            value={selectStationList}
            onChange={(value) => {
              this._onCascaderChange(value, 'station');
            }}
            showSearch={{ filter }}
            suffixIcon={
              <CaretDownOutlined
                className={styles.suffix}
                style={{ transform: this.state.iconD ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            }
            style={{
              width: lastItem.includes('/')
                ? lastItem.length > 8
                  ? lastItem.length * 26
                  : lastItem.length * 30
                : lastItem.length > 3
                ? lastItem.length * 30
                : lastItem.length * 40,
            }}
          />
        </div>
      </div>
    );
  }

  _onRegionRender() {
    const { regionList = [], selectRegionList } = this.state;
    const options = filterList(regionList);
    let lastItem = this._onGetRegionName(regionList, selectRegionList);
    return (
      <div className={styles.header}>
        <div className={styles.main} style={{ marginTop: 0 }}>
          <Cascader
            className={tstyle.header}
            options={options}
            onPopupVisibleChange={() => {
              this.setState({
                iconR: !this.state.iconR,
              });
            }}
            allowClear={false}
            value={selectRegionList}
            onChange={(value) => {
              this._onCascaderChange(value, 'region');
            }}
            showSearch={{ filter }}
            suffixIcon={
              <CaretDownOutlined
                className={styles.suffix}
                style={{ transform: this.state.iconD ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            }
            style={{
              width: lastItem.includes('/')
                ? lastItem.length > 8
                  ? lastItem.length * 26
                  : lastItem.length * 30
                : lastItem.length > 3
                ? lastItem.length * 30
                : lastItem.length * 40,
            }}
          />
        </div>
      </div>
    );
  }

  _onTopologyRender() {
    const { deptList = [] } = this.state;
    // const options = topology_filterList(deptList);
    // let lastItem = this._onTopologyName(deptList, selectDeptList);
    let menuDefault = '';
    if (deptList.length > 0 && deptList[0].deptId) {
      menuDefault = deptList[0].deptId;
    }
    return (
      <div className={styles.header}>
        <div className={styles.main} style={{ marginTop: 0 }}>
          <Select
            defaultValue={menuDefault}
            // style={{ width: 150 }}
            dropdownMatchSelectWidth={false}
            className={styles.head_select_1}
            onChange={(value, option) => {
              this._onCascaderChange(value, 'dept', option?.deptNum || '');
            }}
            key={menuDefault}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            {deptList.map((item) => {
              return (
                <Option value={item.deptId} deptNum={item?.deptNum || ''} key={item.deptId}>
                  {item.deptName}
                </Option>
              );
            })}
          </Select>
        </div>
      </div>
    );
  }

  render() {
    return <div />;
  }
}

// const topology_filterList = function(array) {
//   let list = [];
//   array.forEach(item => {
//     let obj = { value: item.deptNum, label: item.deptName };
//     if (item.children && item.children.length > 0) {
//       obj.children = topology_filterList(item.children || []);
//     }
//     list.push(obj);
//   });
//   return list;
// };

export const LoadingRender = ({ isBorder = true, isDack = false }) => {
  return (
    <div
      className={`${isDark() || isDack ? tstyle.tDarkbasebox : tstyle.tbasebox}`}
      style={{ borderTopWidth: `${isBorder ? 1 : 0}px` }}
    >
      <Spin className={tstyle.spin} />
    </div>
  );
};

export const EmptyRender = ({ isBorder = true, message = '', isDack = false }) => {
  let obj = {};
  if (isDark() || isDack) {
    obj.icon = dark_empty_img;
  }
  return <Empty isBorder={isBorder} isDack={isDack} {...obj} description={message} />;
};

export const ErrorRender = ({ message, isBorder = true, isDack = false }) => {
  let obj = {};
  if (isDark() || isDack) {
    obj.icon = dark_error_img;
  }
  return (
    <Empty isBorder={isBorder} icon={error_img} isDack={isDack} {...obj} description={message} />
  );
};

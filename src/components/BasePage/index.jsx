import React from 'react';
import { Cascader } from 'antd';

import PageLoading from '@/components/PageLoading';
import { getDataPower } from '@/services/power';

import { TRDefault } from '#/components/TRTheme';
import { CaretDownOutlined } from '#/utils/antdIcons';
import { HttpCode } from '#/utils/contacts';

import { showSearch, getFirsValues, formatPowerData } from './helper';
import styles from './index.less';

export default class BasePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      errorMsg: '',
      selected: [], // 已选值
      selectedOptions: [], // 已选选项
      options: [], // 数据权限
      // 场站选择
      dropvis: false,
      minWidth: 0,
    };
    this.menuCode = props.menuCode;
  }

  componentDidMount() {
    this._fetchPowerData();
  }

  async _fetchPowerData() {
    // 获取数据权限
    if (!this.menuCode) return;
    let errorMsg = '',
      options = [];
    const res = await getDataPower(this.menuCode).catch(() => {
      this.setState({
        isLoading: false,
        errorMsg: '系统异常',
      });
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      options = await formatPowerData(res?.powers, this.props?.type);
    } else {
      errorMsg = res?.message || '系统异常';
    }
    this.setState(
      {
        isLoading: false,
        errorMsg,
        options,
      },
      () => {
        if (options.length > 0) {
          const defaultOptions = getFirsValues(options, []);
          const defaultValues = defaultOptions.map((x) => x.value);
          this.onChangeSelect(defaultValues, defaultOptions);
        }
      },
    );
  }

  onChangeSelect(values, selectedOptions) {
    this.cascaderRef?.current?.blur();
    const pickerLabel = selectedOptions.map((x) => x.label).join('/');
    this.setState({
      selected: [...values],
      selectedOptions: [...selectedOptions],
      minWidth: pickerLabel.length * 22 + 11 + 24 + 12,
    });
    this.props?.onChange(values, selectedOptions);
  }

  render() {
    const { isLoading, errorMsg, options } = this.state;
    if (isLoading) return <PageLoading />;
    if (errorMsg) return <TRDefault type={'error'} message={errorMsg} />;
    if (!options.length) return <TRDefault type={'lock'} />;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.box}>
            <Cascader
              ref={(ref) => (this.cascaderRef = ref)}
              className={styles.headerCascader}
              value={this.state.selected}
              options={this.state.options}
              style={{ minWidth: this.state.minWidth }}
              allowClear={false}
              showSearch={{ showSearch }}
              dropdownRender={(menus) => <div className={styles.headerMenus}>{menus}</div>}
              suffixIcon={
                <CaretDownOutlined
                  className={styles.suffixIcon}
                  style={{ transform: this.state.dropvis ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              }
              onPopupVisibleChange={() => this.setState({ dropvis: !this.state.dropvis })}
              onChange={(p1, p2) => this.onChangeSelect(p1, p2)}
            />
          </div>
        </div>
        {this.props?.children}
      </div>
    );
  }
}

import React, { Component } from 'react';
import styles from './index.less';
import { Button, Menu, Dropdown, Table, Empty } from 'antd';
import { BtnList } from '../../helper';
import { connect } from 'dva';

@connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))
export default class index extends Component {
  state = {
    loading: false,
  };

  componentDidMount() {
    let result1 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'yaoQingAnNiu').length > 0; //邀请
    let result2 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'qiYongYongHuAnNiu').length >
      0; //启用
    let result3 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'tingYongYongHuAnNiu')
        .length > 0; //停用
    let result4 =
      this.props.buttonPermissions.filter((item) => item.menuCode === 'zaiCiYaoQingAnNiu').length >
      0; //再次邀请
    if (!result1) {
      BtnList[0].isjurisdiction = false;
    }
    if (!result2) {
      BtnList[1].isjurisdiction = false;
    }
    if (!result3) {
      BtnList[2].isjurisdiction = false;
    }
    if (!result4) {
      BtnList[3].isjurisdiction = false;
    }
  }

  render() {
    const { userInfoBodyList, onOpenAddUser, batchbtn } = this.props;
    const { current, total, size } = this.props.tableMessage;
    const batchList = (
      <Menu>
        {BtnList.map((item, cIndex) => {
          return (
            <Menu.Item key={cIndex}>
              <div
                onClick={() => {
                  batchbtn(item);
                }}
                style={
                  !item.isjurisdiction
                    ? { textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)' }
                    : { textAlign: 'center' }
                }
              >
                {item.name}{' '}
              </div>
            </Menu.Item>
          );
        })}
      </Menu>
    );

    return (
      <div className={styles.tables}>
        <div className={styles.header}>
          {this.props.checkBoxValue.length > 0 ? (
            <div className={styles.navTwo}>
              <div className={styles.userText}>用户列表</div>
              <div className={styles.navright}>
                <div className={styles.textNum}>
                  已选中
                  <span style={{ color: '#1E7CE8' }}>{this.props.checkBoxValue.length || '-'}</span>
                  项
                </div>
                <div className={styles.batch}>
                  <Dropdown overlay={batchList}>
                    <Button className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                      批量操作
                    </Button>
                  </Dropdown>
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    onOpenAddUser();
                  }}
                >
                  新建
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.navone}>
              <div>用户列表</div>
              <Button
                type="primary"
                onClick={() => {
                  onOpenAddUser();
                }}
              >
                新建
              </Button>
            </div>
          )}
        </div>
        {userInfoBodyList && userInfoBodyList.userInfoBodyList.length > 0 ? (
          <Table
            // rowSelection={rowSelection}
            rowSelection={{
              selectedRowKeys: this.props.checkBoxValue,
              onChange: this.props.onCheckBox,
            }}
            columns={this.props.columns}
            loading={this.props.loading}
            rowKey="userId"
            dataSource={userInfoBodyList.userInfoBodyList}
            onChange={(data) => {
              this.props.handelPage(data.current, data.pageSize);
            }}
            locale={{ emptyText: <Empty /> }}
            pagination={{
              size: 'small',
              current,
              pageSize: size,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              onShowSizeChange: () => {},
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        ) : (
          <Empty style={{ marginTop: '80px' }} />
        )}
      </div>
    );
  }
}

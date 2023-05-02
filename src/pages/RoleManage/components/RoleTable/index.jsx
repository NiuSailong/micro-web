import React from 'react';
import style from './index.less';
import { Table, Empty } from 'antd';
import PropTypes from 'prop-types';

// 正序asc，倒序desc
const sortType = { ascend: 'asc', descend: 'desc' };
class RoleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  _onChange = (data, filters, sorter) => {
    let sort = sortType[sorter.order] || 'desc';
    this.props._handelPage(data.current, data.pageSize, sort);
  };
  render() {
    const { current, total, size } = this.props.tableMessage;
    const { tableList } = this.props;
    return (
      <div className={style.roleTable}>
        {tableList && tableList.length ? (
          <Table
            rowKey={'roleId'}
            loading={this.props.loading}
            rowSelection={{
              type: 'checkbox',
              onChange: this.props._onCheckBox,
              selectedRowKeys: this.props.checkBoxValue,
            }}
            columns={this.props.columns}
            dataSource={this.props.tableList}
            locale={{ emptyText: <Empty style={{ color: 'rgba(0, 0, 0, 0.65)' }} /> }}
            onChange={this._onChange}
            pagination={{
              size: 'small',
              current,
              pageSize: size,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        ) : (
          <Empty style={{ marginTop: 80, color: 'rgba(0, 0, 0, 0.65)' }} />
        )}
      </div>
    );
  }
}

RoleTable.propTypes = {
  _handelPage: PropTypes.func,
  tableList: PropTypes.array,
  tableMessage: PropTypes.object,
  loading: PropTypes.bool,
  columns: PropTypes.array,
  _onCheckBox: PropTypes.func,
  checkBoxValue: PropTypes.node,
};
export default RoleTable;

import React, { Component } from 'react';
import { Breadcrumb } from 'antd';

export default class TextTitle extends Component {
  render() {
    const { title } = this.props;
    return (
      <Breadcrumb>
        <Breadcrumb.Item>后台管理</Breadcrumb.Item>
        <Breadcrumb.Item>大群场站规则</Breadcrumb.Item>
        <Breadcrumb.Item>
          {title === 'lookup'
            ? '查看'
            : title === 'edit'
            ? '编辑'
            : title === 'check'
            ? '检查'
            : '新建'}
        </Breadcrumb.Item>
      </Breadcrumb>
    );
  }
}

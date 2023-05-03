import React, { Component } from 'react';
import { Input } from 'antd';

export default class SearchInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
  }
  _onInit = () => {
    this.setState({ searchValue: '' });
  };
  render() {
    return (
      <Input.Search
        placeholder="搜索"
        allowClear
        onSearch={(value) => this.props.search(value)}
        style={{ width: '100%' }}
        value={this.state.searchValue}
        onChange={(e) => this.setState({ searchValue: e.target.value })}
      />
    );
  }
}

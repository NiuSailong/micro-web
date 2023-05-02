import React, { useState } from 'react';
import { Row, Col, Select, Input, Button } from 'antd';
import searchBar from './searchBar.less';
import PropTypes from 'prop-types';

const { Option } = Select;

const SearchBar = (props) => {
  const { option, defaultOption, inputKeyVal, onChangeFC } = props;
  const [searchObj, setSearchObj] = useState(defaultOption);
  const [selectValue, setSelectValue] = useState(option[0].value);
  const [key, setKey] = useState('beanName');
  const changeSelect = (e) => {
    const obj = {};
    obj[e] = '';
    setSelectValue(e);
    setKey(e);
    setSearchObj(obj);
  };
  const onchangeInput = (event) => {
    const obj = { ...searchObj };
    obj[key] = event.target.value;
    obj[inputKeyVal] = event.target.value;
    setSearchObj(obj);
  };
  const onOkPress = () => {
    searchObj.status
      ? searchObj.status === '暂停'
        ? (searchObj.status = 1)
        : (searchObj.status = 0)
      : (searchObj.status = '');
    onChangeFC && onChangeFC(searchObj);
  };
  const onResetPress = () => {
    const obj = { ...searchObj };
    obj[inputKeyVal] = '';
    obj[key] = '';
    delete obj.status;
    setKey('beanName');
    setSelectValue(option[0].value);
    setSearchObj(obj);
    onChangeFC && onChangeFC(obj);
  };
  return (
    <Row id="searchBar" className={searchBar.container} align={'middle'}>
      <Col>
        <Select
          className={searchBar.select}
          value={selectValue}
          style={{ width: 120 }}
          onChange={changeSelect}
        >
          {option.map((item) => {
            return (
              <Option key={item.value} value={item.value}>
                {item.title}
              </Option>
            );
          })}
        </Select>
      </Col>
      <Col flex="280px">
        <Input.Search
          value={searchObj[inputKeyVal]}
          placeholder="输入关键字"
          onSearch={onOkPress}
          onChange={onchangeInput}
        />
      </Col>
      <Col flex="1" />
      <Col>
        <Button
          style={{ background: '#1E7CE8', marginRight: 16 }}
          type="primary"
          onClick={onOkPress}
        >
          查询
        </Button>
      </Col>
      <Col>
        <Button onClick={onResetPress}>重置</Button>
      </Col>
    </Row>
  );
};

SearchBar.defaultProps = {
  option: [],
  defaultOption: {},
  selectKeyId: 'value',
  selectSelectKey: 'dictionaryValue',
  selectKeyVal: 'description',
  inputKeyVal: 'keyWord',
  onChangeFC: () => {},
};

SearchBar.propTypes = {
  option: PropTypes.array,
  defaultOption: PropTypes.object,
  selectKeyId: PropTypes.string,
  selectSelectKey: PropTypes.string,
  selectKeyVal: PropTypes.string,
  inputKeyVal: PropTypes.string,
  onChangeFC: PropTypes.func,
};
export default SearchBar;

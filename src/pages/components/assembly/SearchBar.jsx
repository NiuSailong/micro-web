import React, { useState } from 'react';
import { Row, Col, Select, Input, Button } from 'antd';
import searchBar from './searchBar.less';

const SearchBar = (props) => {
  const {
    option,
    defaultOption,
    selectKeyId,
    selectKeyVal,
    selectSelectKey,
    inputKeyVal,
    onChangeFC,
  } = props;
  const [searchObj, setSearchObj] = useState(defaultOption);
  const changeSelect = (e) => {
    let obj = {};
    obj[selectSelectKey] = e;
    setSearchObj(obj);
  };
  const onchangeInput = (event) => {
    let obj = { ...searchObj };
    obj[inputKeyVal] = event.target.value;
    setSearchObj(obj);
  };
  const onOkPress = () => {
    onChangeFC && onChangeFC(searchObj);
  };
  const onResetPress = () => {
    let obj = {};
    obj[selectSelectKey] = option.length > 0 ? option[0].value : '';
    obj[inputKeyVal] = '';
    setSearchObj(obj);
    onChangeFC && onChangeFC(obj);
  };
  return (
    <Row id="searchBar" getPopupContainer className={searchBar.container} align={'middle'}>
      <Col>
        <Select
          value={searchObj[selectSelectKey]}
          getPopupContainer={() => document.getElementById('searchBar')}
          className={searchBar.select}
          onChange={changeSelect}
        >
          {option.map((item) => {
            return (
              <Select.Option key={item[selectKeyId]} value={item[selectKeyId]}>
                {item[selectKeyVal]}
              </Select.Option>
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

export default SearchBar;

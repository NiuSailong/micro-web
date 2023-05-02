import React, { useState, useEffect } from 'react';
import { getRequestByFormId } from '#/services/formService';
import { HttpCode } from '#/utils/contacts';
import { message, Cascader } from 'antd';

function CascaderProCity({ onChange, value }) {
  const [options, setOptions] = useState([]);

  const getOptions = async () => {
    try {
      const res = await getRequestByFormId('/power/china/findChina', {}, 'GET');
      if (res && res.statusCode === HttpCode.SUCCESS) {
        setOptions(res.list);
        localStorage.setItem('cascader', JSON.stringify(res.list));
      } else {
        message.error(res.message || '查询省市区级联数据失败');
      }
    } catch (error) {}
  };

  useEffect(() => {
    // 取值本地  本地存在则不用请求
    const cascaderData = localStorage.getItem('cascader');
    if (cascaderData) {
      setOptions(JSON.parse(cascaderData));
      return;
    }
    getOptions();
  }, []);

  return (
    <Cascader
      options={options}
      fieldNames={{ label: 'name', value: 'name', children: 'list' }}
      changeOnSelect
      onChange={onChange}
      value={value}
      style={{ width: '100%' }}
    />
  );
}

export default CascaderProCity;

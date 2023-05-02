import { useState } from 'react';
import { Input } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '#/utils/antdIcons';
import styles from '../../index.less';
import _ from 'lodash';

const SearchRoles = ({ onChange, trFlatList, relKey = 'menuId', searchKey = 'menuName' }) => {
  const [searchIndex, setSearchIndex] = useState(0);
  const [searchArray, setSearchArray] = useState([]);

  const onChangeSearch = (inputKey = '') => {
    if (trFlatList.length > 0 && inputKey.length > 0) {
      const arr = _.filter(trFlatList, function (n) {
        return _.includes(n[searchKey], inputKey);
      });
      if (arr.length > 0) {
        onChange && onChange(arr[0]?.[relKey] || '0');
      }
      setSearchArray(arr);
      setSearchIndex(0);
    } else {
      onChange && onChange('');
      setSearchArray([]);
      setSearchIndex(0);
    }
  };
  const onUpOrDown = (isDown) => {
    if (searchArray.length > 0) {
      let nexIndex = isDown ? searchIndex + 1 : searchIndex - 1;
      nexIndex = Math.min(Math.max(0, nexIndex), searchArray.length - 1);
      setSearchIndex(nexIndex);
      onChange && onChange(searchArray[nexIndex]?.[relKey] || '0');
    }
  };

  return (
    <div className={styles.search}>
      <Input.Search
        onSearch={(e) => {
          onChangeSearch(e);
        }}
      />
      <div className={styles.search_tip}>{`${searchArray.length > 0 ? searchIndex + 1 : 0}/${
        searchArray.length
      }`}</div>
      <ArrowDownOutlined
        className={styles.search_button}
        onClick={() => {
          onUpOrDown(true);
        }}
      />
      <ArrowUpOutlined
        className={styles.search_button}
        onClick={() => {
          onUpOrDown(false);
        }}
      />
    </div>
  );
};

export default SearchRoles;

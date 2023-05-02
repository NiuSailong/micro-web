import { useCallback } from 'react';
import { useMap, CHANGE_ALL } from './use-map';

export const useChecked = (dataSource, option) => {
  const { map: checkedMap, onMapValueChange, dispatch } = useMap(dataSource, option);
  const { key = 'id' } = option;

  const sort_unix_time = (a, b) => {
    return a.unix_time - b.unix_time;
  };

  const filterChecked = useCallback(
    (func) => {
      const checkedDataSource = dataSource
        .filter((item) => Boolean(checkedMap[item[key]]))
        .sort(sort_unix_time);

      return func ? checkedDataSource.filter(func) : checkedDataSource;
    },

    [checkedMap, dataSource, key],
  );

  const onCheckedChange = useCallback(
    (dataItem, checked) => {
      onMapValueChange(dataItem, checked);
    },
    [onMapValueChange],
  );

  const checkedAll = dataSource.length !== 0 && filterChecked().length === dataSource.length;

  const onCheckedAllChange = (newCheckedAll) => {
    const payload = !!newCheckedAll;
    dispatch({
      type: CHANGE_ALL,
      payload,
    });
  };

  return {
    checkedMap,
    dispatch,
    onCheckedChange,
    filterChecked,
    onCheckedAllChange,
    checkedAll,
  };
};

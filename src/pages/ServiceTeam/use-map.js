import { useReducer, useEffect, useCallback } from 'react';

export const CHANGE = 'CHANGE';
export const CHANGE_ALL = 'CHANGE_ALL';
export const SET_MAP = 'SET_MAP';

export const useMap = (dataSource, { key = 'id' } = {}) => {
  const [map, dispatch] = useReducer((checkedMapParams, action) => {
    switch (action.type) {
      case CHANGE: {
        const { payload } = action;
        const { dataItem, value } = payload;
        const { [key]: id } = dataItem;

        return {
          ...checkedMapParams,
          [id]: value,
          [`${id}_unix_time`]: new Date().getTime(),
        };
      }
      case CHANGE_ALL: {
        const { payload } = action;
        const newMap = {};
        dataSource.forEach((dataItem) => {
          newMap[dataItem[key]] = payload;
          newMap[`${dataItem[key]}_unix_time`] = new Date().getTime();
        });
        return { ...checkedMapParams, ...newMap };
      }
      case SET_MAP: {
        return action.payload;
      }
      default:
        return checkedMapParams;
    }
  }, {});

  const onMapValueChange = useCallback((dataItem, value) => {
    dispatch({
      type: CHANGE,
      payload: {
        dataItem,
        value,
      },
    });
  }, []);

  useEffect(() => {
    //根据dataSource同步map
    dataSource.forEach((checkedItem) => {
      let changed = false;
      if (
        checkedItem[key] in map &&
        !dataSource.find((dataItem) => checkedItem[key] === dataItem[key])
      ) {
        delete map[checkedItem[key]];
        changed = true;
      }
      if (changed) {
        dispatch({
          type: SET_MAP,
          payload: Object.assign({}, map),
        });
      }
    });
  }, [dataSource]);

  return {
    map,
    dispatch,
    onMapValueChange,
  };
};

/* eslint-disable */
import React from 'react';
import emitter from '#/utils/events';
import { connect, connectMaster, history, Navigate, Outlet } from 'umi';
import { isTRSingle, isMain } from '#/utils/utils';
import { getPersonInfoByToken, queryMenus } from '#/services/user';
import PageLoading from '#/components/PageLoading';
import { HttpCode } from '#/utils/contacts';
import Empty from '#/components/Empty';
import { abortController } from '#/utils/requestAbort';

const BasicLayout = ({ globalData, onHandle, dispatch, global }) => {
  if (!isMain() && !isTRSingle()) return <Empty isBorder={false} />;
  const [isDev, setDev] = React.useState(() => {
    if (isMain()) return false;
    return isTRSingle() && global?.configure?.token?.length > 0;
  });
  React.useEffect(() => {
    if (isTRSingle() && global?.configure?.token === undefined) {
      setDev(false);
    }
  }, [global.configure]);
  React.useEffect(() => {
    if (isDev && Object.keys(global?.configure?.currentUser || {}).length === 0) {
      getCurrentUser();
    }
  }, []);
  const getCurrentUser = async () => {
    const [res2, res] = await Promise.all([queryMenus(), getPersonInfoByToken()]);
    if (res2?.statusCode === HttpCode.SUCCESS && res?.statusCode === HttpCode.SUCCESS) {
      const { userMenus = [] } = res2;
      const permissionsList = flatArr(userMenus);
      dispatch({
        type: 'global/onSaveGlobalData',
        payload: {
          ...(global?.configure || {}),
          menuCode: 'configure', //方便调试进行更改
          currentUser: res?.dataPersonBody,
          buttonPermissions: permissionsList,
        },
        successCallback: () => {
          setDev(false);
          history.push(history.location.pathname);
        },
      });
    } else {
      dispatch({
        type: 'global/onSaveGlobalData',
        payload: {},
        successCallback: () => {
          setDev(false);
        },
      });
    }
  };
  const onSignal = (e) => {
    if (e.type === 'onChangeGlobalData') {
      dispatch({
        type: 'global/onSaveGlobalData',
        payload: e.data,
      });
    }
  };
  const onInteractive = (e) => {
    onHandle && onHandle(e);
  };
  React.useEffect(() => {
    abortController.destroy();
    abortController.onInit();
    emitter.addListener('onSignal', onSignal);
    emitter.addListener('onInteractive', onInteractive);
    if (globalData) {
      onSignal({ type: 'onChangeGlobalData', data: { ...globalData } });
    }
    return () => {
      abortController.clear();
      abortController.destroy();
      emitter.removeListener('onSignal', onSignal);
      emitter.removeListener('onInteractive', onInteractive);
    };
  }, []);
  if (isDev) {
    return <PageLoading />;
  }
  if (!isMain() && isTRSingle() && global?.configure?.token === undefined) {
    return <Navigate to={`/user/login`} />;
  }
  if (!global?.configure?.token) {
    return <PageLoading />;
  }
  return <React.Fragment>
    <Outlet />
  </React.Fragment>;
};
export default connect(({ global }) => ({
  global,
}))(connectMaster(BasicLayout));

const flatArr = function (arr) {
  let rootarr = [];
  arr.forEach((item) => {
    if (item.root) {
      rootarr.push(item.root);
    }
    if (item.children) {
      rootarr = rootarr.concat(flatArr(item.children));
    }
  });
  return rootarr;
};

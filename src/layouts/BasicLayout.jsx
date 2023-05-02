import React, { useEffect } from 'react';
import emitter from '#/utils/events';
import { connect, connectMaster } from 'dva';
import { Navigate, history } from 'umi';
import { isTRSingle, isMain } from '#/utils/utils';
import { getPersonInfoByToken, queryMenus } from '#/services/user';
import PageLoading from '#/components/PageLoading';
import TRNotification from '#/utils/notification';
import { HttpCode } from '#/utils/contacts';
import Empty from '#/components/Empty';
import { abortController } from '#/utils/requestAbort';

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

const BasicLayout = ({ globalData, onHandle, children, dispatch, global, location }) => {
  if (!isMain() && !isTRSingle()) return <Empty isBorder={false} />;
  const [isDev, setDev] = React.useState(() => {
    if (isMain()) return false;
    return isTRSingle() && global?.configure?.token?.length > 0;
  });
  useEffect(() => {
    if (isTRSingle() && global?.configure?.token === undefined) {
      setDev(false);
    }
  }, [global.configure]);

  const getCurrentUser = async () => {
    const [res2, res] = await Promise.all([queryMenus(), getPersonInfoByToken()]);
    if (res2?.statusCode === HttpCode.SUCCESS && res?.statusCode === HttpCode.SUCCESS) {
      const { userMenus = [], displayMenus = [] } = res2;
      const permissionsList = flatArr(userMenus);
      dispatch({
        type: 'global/onSaveGlobalData',
        payload: {
          ...(global?.configure || {}),
          menuCode: globalData?.menuCode || '',
          routeList: flatArr(displayMenus),
          currentUser: res?.dataPersonBody,
          buttonPermissions: permissionsList,
          buttonFlatPermissions: permissionsList.map((v) => v.menuCode),
          location: location,
        },
        successCallback: () => {
          setDev(false);
          history.push('dashboard');
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

  useEffect(() => {
    if (isDev && Object.keys(global?.configure?.currentUser || {}).length === 0) {
      getCurrentUser();
    }
  }, []);
  const onSignal = (e) => {
    if (e.type === 'onChangeGlobalData') {
      const permissionsList = e.data?.buttonPermissions ?? [];
      dispatch({
        type: 'global/onSaveGlobalData',
        payload: {
          ...(e.data || {}),
          buttonFlatPermissions: permissionsList.map((v) => v.menuCode),
          location: location,
        },
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
      TRNotification.clear();
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
  return <React.Fragment>{children}</React.Fragment>;
};
export default connect(({ global }) => ({
  global,
}))(connectMaster(BasicLayout));

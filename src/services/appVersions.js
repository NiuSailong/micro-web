import request from '#/utils/requestAbort';
// 获取App版本列表
export async function getAppVersions(params) {
  const data = { currentPage: params.current, ...params };
  return request('/user/systemVersion/findSystemVersionPageList', {
    method: 'POST',
    data,
  });
}

// 添加App版本数据
export async function addAppVersions(data) {
  return request('/user/systemVersion/addSystemVersion', {
    method: 'POST',
    data,
  });
}

// 编辑App版本数据
export async function updateAppVersions(data) {
  return request('/user/systemVersion/updateSystemVersion', {
    method: 'POST',
    data,
  });
}
/**
 * 删除服务团队记录
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteServiceTeamBitch(params = {}) {
  return request('/power/serviceTeamManage/deleteServiceTeamBitch', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取首页搜索列表条件
 * @param params
 * @returns {Promise<void>}
 */
export async function getSearchConfigure() {
  return request(`/dictionary/dictionaryValue/getListByCode/service_team_search`);
}

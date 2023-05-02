import request from '#/utils/requestAbort';

//获取公告状态
export async function noticeStateList(code) {
  return request(`/dictionary/dictionaryValue/getListByCode/${code}`);
}
/**
 * 获取首页搜索列表条件
 * @param params
 * @returns {Promise<void>}
 */
export async function getSearchConfigure() {
  return await noticeStateList('service_team_search');
}

/* 获取风光侠列表数据 */
export async function getServiceTeamList(params) {
  return request('/power/serviceTeamManage/listSceneryMans', {
    method: 'POST',
    data: params,
  });
}

/**
 * 服务团队新增-服务范围查找
 * @param params
 * @returns {Promise<void>}
 */
export async function listServiceTeamDepts() {
  return request('/power/serviceTeamManage/listServiceTeamDepts');
}

/**
 * 服务团队添加成员-成员列表
 * @param params
 * @returns {Promise<void>}
 */
export async function getListAllUsers(params) {
  return request(`/power/serviceTeamManage/listAllUsers`, {
    method: 'POST',
    data: params,
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
 * 导出服务团队记录
 */

export async function exportServiceTeams(params = {}) {
  return request('/power/serviceTeamManage/exportServiceTeams', {
    method: 'POST',
    data: params,
    responseType: 'blob',
    getResponse: true,
  });
}
//大群服务团队导入
export async function importSceneryManUsers(params = {}) {
  return request('/power/serviceTeamManage/importSceneryManUsers', {
    method: 'POST',
    data: params,
  });
}

//新增服务团队
export async function addServiceTeam(params) {
  return request('/power/serviceTeamManage/addServiceTeam', {
    method: 'POST',
    data: params,
  });
}

//更新服务团队
export async function UpdateServiceTeam(params) {
  return request('/power/serviceTeamManage/UpdateServiceTeam', {
    method: 'POST',
    data: params,
  });
}

//服务团队一条记录的详情

export async function getServiceTeamDetail(serviceTeamId) {
  return request(`/power/serviceTeamManage/getServiceTeamDetail/${serviceTeamId}`);
}

//删除服务团队中的风光侠
export async function deleteSceneManById(params) {
  return request(`/power/serviceTeamManage/deleteSceneManById`, {
    method: 'POST',
    data: params,
  });
}

//检查用户工作状态
export async function checkUserWorkStatus(params) {
  return request(`/power/serviceTeamManage/checkUserWorkStatus`, {
    method: 'POST',
    data: params,
  });
}

//检查风光侠是否可以从服务团队删除;
export async function checkdDeleteUser(params) {
  return request(`/power/serviceTeamManage/checkdDeleteUser`, {
    method: 'POST',
    data: params,
  });
}

//检查团队编码是否重复
export async function checkTeamCode(params) {
  return request(`/power/serviceTeamManage/checkTeamCode`, {
    method: 'POST',
    data: params,
  });
}

//检查服务范围是否可以删除
export async function checkDeleteServiceTeamDept(params) {
  return request(`/power/serviceTeamManage/checkDeleteServiceTeamDept`, {
    method: 'POST',
    data: params,
  });
}

//导出所有服务团队
export async function exportAllServiceTeams() {
  return request(`/power/serviceTeamManage/exportAllServiceTeams`, {
    responseType: 'blob',
    getResponse: true,
  });
}

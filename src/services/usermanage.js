import request from '#/utils/requestAbort';

export async function queryStatus(params) {
  return request('/user/user/getUserStatus', {
    method: 'GET',
    data: params,
  });
}
export async function queryuserList(params) {
  return request('/user/user/getUserInfoList', {
    method: 'POST',
    data: params,
  });
}
export async function queryChangeStatus(params) {
  return request('/user/user/batchUpdateUserInfo', {
    method: 'POST',
    data: params,
  });
}
export async function queryAddUser(params) {
  return request('/user/user/addUserInfo', {
    method: 'POST',
    data: params,
  });
}
export async function queryRoleData(params) {
  return request('/power/role/getPartRoleByUserId', {
    method: 'POST',
    data: params,
  });
}

export async function queryChangeUser(params) {
  return request('/user/user/updateUserInfo', {
    method: 'POST',
    data: params,
  });
}
export async function queryInfoById(params) {
  return request('/user/user/getUserInfoById/' + params, {
    method: 'GET',
  });
}

export async function getMenusByUserId(params) {
  return request(`/power/menu/queryMenus/${params.userId}`, {
    method: 'GET',
  });
}

export async function getDataPowerByRoleIdList(params) {
  return request('/power/dataPower/getDataPowerByRoleIdList', {
    method: 'POST',
    data: params,
  });
}

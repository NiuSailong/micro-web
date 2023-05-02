import request from '#/utils/requestAbort';

export async function updateFeed(params) {
  //验证码认证
  return request('/user/feedback/updateFeedback', {
    method: 'POST',
    data: params,
  });
}

export async function queryAllUser() {
  return request('/power/position/all/user');
}

//获取公司下所有角色用户信息
export async function getUserRolePerson() {
  return request('/power/role/all/person', {
    method: 'POST',
  });
}

export async function queryDataPower(params) {
  return request(`/power/dataPower/common/${params}`);
}

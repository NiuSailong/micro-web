import request from '#/utils/requestAbort';
// 获取外部token列表
export async function getExernarToken(data) {
  return request('/power/token/getTokenWhiteList', {
    method: 'POST',
    data,
  });
}

// 编辑token白名单
export async function setExernarToken(data) {
  return request('/power/token/updateTokenWhitList', {
    method: 'POST',
    data,
  });
}

// 删除token白名单
export async function delExernarToken(data) {
  return request(`/power/token/updateTokenWhitList${data}`, {
    method: 'POST',
    data,
  });
}

// 添加token白名单
export async function addExernarToken(data) {
  return request('/power/token/addTokenWhitList', {
    method: 'POST',
    data,
  });
}

// 重置token
export async function resetToken(data) {
  return request(`/power/cache/reCache/${data}`, {
    method: 'GET',
  });
}

export async function resetstok(option) {
  return request(`/power/whiteList/cache/push`, {
    headers: option,
    method: 'POST',
  });
}

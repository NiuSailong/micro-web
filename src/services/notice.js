import request from '#/utils/requestAbort';
//获取公告状态
export async function noticeStateList(code) {
  return request(`/dictionary/dictionaryValue/getListByCode/${code}`);
}
//获取全部数据
export async function noticeList(params) {
  return request('/message/notice/web/list', {
    method: 'POST',
    data: params,
  });
}

//获取全部数据
export async function getUserDept() {
  return request('/power/dept/all/list');
}

//获取公司下所有角色信息
export async function getUserRole() {
  return request('/power/role/all/companyNum', {
    method: 'POST',
  });
}

//创建公告
export async function createNotice(params) {
  return request('/message/notice/create', {
    method: 'POST',
    requestType: 'form',
    data: params,
  });
}

//编辑公告
export async function updateNotice(params) {
  return request('/message/notice/update', {
    method: 'POST',
    requestType: 'form',
    data: params,
  });
}
//根据期获取设备
export async function getDevice(params) {
  return request('/ledger/asset/list/' + params);
}
//根据场站获取设备
export async function getDeviceSite(params) {
  return request('/ledger/asset/site/list/' + params);
}

//WEB端公告详情
export async function getNoticeWebInfo(params) {
  return request('/message/notice/web/info', {
    method: 'POST',
    data: params,
  });
}

// 删除未发布的公告
export async function removeNotice(params) {
  return request('/message/notice/remove', {
    method: 'POST',
    data: params,
  });
}

// 撤销公告
export async function revokeNotice(params) {
  return request('/message/notice/revoke', {
    method: 'POST',
    data: params,
  });
}

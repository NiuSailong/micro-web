import request from '#/utils/requestAbort';

// 查询接口
export async function searchList(params) {
  return request('/power/company/list', {
    method: 'POST',
    data: params,
  });
}

// 删除接口
export async function deleteList(params) {
  return request('/power/t-applylist/delete', {
    method: 'POST',
    data: params,
  });
}

// 编辑
export async function updateList(params) {
  return request('/power/t-applylist/update', {
    method: 'POST',
    data: params,
  });
}

// 新增
export async function addList(params) {
  return request('/power/t-applylist/add', {
    method: 'POST',
    data: params,
  });
}

// 查询所有平台应用和菜单
export async function findAllAppAndMenu() {
  return request('/power/company/allApplicationAndMenu', {
    method: 'GET',
  });
}
// 新建/编辑租户
export async function addOrUpdateTen(params) {
  return request('/power/company/addOrUpdate', {
    method: 'POST',
    data: params,
  });
}
// 租户明细
export async function findDeailByCompanyNum(params) {
  return request(`/power/company/companyDetail?companyNum=${params}`, {
    method: 'GET',
  });
}

// 保存logo图片
export async function saveLogTen(params) {
  return request(`/power/company/saveLogo?companyNum=${params.get('companyNum')}`, {
    method: 'POST',
    data: params,
  });
}

// 查询logoId
export async function getLogoByCompanyNum(params) {
  return request(`/power/company/getLogo?companyNum=${params}`, {
    method: 'GET',
  });
}

/**
 * 查询logo图片Id
 * @returns
 */
export async function downLoadFiles(data) {
  return request(`/annex/annex/downLoadFiles`, {
    method: 'post',
    data,
    responseType: 'blob',
    headers: {
      Accept: 'text/html, application/xhtml+xml, */*',
    },
  });
}

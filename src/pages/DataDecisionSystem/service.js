import request from '#/utils/requestAbort';

// 获取报表信息
export async function getTableList(params) {
  return request('/purchaseinfo/fanruan-table/getDataDecisionSystemMenuInfo', {
    method: 'POST',
    data: params,
  });
}
// 编辑报表信息
export async function editInfo(params) {
  return request('/purchaseinfo/fanruan-table/edit', {
    method: 'POST',
    data: params,
  });
}

// 新增信息
export async function addInfo(params) {
  return request('/purchaseinfo/fanruan-table/save', {
    method: 'POST',
    data: params,
  });
}

// 删除信息
export async function deleteInfo(id) {
  return request(`/purchaseinfo/fanruan-table/delete/${id}`, {
    method: 'GET',
  });
}

import request from '#/utils/requestAbort';

//获取全部数据
export async function getDataList(params) {
  return request('/bff-eam/measures/getMeasuresList', {
    method: 'POST',
    data: params,
  });
}

//新增或更新数据
export async function createOne(params) {
  return request('/bff-eam/measures/addOrUpdateMeasures', {
    method: 'POST',
    data: params,
  });
}

//删除数据
export async function deletData(params) {
  return request('/bff-eam/measures/deleteMeasures', {
    method: 'POST',
    data: params,
  });
}
//详情
export async function findOneByid(params) {
  return request('/bff-eam/measures/findOneMeasures', {
    method: 'POST',
    data: params,
  });
}

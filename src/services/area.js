import request from '#/utils/requestAbort';

/*---------------获取所有省---------------*/
export async function SelectProvincePage(data) {
  return request('/power/china/SelectProvincePage', {
    method: 'POST',
    data,
  });
}
//添加省级下的数据
export async function addProvince(data) {
  return request('/power/china/addProvince', {
    method: 'post',
    data,
  });
}
//修改省级下的数据
export function updateProvince(data) {
  return request('/power/china/updateProvince', {
    method: 'POST',
    data,
  });
}
//删除省级下的数据
export function deleteProvince(data) {
  return request('/power/china/deleteProvince', {
    method: 'POST',
    data,
  });
}

/*-------------查询省下的市--------------*/
export function SelectCityPage(data) {
  return request('/power/china/SelectCityPage', {
    method: 'POST',
    data,
  });
}
//添加市级的数据
export function addCity(data) {
  return request('/power/china/addCity', {
    method: 'POST',
    data,
  });
}
//修改市级数据
export function updateCity(data) {
  return request('/power/china/updateCity', {
    method: 'POST',
    data,
  });
}
//删除市级数据
export function deleteCity(data) {
  return request('/power/china/deleteCity', {
    method: 'POST',
    data,
  });
}

/*---------查询市下的县区-------------*/
export function SelectAreaPage(data) {
  return request('/power/china/SelectAreaPage', {
    method: 'POST',
    data,
  });
}
//添加县区的数据
export function addArea(data) {
  return request('/power/china/addArea', {
    method: 'POST',
    data,
  });
}
//修改县区数据
export function updateArea(data) {
  return request('/power/china/updateArea', {
    method: 'POST',
    data,
  });
}
//删除县区数据
export function deleteArea(data) {
  return request('/power/china/deleteArea', {
    method: 'POST',
    data,
  });
}

/***********----------------区域的接口------------------*************/
//查询区域
export function findRegionPage(data) {
  return request('/power/region/findRegionPage', {
    method: 'POST',
    data,
  });
}
//新增区域
export function addRegion(data) {
  return request('/power/region/addRegion', {
    method: 'POST',
    data,
  });
}
//更新区域
export function updateRegion(data) {
  return request('/power/region/updateRegion', {
    method: 'POST',
    data,
  });
}
//删除区域
export function deleteRegion(data) {
  return request('/power/region/deleteRegion', {
    method: 'POST',
    data,
  });
}

/***********----------------策略的接口------------------*************/
//策略table表格查询
export function SelectDecomposeStrategyPage(data) {
  return request('/power/decompose/selectDecomposeStrategyPage', {
    method: 'POST',
    data,
  });
}
//添加策略
export function addDecomposeStrategy(data) {
  return request('/power/decompose/addDecomposeStrategy', {
    method: 'POST',
    data,
  });
}
//更新策略
export function updateDecomposeStrategy(data) {
  return request('/power/decompose/updateDecomposeStrategy', {
    method: 'POST',
    data,
  });
}
//删除策略
export function deleteDecomposeStrategy(data) {
  return request('/power/decompose/deleteDecomposeStrategy', {
    method: 'POST',
    data,
  });
}

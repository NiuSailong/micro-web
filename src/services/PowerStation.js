import request from '#/utils/requestAbort';

// 结算单元字典值
export async function selectCheck() {
  return request('/forecast/dimStation/selectCheck', {
    method: 'GET',
  });
}

/*********** 数据源管理 ***********/
// 标签字典值
export async function getDictionaryValue() {
  return request('/dictionary/dictionaryValue/getDictionaryByCode/ACCESS_TYPE', {
    method: 'GET',
  });
}
// 数据源管理 列表查询
export async function DataSourceManageSelect(params) {
  return request('/power/dataSource/select', {
    method: 'POST',
    data: params,
  });
}
// 数据源新增或修改[修改包含子项删除]
export async function DataSourceManageEdit(params) {
  return request('/power/dataSource/edit', {
    method: 'POST',
    data: params,
  });
}
// 数据源新增或修改[修改包含子项删除]
// export async function DataSourceManagedelete(dsId) {
//   return request(`/power/dataSource/delete?dsId=${dsId}`, {
//     method: 'GET',
//   });
// }
/*********** 抓取配置 ***********/
// 抓取配置 列表查询
export async function QueryConfigSelect(params) {
  return request('/forecast/queryConfig/select', {
    method: 'POST',
    data: params,
  });
}
// 数据源新增或修改[修改包含子项删除]
export async function QueryConfigeEdit(params) {
  return request('/forecast/queryConfig/edit', {
    method: 'POST',
    data: params,
  });
}
/*********** 下发配置 ***********/
// 下发配置 列表查询
export async function ShortTermIssueSelect(params) {
  return request('/forecast/shortTermIssue/select', {
    method: 'POST',
    data: params,
  });
}
// 下发配置 获取场站下发配置
export async function ShortTermIssueGetMapper(id) {
  return request(`/forecast/shortTermIssue/getMapper?id=${id}`, {
    method: 'GET',
  });
}
// 数据源新增或修改[修改包含子项删除]
export async function ShortTermIssueEdit(params) {
  return request('/forecast/shortTermIssue/edit', {
    method: 'POST',
    data: params,
  });
}
// 场站下发配置删除
export async function ShortTermIssueDelete(wfId) {
  return request(`/forecast/shortTermIssue/delete?wfId=${wfId}`, {
    method: 'GET',
  });
}
/*********** FTP地址 ***********/
// FTP地址查询
export async function shortForecastFtpSelect(params) {
  return request('/forecast/shortForecastFtp/select', {
    method: 'POST',
    data: params,
  });
}
// FTP地址配置新增或修改
export async function shortForecastFtpEdit(params) {
  return request('/forecast/shortForecastFtp/edit', {
    method: 'POST',
    data: params,
  });
}
// FTP地址配置删除
export async function shortForecastFtpDelte(id) {
  return request(`/forecast/shortForecastFtp/delete?id=${id}`, {
    method: 'GET',
  });
}

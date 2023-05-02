import request from '#/utils/requestAbort';

//获取人员信息
export function SelectUserPartList() {
  return request('/user/user/SelectUserPartList', {
    method: 'GET',
  });
}

//获取行为列表
export function queryLogMenu(params) {
  return request('/log/LogResources/queryLogMenu', {
    method: 'POST',
    data: params,
  });
}

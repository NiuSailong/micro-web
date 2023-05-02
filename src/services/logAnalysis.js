import request from '#/utils/requestAbort';

// 根据UserId和时间段查询操作日志
export async function queryOperationLogByUserIdAndTime(parmas) {
  return request('/log/operationLog/queryOperationLogByUserIdAndTime', {
    method: 'POST',
    data: parmas,
  });
}

// 根据时间段查询操作日志数量
export async function queryOperationLogNumByAndTime(params) {
  return request('/log/operationLog/queryOperationLogNumByAndTime', {
    method: 'POST',
    data: params,
  });
}

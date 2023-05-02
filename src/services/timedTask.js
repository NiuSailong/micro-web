import request from '#/utils/requestAbort';

// 查看定时任务
export async function jobList(params) {
  return request('/job/job/jobList', {
    method: 'POST',
    data: params,
  });
}

// 查看定时任务日志
export async function logList(params) {
  return request('/job/jobLog/logList', {
    method: 'POST',
    data: params,
  });
}

// 更新定时任务
export async function updateJob(params) {
  return request('/job/job/updateJob', {
    method: 'POST',
    data: params,
  });
}

// 暂停定时任务
export async function pauseJob(params) {
  return request(`/job/job/pause/${params}`, {
    method: 'GET',
  });
}

// 恢复定时任务
export async function resumeJob(params) {
  return request(`/job/job/resume/${params}`, {
    method: 'GET',
  });
}

// 检查cron表达式
export async function cronCheck(params) {
  return request('/job/job/cron/check', {
    method: 'POST',
    data: params,
  });
}

// 增加定时任务
export async function addJob(params) {
  return request('/job/job/addJob', {
    method: 'POST',
    data: params,
  });
}

// 删除定时任务
export async function deleteJob(params) {
  return request(`/job/job/delete/${params}`, {
    method: 'GET',
  });
}

// 删除定时任务日志
export async function deleteLog(params) {
  return request(`/job/jobLog/delete/${params}`, {
    method: 'GET',
  });
}

// 手动执行定时任务
export async function runJob(params) {
  return request(`/job/job/run/${params}`, {
    method: 'GET',
  });
}

// 下拉菜单请求
export async function searchTask() {
  return request('/dictionary/dictionaryValue/getDictionaryByCode/TIMED_TASK', {
    method: 'GET',
  });
}

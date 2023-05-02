import request from '#/utils/requestAbort';

/* 分页查询 */
export async function canalConfigList(current) {
  return request('/binlog-sync-es/canal-config/list?current=' + current, {
    method: 'GET',
  });
}

/* 删除canal实例 */
export async function canalConfigDelete(id) {
  return request('/binlog-sync-es/canal-config/' + id, {
    method: 'DELETE',
  });
}

/*  新增canal实例*/
export async function canalConfigAdd(params) {
  return request('/binlog-sync-es/canal-config', {
    method: 'PUT',
    data: params,
  });
}

/*  修改canal实例*/
export async function canalConfigEdit(params) {
  return request('/binlog-sync-es/canal-config', {
    method: 'POST',
    data: params,
  });
}

/* 分页查询索引 */
export async function indexTableList(current) {
  return request('/binlog-sync-es/index-table/list?current=' + current, {
    method: 'GET',
  });
}

/* 新增索引记录 */
export async function indexTableAdd(params) {
  return request('/binlog-sync-es/index-table', {
    method: 'PUT',
    data: params,
  });
}

/* 编辑索引记录 */
export async function indexTableEdit(params) {
  return request('/binlog-sync-es/index-table', {
    method: 'POST',
    data: params,
  });
}

/* 删除索引记录 */
export async function indexTableDelete(id) {
  return request('/binlog-sync-es/index-table/' + id, {
    method: 'DELETE',
  });
}

/* 字段列表索引 */
export async function fieldList(current, indexName) {
  return request(
    `/binlog-sync-es/index-field-config/list?current=${current}&indexName=${indexName}`,
    {
      method: 'GET',
    },
  );
}

/* 删除字段 */
export async function fieldDelete(id) {
  return request('/binlog-sync-es/index-field-config/' + id, {
    method: 'DELETE',
  });
}

/* 新增字段 */
export async function fieldAdd(params) {
  return request('/binlog-sync-es/index-field-config', {
    method: 'PUT',
    data: params,
  });
}

/* 编辑字段 */
export async function fieldEdit(params) {
  return request('/binlog-sync-es/index-field-config', {
    method: 'POST',
    data: params,
  });
}

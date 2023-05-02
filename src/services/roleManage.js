import request from '#/utils/requestAbort';
import { HttpCode } from '#/utils/contacts';
import { isTRArray, isTRObject } from '#/utils/attribute';

/* 验证登录用户是否是超管*/
export async function isSuperAdmin() {
  return request('/power/role/isSuperAdmin', {
    method: 'GET',
  });
}

/*获取公司*/
export function getcompanys() {
  return request('/power/company/findCompany', {
    method: 'GET',
  });
}

/* 角色管理下拉框（查询关联应用列表） */
export async function getRelationAppList() {
  return request('/power/role/getRelationAppList', {
    method: 'POST',
  });
}
/* 分页查询角色列表 */
export async function queryRoleList(params) {
  return request('/power/role/queryRoleList', {
    method: 'POST',
    data: params,
  });
}
/* bgm-批量删除角色 roleIds */
export async function batchDeleteRole(params) {
  return request('/power/role/batchDeleteRole', {
    method: 'POST',
    data: params,
  });
}

/* 复制角色信息 */
export async function copyRole(params) {
  return request('/power/role/copyRole', {
    method: 'POST',
    data: params,
  });
}

/* 关联用户列表 */
export async function relationUserList(params) {
  return request('/power/userRole/relationUserList', {
    method: 'POST',
    data: params,
    headers: {
      useCache: true,
      ttl: 1000 * 60 * 5,
      maxCache: 5,
    },
  });
}

/* 关联用户操作 */
export async function relationUser(params) {
  return request('/power/userRole/relationUser', {
    method: 'POST',
    data: params,
  });
}

/* 获取角色菜单信息 */
export async function queryRoleMaxMenuList(params) {
  return request('/power/role/queryRoleMaxMenuList', {
    method: 'POST',
    data: params,
  });
}

/* 数据权限列表 */
export async function dataPowerList(params) {
  return request('/power/dataPower/dataPowerList', {
    method: 'POST',
    data: params,
  });
}

/*应用菜单权限 (新)*/
/* 数据权限列表 */
// export async function newdataPowerList(params) {
//   return request('/power/dataPower/dataAppMenuList', {
//     method: 'POST',
//     data: params,
//   });
// }
export async function newdataPowerList(params) {
  return request(`/power/role/application/menu/list/${params}`, {
    method: 'GET',
  });
}
/*菜单下的权限(新)配置 */
export async function roleDataPowerMenusEidt(params) {
  return roleDataPowerMenus(params, '/power/dataPower/config/list/edit');
}

const handlePower = (array, aName, aId) => {
  return array.map((n) => {
    let obj = {};
    if (aId) {
      obj.menuId = String(n[aId] || '');
    }
    if (aName) {
      obj.menuName = String(n[aName] || '');
      if (n?.powerUnitName) obj.menuName += '-' + n?.powerUnitName;
    }
    if (n?.children?.length > 0) {
      obj.children = handlePower(n?.children, aName, aId);
    }
    return { ...n, ...obj };
  });
};

export async function roleDataPowerMenus(params, url) {
  return new Promise(async (resolve) => {
    const res = await request(url || '/power/dataPower/config/list', {
      method: 'POST',
      data: params,
    });
    if (res?.statusCode !== HttpCode.SUCCESS) {
      resolve(res);
    }
    let array = res.source;
    if (isTRObject(array) && array.manageList) {
      array = [...array.manageList];
    }
    let list = [];
    if (isTRArray(array)) {
      list = handlePower(array, res.asShowName, res.asSelectId);
    }
    resolve({ ...res, source: list });
  });
}

const handleNodes = (item) => {
  return item.map((m) => {
    let array = [];
    let q = {};
    if (m.appId) {
      q.menuId = String(m.appId);
    }
    if (m.appName) {
      q.menuName = String(m.appName);
    }
    if (m.appCode) {
      q.menuCode = String(m.appCode);
    }
    if (m.source) {
      q.menuName = String(m.source);
    }
    if (m?.menuPowerNode?.length > 0) {
      array = handleNodes(m?.menuPowerNode);
    }
    if (m?.menuSource?.length > 0) {
      array = handleNodes(m?.menuSource);
    }
    return { ...m, children: array, ...q };
  });
};

export async function roleDataPowerList(params) {
  return new Promise(async (resolve) => {
    const res = await request(`/power/role/application/menu/list/${params}`);
    if (res?.statusCode !== HttpCode.SUCCESS) {
      resolve(res);
    }
    const { roleAppMenuList = [] } = res;
    resolve({ ...res, roleAppMenuList: handleNodes(roleAppMenuList) });
  });
}
export async function submitRoleDataPowerList(params) {
  return request('/power/dataPower/config/update', {
    method: 'post',
    data: params,
  });
}

/*更新菜单权限 */
export function sumbitdata(params) {
  return request('/power/dataPower/config/update', {
    method: 'post',
    data: params,
  });
}

/*角色信息提交（新）*/
export async function submitRoleInfo(params) {
  return request('/power/role/submitRoleInfo', {
    method: 'POST',
    data: params,
  });
}

/* 超管直接保存基本信息 */
export async function submitBaseInfo(params) {
  return request('/power/role/submitRoleBaseInfo', {
    method: 'POST',
    data: params,
  });
}

// 角色同步弹窗

// 角色信息获取
export function getrole(params) {
  return request('/power/sync/role/list', {
    method: 'GET',
    data: params,
  });
}

//角色同步前检测
export function asydetection(params) {
  return request('/power/sync/role/menu/check', {
    method: 'POST',
    data: params,
  });
}

//导出可同步角色列表
export function exportrole(params) {
  return request('/power/sync/role/list/down/excel', {
    method: 'GET',
    data: params,
    responseType: 'blob',
    getResponse: 'true',
  });
}

//模板文件导入应用检测
export function importrole(params) {
  return request(`/power/sync/role/menu/excel/check`, {
    method: 'POST',
    requestType: 'from',
    data: params,
  });
}

//同步角色菜单
export function asyroleupdate(params) {
  return request('/power/sync/role/menu', {
    method: 'POST',
    data: params,
  });
}
//数据权限 批量配置菜单
export function batchEdit(params) {
  return request('/power/dataPower/config/list/batchEdit', {
    method: 'POST',
    data: params,
  });
}

//数据权限 批量更新权限
export function batchUpdate(params) {
  return request('/power/dataPower/config/batchUpdate', {
    method: 'POST',
    data: params,
  });
}
//数据权限 批量更新权限
export function operateLog(params) {
  return request('/power/role/queryOperatorLogList', {
    method: 'POST',
    data: params,
  });
}

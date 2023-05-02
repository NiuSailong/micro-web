import request from '#/utils/requestAbort';

//获取公告状态
export async function noticeStateList(code) {
  return request(`/dictionary/dictionaryValue/getListByCode/${code}`);
}
/**
 * 获取首页搜索列表条件
 * @param params
 * @returns {Promise<void>}
 */
export async function getSearchConfigure() {
  return await noticeStateList('station_rules_search');
}

/* 获取风光侠列表数据 */
export async function getStationRuleList(params) {
  return request('/dqconfig/operationRules/getOperationRulesList', {
    method: 'POST',
    data: params,
  });
}
/*获取编辑或者新建项目名称列表*/
export async function getProjectNameList() {
  return request(`/power/dept/all/getDeptConfigList/goldwind`);
}

/*获取编辑或者新建服务团队列表*/
export async function getServiceTeamList() {
  let param = {
    current: 1,
    size: 2000,
  };
  return request(`/power/serviceTeam/getServiceTeamList`, {
    method: 'POST',
    data: param,
  });
}
/*获取风电管家列表 */
export async function getAllUserByCompany() {
  return request(`/user/user/getAllUserByCompany/goldwind`);
}
/*新建判断项目是否创建过 */
export async function AllUserByCompany(deptId) {
  return request(`/dqconfig/operationRules/checkOperationRulesExist/${deptId}`);
}

/*批量获取select查询条件*/
export async function getDictionaryByIds(param) {
  return request(`/dictionary/dictionaryValue/getDictionaryByCodes`, {
    method: 'POST',
    data: param,
  });
}
/*查看具体信息 */
export async function getOperationRulesDetail(param) {
  return request(`/dqconfig/operationRules/getOperationRulesDetail/${param}`);
}

/*获取故障编码列表信息 */
export async function getFaultList(param) {
  return request(`/ledger/fault/getFaultList`, {
    method: 'POST',
    data: param,
  });
}

/*获取引用配置详情 */
export async function OperationRulesList(param) {
  return request('/dqconfig/operationRules/quoteOperationRulesList', {
    method: 'POST',
    data: param,
  });
}

/*页面保存下一步 */
export async function savePage(param) {
  return request(`/dqconfig/operationRules/addOperationRulesList`, {
    method: 'POST',
    data: param,
  });
}

/*非工作计划导出 */
export async function exportFaultRuleLine(param) {
  return request(`/dqconfig/faultRuleLine/exportFaultRuleLines`, {
    method: 'POST',
    data: param,
    responseType: 'blob',
    getResponse: true,
  });
}

/**非工作计划导入*/
export async function importFaultRuleLine(param) {
  return request(`/dqconfig/faultRuleLine/importFaultRuleLines`, {
    method: 'POST',
    requestType: 'form',

    data: param,
  });
}

/*首页数据检查 */
export async function checkOperationRules(param) {
  return request(`/dqconfig/operationRules/checkOperationRules/${param}`);
}

/*首页启用/禁用表格 */
export async function DisableOperationRules(param) {
  return request(`/dqconfig/operationRules/disableOperationRules`, {
    method: 'POST',
    data: param,
  });
}

//首页列表批量导出
export async function exportOperationRules(param) {
  return request(`/dqconfig/operationRules/exportOperationRules`, {
    method: 'POST',
    data: param,
    responseType: 'blob',
    getResponse: true,
  });
}

/**查询角色是否是风电管家 */
export async function findRoleByUserIds(param) {
  return request(`/power/role/findRoleByUserId/${param}`);
}

/*修改详情接口 */
export async function editOperationRulesLists(param) {
  return request(`/dqconfig/operationRules/editOperationRulesList`, {
    method: 'POST',
    data: param,
  });
}

/*下载模板 */
export async function downLoad(param) {
  return request(`/dqconfig/faultRuleLine/downLoadTemplate`, {
    method: 'POST',
    data: param,
    // responseType: 'blob',
    // getResponse: true,
  });
}

/**获取用户详细信息 */
export async function getUser() {
  return request(`/dqconfig/user/getUserInfo`, {
    method: 'POST',
  });
}

/*新增修改检查接口*/
export async function saveCheckOperationRule(param) {
  return request(`/dqconfig/operationRules/saveCheckOperationRules`, {
    method: 'POST',
    data: param,
  });
}

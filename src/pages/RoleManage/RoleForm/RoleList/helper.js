/**
 * 角色列表树辅助类
 * @file src\pages\RoleManage\RoleForm\RoleList\helper.js
 * @author 数字化-成都-魏叶
 * @date 2021-11-17 10:33:44
 **/

// 树状结构连线（不显示）
export const NOT_LINE = false;

// 树状结构的数据返回结构
export const MODE_FULL = 0;

export const MODE_FREEDOM = 4;
// 树状接口的keygen
export const keygenID = 'deptId';

/**
 * （未知）
 * @param {Array} array （未知）
 * @param {Array} list （未知）
 * @returns {Array} XXX匹配项组成的数组
 */
export const getChildTreeList = (array, list) => {
  const allTreeNode = [];
  _.cloneDeep(array).forEach((menu) => {
    if (list.includes(menu.menuId)) {
      allTreeNode.push(menu.parentId);
    }
  });

  const matchArr = array.filter(
    (menu) => list.includes(String(menu.menuId)) || allTreeNode.includes(String(menu.menuId)),
  );
  return matchArr;
};

/**
 * 将数组转换为树的形式
 * @param {Array} array (未知)
 * @param {Array} dataList (未知)
 * @returns {Array} (未知)
 */
export const convertArrayToTree = (array, dataList) => {
  return array.map((m) => {
    let li = dataList.filter((n) => n.parentId === m.menuId);
    if (li.length > 0) {
      li = convertArrayToTree(li, dataList);
    }
    return { ...m, children: li };
  });
};

export function flatten(data) {
  return data.reduce(
    (arr, { menuId, children = [] }) => arr.concat([{ menuId }], flatten(children)),
    [],
  );
}

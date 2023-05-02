const getChildWithParentId = function (arr, pid, parentName) {
  const fList = arr.filter((item) => item.parentId !== item.deptId && item.parentId === pid);
  return fList.map((tItem) => {
    return {
      ...tItem,
      parentName,
      children: getChildWithParentId(arr, tItem.deptId, tItem.deptName),
    };
  });
};

// 转换收件人树状结构
export const getTreeDate = function (array) {
  const rootList = array.filter((item) => item.parentId === item.deptId);
  return rootList.map((item) => {
    return { ...item, children: getChildWithParentId(array, item.deptId, item.deptName) };
  });
};
// 查找所选部门的人
export const filterPersonDate = function (personList, array) {
  return personList.filter(
    (n) => array.filter((item) => String(item) === String(n.deptId)).length > 0,
  );
};

// 查找所选角色的人
export const filterRoleDate = function (personList, array) {
  return personList.filter(
    (n) =>
      array.filter((item) => {
        return (
          item.value.filter((k) => {
            return n.roleIds.filter((j) => j === k).length > 0;
          }).length > 0
        );
      }).length > 0,
  );
};

// 查找所选角色的人
export const filterRoleWithCheckDate = function (personList, array) {
  return personList.filter(
    (n) =>
      array.filter((item) => {
        return (
          item.filter((k) => {
            return n.roleIds.filter((j) => j === k).length > 0;
          }).length > 0
        );
      }).length > 0,
  );
};

// 获取不想同的部门部分
export const filterDiffDept = function (arr1, arr2) {
  return arr1.filter(
    (n) => arr2.filter((item) => String(item.personId) === String(n.personId)).length === 0,
  );
};
// 获取不相同角色的部分
export const filterDiffRole = function (arr1, arr2) {
  return filterDiffDept(arr1, arr2);
};

// 对角色进行分组
export const groupRoleArray = function (array) {
  const obj = {};
  array.forEach((item) => {
    if (obj[item.roleName] === undefined) {
      obj[item.roleName] = [item.roleId];
    } else {
      const list = obj[item.roleName];
      list.push(item.roleId);
      obj[item.roleName] = list;
    }
  });
  return Object.keys(obj).map((keyVal) => {
    return { label: keyVal, value: obj[keyVal] };
  });
};

// 对返回的用户进行分组
export const groupUserArray = function (array) {
  const obj = {};
  array.forEach((item) => {
    item.name = item.parentName;
    if (obj[item.parentName] === undefined) {
      obj[item.parentName] = [item];
    } else {
      const list = obj[item.parentName];
      list.push(item);
      obj[item.parentName] = list.map((n) => {
        return { ...n };
      });
    }
  });
  return Object.keys(obj).map((keyVal) => {
    return { label: keyVal, value: obj[keyVal] };
  });
};

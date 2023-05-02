export const BTNS_PS = {
  ADD: 'FanruanEditButton',
  EDIT: 'FanruanEditButton',
  DEL: 'FanruanDeletButton',
};

export function toTree(data) {
  const obj = {};
  const ans = [];
  data.forEach((item) => {
    obj[item.id] = item;
  });
  data.forEach((item) => {
    if (obj[item.parentId]) {
      obj[item.parentId].children
        ? obj[item.parentId].children.push(item)
        : (obj[item.parentId].children = [item]);
    } else {
      ans.push(item);
    }
  });
  return ans;
}

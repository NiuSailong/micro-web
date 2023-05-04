import _ from 'lodash';

export function showSearch(inputValue, path) {
  return path.some((option) => option.label.indexOf(inputValue) > -1);
}

export function getFirsValues(arr, res) {
  const firsItem = arr?.[0];
  if (firsItem) {
    res.push(firsItem);
    if (firsItem.children) {
      getFirsValues(firsItem.children, res);
    }
  }
  return res;
}

const fixData = (arr) =>
  arr.map((x) => {
    if (x.children) {
      x.children = fixData(x.children);
    }
    x.label = x.lable;
    return x;
  });

export function formatPowerData(powers = [], pt) {
  let result = [];
  const _power = powers.find((x) => x.type === pt);
  if (!_power) return Promise.resolve([]);
  const { json = [], asSelectId, asShowName } = _power;
  if (pt === 't_dept') {
    if (json?.customer === true) {
      result = json.customerList.map(({ children = [], ...a }) => ({
        ...a,
        label: a.area,
        value: a.area,
        children: children.map(({ children, ...b }) => ({
          ...b,
          label: b[asShowName],
          value: b[asSelectId],
        })),
      }));
    } else {
      const groups = _.groupBy(json?.manageList || [], 'area');
      for (const area in groups) {
        result.push({
          label: area,
          value: area,
          children: groups[area].map(({ children, ...b }) => ({
            ...b,
            label: b[asShowName],
            value: b[asSelectId],
          })),
        });
      }
    }
  } else {
    result = fixData(json);
  }
  // todo others...
  return Promise.resolve(result);
}

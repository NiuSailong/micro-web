export const convertTreeToArray = (data, treeMap = [], depth = 0) => {
  let lintDepth = depth;
  if (!(data && data.length)) return [];
  lintDepth++;
  return data.reduce((acc, cur) => {
    cur.depth = lintDepth;
    acc.push(cur);
    if (cur.children && cur.children.length) {
      convertTreeToArray(cur.children, treeMap, lintDepth);
    }
    return acc;
  }, treeMap);
};

export const GetFileBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

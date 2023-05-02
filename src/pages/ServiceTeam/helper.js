import { useState, useRef, useEffect, useCallback } from 'react';

export function changeKey(arr, keys) {
  let newArr = [];
  arr.forEach((item) => {
    let newObj = {};
    for (var i = 0; i < keys.length; i++) {
      newObj[keys[i]] = item[Object.keys(item)[i]];
    }
    newArr.push(newObj);
  });
  return newArr;
}

export function useThrottle(fn, ms = 30, deps = []) {
  let previous = useRef(0);
  let [time, setTime] = useState(ms);
  useEffect(() => {
    let now = Date.now();
    if (now - previous.current > time) {
      fn();
      previous.current = now;
    }
  }, deps);

  const cancel = () => {
    setTime(0);
  };

  return [cancel];
}

export function useDebounce(fn, delay, dep = []) {
  const { current } = useRef({ fn, timer: null });
  useEffect(
    function () {
      current.fn = fn;
    },
    [fn],
  );

  return useCallback(function f(...args) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => {
      // eslint-disable-next-line
      current.fn.call(this, ...args);
    }, delay);
  }, dep);
}

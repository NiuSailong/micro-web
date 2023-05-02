import React, { useState, useEffect } from 'react';
import style from './style.less';

const VirtualList = (props) => {
  const { data, count, size, viewSize, rowHeight, renderNode, isleft } = props;
  let [startindex, setStartIndex] = useState(0);
  let [phantomHeight, setPhantomHeight] = useState(0);
  let [startOffset, setStartOffset] = useState(0);

  useEffect(() => {
    setPhantomHeight(rowHeight * count);
  }, [count, rowHeight]);

  const onScroll = (e) => {
    let scrollTop = e.target.scrollTop;
    let offset = scrollTop - (scrollTop % rowHeight);
    let index = Math.floor(scrollTop / rowHeight);
    setStartOffset(offset);
    setStartIndex(index);
  };

  return (
    <div
      className={style.jislcontainer}
      style={
        (data && data.length > viewSize) || (data && data.length === 0)
          ? { height: rowHeight * viewSize }
          : { height: rowHeight * data.length }
      }
      onScroll={onScroll}
    >
      <div className={style.phantom} style={{ height: phantomHeight }} />
      <div className={style.view} style={{ transform: `translateY(${startOffset}px)` }}>
        {data instanceof Array && data.length > 0 ? (
          data.slice(startindex, startindex + size).map((item, index) => {
            if (Object.prototype.toString.call(renderNode) !== '[object Function]') return;
            return renderNode(data, item, index + startindex, isleft);
          })
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default VirtualList;

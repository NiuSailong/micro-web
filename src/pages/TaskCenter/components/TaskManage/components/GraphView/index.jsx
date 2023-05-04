import React, { useEffect, useRef } from 'react';
import graphStyles from './index.less';
import { useSize } from 'ahooks';
import G6 from '@antv/g6';
const GraphView = ({ data, callback = null }) => {
  let graph = useRef(null);
  const refContainer = useRef(null);
  const drageSize = useSize(refContainer);
  useEffect(() => {
    if (!!data) {
      const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 20,
        itemTypes: ['node'],
        getContent(e) {
          const outDiv = document.createElement('div');
          outDiv.style.width = '240px';
          outDiv.innerHTML = `
            <ul>
              <li>taskName :  ${e.item.getModel().des}</li>
              <li>${callback == null ? 'uuid' : 'taskCode'} :  ${e.item.getModel().id}</li>
            </ul>`;
          return outDiv;
        },
      });
      graph.current = new G6.Graph({
        container: 'container', // 指定图画布的容器 id，与第 9 行的容器对应
        // 画布宽高
        width: refContainer.current.clientWidth,
        height: refContainer.current.clientHeight,
        fitCenter: true,
        plugins: [tooltip],
        modes: {
          default: ['drag-canvas', 'zoom-canvas'],
        },
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          align: 'UL',
          controlPoints: true,
          nodesepFunc: () => 1,
          ranksepFunc: () => 1,
        },
        defaultNode: {
          type: 'rect',
          size: [120, 40],
          style: {
            padding: [3, 2, 3, 2],
            radius: 2,
            lineWidth: 1,
          },
          // 其他配置
        },
        defaultEdge: {
          type: 'polyline',
          color: '#999',
          style: {
            radius: 10,
            endArrow: true,
          },
        },
        nodeStateStyles: {
          // 鼠标点击节点，即 click 状态为 true 时的样式
          click: {
            stroke: '#5B8FF9',
            lineWidth: 3,
          },
          active: {
            opacity: 0.9,
            // 修改 name 为 'node-label' 的子图形 hover 状态下的样式
            'node-text': {
              stroke: 'blue',
            },
          },
        },
      });
      // 读取数据
      graph.current.data(data);
      // 渲染图
      graph.current.render();

      graph.current.on('node:mouseenter', (e) => {
        graph.current.setItemState(e.item, 'active', true);
      });
      graph.current.on('node:mouseleave', (e) => {
        graph.current.setItemState(e.item, 'active', false);
      });
      if (callback != null) {
        graph.current.on('node:click', (e) => {
          // 先将所有当前是 click 状态的节点置为非 click 状态
          const clickNodes = graph.current.findAllByState('node', 'click');
          clickNodes.forEach((cn) => {
            graph.current.setItemState(cn, 'click', false);
          });
          const nodeItem = e.item; // 获取被点击的节点元素对象
          graph.current.setItemState(nodeItem, 'click', true); // 设置当前节点的 click 状态为 true
          callback(nodeItem._cfg.id);
        });
      }
    }
    return () => {
      graph?.current?.off();
      graph?.current?.destroy();
    };
  }, [data]);
  // useThrottleEffect(
  //   () => {
  //     console.log("graph",graph.current)
  //     if (!graph?.current || !drageSize || graph?.current?.destroyed) return;
  //     graph.current.changeSize(drageSize.width, drageSize.height);
  //     // graph.current.fitView(0, {});
  //     graph.current.fitCenter();
  //   },
  //   [drageSize?.width, drageSize?.height],
  //   { wait: 500 },
  // );
  return <div id="container" ref={refContainer} className={graphStyles.graphView} />;
};

export default GraphView;

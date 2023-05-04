import React, { useEffect } from 'react';
import { Select, Button, Tag, Spin, message } from 'antd';
import { useTRState } from '#/utils/trHooks';
import styles from './index.less';
import GraphView from '../GraphView';
import { HttpCode } from '#/utils/contacts';
import { getTaskRely, saveTaskRely } from '@/services/TaskCenter';
import { buttons } from '../../helper';
const startNode = {
  id: '0',
  label: 'start',
  des: 'start节点',
  type: 'circle',
  size: 50,
  style: {
    fill: 'red',
  },
  labelCfg: {
    style: {
      fill: '#fff',
    },
  },
};
const splitStr = (str, len = 18) => {
  if (str.length > len) {
    return `${str.slice(0, len - 1)}...`;
  } else {
    return str;
  }
};
const GraphConfig = ({ buttonsFunc }) => {
  const [state, setState] = useTRState({
    nodeClick: null,
    data: null,
    nodeValue: null,
    node_options: [],
    targetNodes: [],
    allNodes: [],
    loading: false,
    nodeClickName: null,
  });

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    // 从接口拿到数据进行处理
    setState({
      loading: true,
    });
    let allNodes = [];
    let data = {
      nodes: [startNode],
      edges: [],
    };
    let nodes = []; //方便去重
    let sources = []; //最上游元素
    let res = await getTaskRely({});
    if (res?.statusCode === HttpCode.SUCCESS) {
      res.data.map((item) => {
        let obj = {
          id: item.taskCode,
          label: splitStr(item.taskName),
          des: item.taskName,
          size: [item.taskName.length > 18 ? 270 : item.taskName.length * 15, 40],
        };
        allNodes.push(obj);
        if (item.pointAtList.length > 0) {
          sources.push(item.taskCode);
          if (nodes.indexOf(item.taskCode) == -1) {
            nodes.push(item.taskCode);
          }
          item.pointAtList.map((x) => {
            data.edges.push({
              target: x,
              source: item.taskCode,
            });
            if (nodes.indexOf(x) == -1) {
              nodes.push(x);
            }
          });
        }
      });
      if (nodes.length > 0) {
        //查找最上游元素
        allNodes.map((item) => {
          nodes.map((x) => {
            if (item.id == x) {
              data.nodes.push(item);
            }
          });
        });
        let edges = _.cloneDeep(data.edges);
        sources.map((x) => {
          let isSources = true;
          data.edges.map((item) => {
            if (item.target == x) {
              isSources = false;
            }
          });
          if (isSources) {
            edges.push({ source: '0', target: x });
          }
        });
        data.edges = edges;
      }
      setState({
        data,
        allNodes,
      });
    }
    setState({
      loading: false,
    });
  };
  const saveData = async () => {
    if (buttonsFunc('TC-PZ-YLPZ', true)) {
      return;
    }
    //保存节点 并且做数据处理
    setState({
      loading: true,
    });
    let saveNodes = [];
    state.allNodes.map((item) => {
      let obj = {
        taskCode: item.id,
        pointAtList: [],
      };
      state.data.edges.map((x) => {
        if (x.source == item.id) {
          obj.pointAtList.push(x.target);
        }
      });
      saveNodes.push(obj);
    });
    let res = await saveTaskRely(saveNodes);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success('保存成功');
      getData();
    } else {
      message.error(res?.message);
    }
    setState({
      loading: false,
    });
  };
  const getAllSources = (nodes, list = []) => {
    // 递归筛选出该节点所有的上游节点
    let ns = [];
    state.data.edges.map((item) => {
      if (nodes.indexOf(item.target) != -1) {
        ns.push(item.source);
        if (list.indexOf(item.source) == -1) {
          list.push(item.source);
        }
      }
    });
    if (ns.length > 0) {
      return getAllSources(ns, list);
    } else {
      return list;
    }
  };
  const changeNode = async (node) => {
    // 选择节点后筛选出不用的节点
    setState({
      loading: true,
    });
    let nodes = [node];
    let disNodes = getAllSources(nodes);
    disNodes.push(node);
    let targets = [];
    state.data.edges.map((item) => {
      if (node == item.source) {
        targets.push(item.target);
      }
    });
    disNodes = [...disNodes, ...targets];
    let options = [];
    let targetNodes = [];
    let nodeClickName = '';
    state.allNodes.map((item) => {
      let i = true;
      if (disNodes.indexOf(item.id) == -1) {
        options.push({ value: item.id, label: item.des });
      }
      if (targets.indexOf(item.id) != -1) {
        targetNodes.push({ value: item.id, label: item.label });
      }
      if (item.id == node) {
        nodeClickName = item.des;
      }
    });
    setState({
      nodeClick: node,
      nodeClickName: nodeClickName || 'start节点',
      node_options: options,
      targetNodes: targetNodes,
      nodeValue: null,
      loading: false,
    });
  };
  const onChange = (node) => {
    // 选中的node
    setState({
      nodeValue: node,
    });
  };
  const delEdges = (id) => {
    //删除连线
    if (!!state.nodeClick) {
      let datas = { ...state.data };
      let hasEdges = 0;
      state.data.edges.map((item, index) => {
        if (id == item.target && state.nodeClick == item.source) {
          datas.edges.splice(index, 1);
        }
        if (id == item.target || id == item.source) {
          hasEdges++;
        }
      });
      if (hasEdges < 2) {
        state.data.nodes.map((item, index) => {
          if (id == item.id) {
            datas.nodes.splice(index, 1);
          }
        });
      }
      let options = [...state.node_options];
      state.allNodes.map((item) => {
        if (item.id == id) {
          options.push({ value: id, label: item.des });
        }
      });
      setState({
        data: datas,
        node_options: options,
      });
    }
  };
  const delNode = () => {
    //删除节点及其所有连线
    if (!!state.nodeClick) {
      let datas = { ...state.data };
      let edges = [];
      state.data.edges.map((item) => {
        if (state.nodeClick != item.target && state.nodeClick != item.source) {
          edges.push(item);
        }
      });
      state.data.nodes.map((item, index) => {
        if (state.nodeClick == item.id) {
          datas.nodes.splice(index, 1);
        }
      });
      datas.edges = edges;
      setState({
        data: datas,
        nodeClick: null,
        nodeClickName: null,
      });
    }
  };
  const addThisNode = () => {
    if (!!state.nodeValue && !!state.nodeClick) {
      let datas = { ...state.data };
      let notInBox = true;
      datas.nodes.map((item) => {
        if (item.id == state.nodeValue.key) {
          notInBox = false;
        }
      });
      if (notInBox) {
        state.allNodes.map((item) => {
          if (item.id == state.nodeValue.key) {
            datas.nodes.push(item);
          }
        });
      }
      datas.edges.push({ source: state.nodeClick, target: state.nodeValue.key });
      let targetNodes = [...state.targetNodes];
      targetNodes.push({ value: state.nodeValue.key, label: state.nodeValue.label });
      let options = [...state.node_options];
      state.node_options.map((item, index) => {
        if (item.value == state.nodeValue.key) {
          options.splice(index, 1);
        }
      });
      setState({
        data: datas,
        targetNodes: targetNodes,
        node_options: options,
        nodeValue: null,
      });
    }
  };
  return (
    <div className={styles.container}>
      <GraphView data={state.data} callback={changeNode} />
      <Spin spinning={state.loading}>
        <div className={styles.nodeForm}>
          <div className={styles.nodeForm_title}>选中节点： {state.nodeClickName || '无'}</div>
          <Button
            type="ghost"
            danger
            size="large"
            style={{ borderRadius: 5 }}
            disabled={!state.nodeClick || state.nodeClick == '0'}
            onClick={() => delNode()}
          >
            删除选中节点
          </Button>
          <div className={styles.nodeForm_title1}>管理子节点</div>
          <div>
            <Select
              labelInValue
              showSearch
              placeholder="请选择要添加的子项"
              optionFilterProp="children"
              style={{ width: '275px' }}
              onChange={onChange}
              size="large"
              value={state.nodeValue}
              disabled={!state.nodeClick}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={state.node_options}
            />
            <Button type="primary" size="large" onClick={() => addThisNode()}>
              添加
            </Button>
          </div>
          <div className={styles.nodeForm_title1}>已有子节点：</div>
          <div className={styles.nodeForm_tags}>
            {state.targetNodes.map((item, index) => {
              return (
                <Tag
                  closable
                  onClose={() => {
                    delEdges(item.value);
                  }}
                  key={index}
                >
                  {item.label}
                </Tag>
              );
            })}
          </div>
          <Button
            type="primary"
            style={{
              marginTop: 16,
              borderRadius: 5,
            }}
            className={buttonsFunc('TC-PZ-YLPZ') ? styles.disableBtn : ''}
            loading={state.loading}
            size="large"
            onClick={() => saveData()}
          >
            全部保存
          </Button>
        </div>
      </Spin>
    </div>
  );
};

export default GraphConfig;

/* eslint-disable */
import React, { Component } from 'react';
import {
  Tooltip,
  notification,
  Card,
  Empty,
  Button,
  Form,
  Divider,
  Select,
  Col,
  Row,
  Menu,
  Dropdown,
  Spin,
  Space,
} from 'antd';
import styles from './index.less';
import { DeleteOutlined, PlusOutlined, FormOutlined } from '#/utils/antdIcons';
import FooterInput from '../FooterInput';
import BasicConfig from '../BasicConfiguration';
import HeaderInput from '../HeaderInput';
import PanelTitle from '#/components/PanelTitle';
import { columnAll, columnPlan } from '../FooterInput/helper';
import { config } from '../BasicConfiguration/helper';
import Tablemodaling from '../Modal';
import TreeModaling from '../Modal/treeSelect';
import { downloadHandle } from '#/utils/utils';
import { fiflter, data, Sets } from './helper';
import tAlert from '#/components/Alert';
import {
  getOperationRulesDetail,
  saveCheckOperationRule,
  getUser,
  downLoad,
  editOperationRulesLists,
  importFaultRuleLine,
  exportFaultRuleLine,
  savePage,
  OperationRulesList,
  getProjectNameList,
  getServiceTeamList,
  getAllUserByCompany,
  getDictionaryByIds,
} from '@/services/stationrule';
import { MokeSelect, Group, oldData } from '../HeaderInput/helper';
import Message from '#/components/Message';
import downModal from '@/pages/ServiceTeam/components/LeadingIn';
import _ from 'lodash';
import { HttpCode } from '#/utils/contacts';
const { Option } = Select;

export default class index extends Component {
  formCreate = React.createRef();
  state = {
    currentState: '',
    projectSelectList: [],
    ServiceTeamList: [],
    AllUserByCompany: [],
    NonWorkPlan: [{ id: 1, show: false, len: 0, faultRuleLineList: data }],
    plantable: [],
    showButton: [],
    editValue: {},
    loading: true,
    viewDetail: {},
    unPlanTitle: columnPlan,
    PlanTitle: columnAll,
    unselect: [],
    saveDatas: { planOrderRulesList: [] },
    defaultVal: {},
    type: '',
    lodingadd: false,
    falseDel: [],
  };

  componentDidMount() {
    const { type } = this.props;
    let unPlan =
      type === 'newData'
        ? [
            {
              id: 1,
              del: false,
              show: false,
              update: true,
              len: 0,
              newData: true,
              faultRuleLineList: this.newUnplanData('unplan'),
            },
          ]
        : [...(this.props.viewDetail.faultRuleLineGroupWindModelList || [])];

    this.setState(
      {
        currentState: this.props.type,
        viewDetail:
          type === 'newData'
            ? Sets
            : {
                ...this.props.viewDetail.operationRules,
                oldSceneryHousekeeperIds: this.props.viewDetail.operationRules
                  .sceneryHousekeeperIds,
                oldServiceTeamIds: this.props.viewDetail.operationRules.serviceTeamIds,
              } || {},
        plantable:
          type === 'newData'
            ? this.newUnplanData('plan')
            : this.props.viewDetail.planOrderRulesList || [],
        NonWorkPlan: unPlan,
        flagUnplan: unPlan, //用此值作为判断数据为空
      },
      () => {
        this.getProjectList();
        let objs = {};
        objs.faultRuleLineGroupWindModelList = unPlan;
        objs.planOrderRulesList = [...this.state.plantable];
        this.setState({
          saveDatas: objs,
        });
      },
    );
  }

  newUnplanData = (flag) => {
    if (flag === 'unplan') {
      return [
        {
          ids: Date.parse(new Date()) + `${Math.floor(Math.random() * 10000)}`,
          linenum: 1,
          faultCode: '',
          faultName: '',
          stdhhours: '',
          stdcosts: '',
          workType: '',
          faultruleId: '',
          confirm: '',
          del: false,
          newData: true,
          update: true,
        },
      ];
    }
    if (flag === 'plan') {
      return [
        {
          ids: Date.parse(new Date()) + `${Math.floor(Math.random() * 10000)}`,
          type: '',
          personNumber: '',
          stdhhours: '',
          stdcosts: '',
          workType: '',
          flag: '',
          strict: '',
          del: false,
          newData: true,
          update: true,
        },
      ];
    }
  };

  /**解析对应文件内容 */
  getProjectList = async () => {
    let unPlanTitle = [...this.state.unPlanTitle];
    let PlanTitle = [...this.state.PlanTitle];
    const { type } = this.props;
    let viewDetail = type === 'newData' ? { ...Sets } : { ...this.state.viewDetail };
    const data = ['ORDER_TYPE', 'WORK_TYPE', 'FLAG', 'STRICT', 'CONFIRM', 'WIND_MODEL'];
    const { NonWorkPlan } = this.state;
    let [res = {}, request = {}, getAllUsers = {}, getDictionaryById = {}] = await Promise.all([
      getProjectNameList(),
      getServiceTeamList(),
      getAllUserByCompany(),
      getDictionaryByIds(data),
    ]);
    if (type === 'newData') {
      let userId = await getUser();
      viewDetail.createUserName = userId.username;
      viewDetail.createUserId = userId.userId;
    }
    let windModel = getDictionaryById.listMap.WIND_MODEL;
    let strings = JSON.parse(
      JSON.stringify(getDictionaryById)
        .replace(/WORK_TYPE/g, 'workType')
        .replace(/STRICT/g, 'strict')
        .replace(/CONFIRM/g, 'confirm')
        .replace(/FLAG/g, 'flag')
        .replace(/ORDER_TYPE/g, 'type'),
    );
    NonWorkPlan.forEach((item) => {
      windModel.forEach((i) => {
        if (i.value === item.windModel) {
          i.disable = true;
        }
      });
    });
    unPlanTitle.forEach((item) => {
      item.select = strings.listMap[item.dataIndex];
    });
    PlanTitle.forEach((item) => {
      item.select = strings.listMap[item.dataIndex];
    });
    this.setState(
      {
        projectSelectList: res.dataDeptConfigList || [],
        ServiceTeamList: request.dataResults || [],
        AllUserByCompany: getAllUsers.userInfoBodyList || [],
        unPlanTitle: unPlanTitle,
        PlanTitle: PlanTitle,
        unselect: windModel,
        selectType: strings.listMap.type,
        viewDetail: viewDetail,
        typeSelect: strings.listMap.type,
      },
      () => {
        this.changeDetail();
      },
    );
  };

  ArrayToTree = (data, parentIds, str) => {
    let tempLevel = [];
    data.forEach((v) => {
      if (v.parentId == parentIds) {
        if (data.some((children) => v.parentId !== v.deptId && children.parentId == v.deptId)) {
          v.parent =
            v.deptType === 'B1' || v.deptType === 'B5' ? str + '/' + v.deptName || '' : str;
          v.children = this.ArrayToTree(data, v.deptId, v.parent);
        }
        v.parent = v.deptType === 'B1' || v.deptType === 'B5' ? str + '/' + v.deptName || '' : str;
        tempLevel.push({ ...v, title: v.deptName, value: v.id });
      }
    });
    return tempLevel;
  };

  changeDetail = () => {
    let Details = Group;
    let Project = this.state.projectSelectList,
      ServiceTeamList = this.state.ServiceTeamList,
      Housekeeper = this.state.AllUserByCompany;
    MokeSelect.project = Project;
    MokeSelect.serviceTeamIds = JSON.parse(
      JSON.stringify(ServiceTeamList)
        .replace(/serviceTeamId/g, 'value')
        .replace(/teamName/g, 'title'),
    );
    MokeSelect.sceneryHousekeeperIds = JSON.parse(
      JSON.stringify(Housekeeper)
        .replace(/userId/g, 'value')
        .replace(/name/g, 'title'),
    );

    Details.forEach((item) => {
      if (item.type === 'treeSelect') {
        let selecttree = this.ArrayToTree(MokeSelect.project, 1, false);
        let data = [];
        selecttree.forEach((i) => {
          if (i.deptId === i.parentId) {
            data.push(i);
          } else {
            data[0].children = data[0].children ? [...data[0].children] : [];
            data[0].children.push(i);
          }
        });
        item.select = data || [];
      } else {
        item.select = MokeSelect[item.detail] || [];
      }
    });
    if (this.props.type !== 'newData' && this.props.viewDetail.operationRules.updateUserName) {
      Details = [...Details, ...oldData];
    }
    this.setState({
      projectSelectList: Details,
      loading: false,
    });
  };

  changeState = () => {
    this.setState(
      {
        currentState: 'edit',
        type: 'edit',
      },
      () => {
        this.props.Editchange();
      },
    );
  };

  onFinish = () => {
    return false;
  };
  onFinishFailed = () => {
    return false;
  };

  changeCallback = (key, value) => {
    if (key === 'serviceTeam') {
      this.formCreate.current.setFieldsValue({
        serviceTeamIds: value,
      });
    }
    this.formCreate.current.setFieldsValue({
      [key]: value,
    });
  };

  showModal = async () => {
    const { otherParam = {} } = this.props;
    let selectTypes = [...this.state.selectType];
    let plandel = [...this.state.plantable];
    let unplandel = [...this.state.NonWorkPlan];
    let list = {
      current: 1,
      forceStationName: '',
      projectName: '',
      size: 10,
      totle: 5,
      ...otherParam,
    };
    let result = await OperationRulesList(list);
    let res = await Tablemodaling.show(
      fiflter,
      result,
      {
        current: 0,
        faultCode: '项目名称',
        faultName: '场站名称',
        typeCode: 'projectName',
        typeName: 'forceStationName',
        size: 10,
        title: '引用配置',
      },
      OperationRulesList,
    );
    if (res.length > 0) {
      let configs = [];
      config.forEach((item) => {
        configs.push(item.detil);
      });
      this.setState({
        lodingadd: true,
      });
      let DataDetail = await getOperationRulesDetail(res[0].operationruleId);
      if (DataDetail && DataDetail.statusCode === HttpCode.SUCCESS) {
        for (let key in res[0]) {
          if (configs.indexOf(key) !== -1) {
            this.changeCallback(key, res[0][key]);
          }
        }

        let newNonWorkPlan = this.changeExport(DataDetail.faultRuleLineGroupWindModelList || []);
        let newplantable = this.changeExport(DataDetail.planOrderRulesList || [], true, true);
        newplantable.forEach((item) => {
          selectTypes.forEach((m) => {
            if (item.type === m.value || item.type === m.description) {
              m.disable = true;
            }
          });
        });
        let oldplan = this.changeoldData(plandel);
        let oldunplan = this.tipSaveMerge(unplandel, newNonWorkPlan);
        this.setState(
          {
            viewDetail: res[0],
            NonWorkPlan: oldunplan,
            plantable: newplantable,
            flagUnplan: newNonWorkPlan,
            lodingadd: false,
          },
          () => {
            let objs = {};
            objs.faultRuleLineGroupWindModelList = oldunplan;
            objs.planOrderRulesList = [...oldplan, ...newplantable];
            this.setState({
              oldDataSave: unplandel,
              saveDatas: objs,
            });
          },
        );
      } else {
        this.setState({
          lodingadd: false,
        });
        return notification.error({
          message: DataDetail.result,
          description: DataDetail.message,
        });
      }
    }
  };

  changeoldData = (data) => {
    data.forEach((item) => {
      item.del = true;
      item.old = true;
    });
    data.splice(
      data.findIndex((v) => {
        return v.newData && v.del && v.old;
      }),
      1,
    );
    return data;
  };

  tipSaveMerge = (oldData, newData) => {
    // let newOldArr = [];
    oldData.forEach((item) => {
      item.del = true;
      newData.forEach((i) => {
        if (item.windModel === i.windModel) {
          item.del = false;
          item.update = true;
          i.tipl = true;
          let oldchange = this.changeTipSave(item.faultRuleLineList);
          item.faultRuleLineList = [...oldchange, ...i.faultRuleLineList];
        } else {
          item.del = true;
        }
      });
    });
    newData.forEach((item) => {
      if (!item.tipl) {
        oldData.push(item);
      }
    });
    return oldData;
  };

  changeTipSave = (saveData) => {
    saveData.forEach((i) => {
      i.del = true;
      i.old = true;
    });
    return saveData;
  };

  changeExport = (data, flag, fail) => {
    data.forEach((item, index) => {
      item.update = true;
      item.newData = true;
      if (flag) {
        item.ids = Date.parse(new Date()) + `${Math.floor(Math.random() * 10000000) + index}`;
        item.id = null;
        if (fail) {
          item.deptId = '';
        } else {
          item.faultrulelineId = '';
          item.faultruleId = '';
        }
      }

      if (item.faultRuleLineList && item.faultRuleLineList.length > 0) {
        this.changeExport(item.faultRuleLineList, true);
      }
    });
    return data;
  };

  addPlan = (flag) => {
    if (flag) {
      let unplans = this.state.plantable || [];
      let plan = this.newUnplanData('plan');
      unplans = unplans.concat(plan);
      this.setState({
        plantable: unplans,
      });
    } else {
      let obj = [...this.state.NonWorkPlan];
      let flagunObj = [...this.state.flagUnplan];
      const { unselect } = this.state;
      let expt = obj.filter((item) => {
        return !item.del;
      });
      if (expt.length === unselect.length) {
        return Message.error('没有可配置的机型了');
      }
      let addObj = {
        id: Date.parse(new Date()) + `${Math.floor(Math.random() * 10000)}`,
        show: false,
        len: 0,
        update: true,
        del: false,
        newData: true,
        faultRuleLineList: this.newUnplanData('unplan'),
      };
      obj.push(addObj);
      flagunObj.push(addObj);
      this.setState({
        NonWorkPlan: obj,
        flagUnplan: flagunObj,
      });
    }
  };

  delete = (id) => {
    let obj = this.state.NonWorkPlan;
    let unobjFlag = [...this.state.flagUnplan];
    let falseDel = [...this.state.falseDel];
    let unplanWindModel = [...this.state.unselect];
    let flagunplan = [];
    obj.forEach((item, index) => {
      if ((item.id && item.id === id.id) || (item.windModel && item.windModel === id.windModel)) {
        if (item.newData) {
          obj.splice(index, 1);
        } else {
          falseDel.push('true');
          item.del = true;
        }
      }
    });
    obj.forEach((i) => {
      if (!i.del) {
        flagunplan.push(i.windModel);
      }
    });
    unobjFlag.splice(
      unobjFlag.findIndex((v) => {
        return (v.id && v.id === id.id) || (v.windModel && v.windModel === id.windModel);
      }),
      1,
    );
    unplanWindModel.forEach((i) => {
      let ind = _.indexOf(flagunplan, i.value);
      if (ind !== -1) {
        i.disable = true;
      } else {
        i.disable = false;
      }
    });
    this.setState({
      NonWorkPlan: obj,
      flagUnplan: unobjFlag,
      unselect: unplanWindModel,
    });
  };

  /**导出 */
  exportExal = async (datas) => {
    let unobjs = { ...this.state.unplanshows };
    // let objarr = [...this.state.plantable];
    let unPlan = [...this.state.NonWorkPlan];
    let flag = false;
    let arrObj = [];
    if (JSON.stringify(unobjs) !== '{}') {
      unobjs.values.forEach((item) => {
        arrObj.push(item.faultrulelineId);
      });
    } else {
      unPlan.map((item) => {
        if (item.id === datas.id) {
          datas.faultRuleLineList.map((k) => {
            if (k.del || k.update) {
              flag = true;
              return Message.error('有未保存的内容，请保存之后进行导出');
            } else {
              arrObj.push(k.faultrulelineId);
            }
          });
        }
      });
    }

    let deptId = this.formCreate.current.getFieldValue().deptId
      ? this.formCreate.current.getFieldValue().deptId
      : this.formCreate.current.getFieldValue().projectName
      ? this.formCreate.current.getFieldValue().projectName.value
      : false;
    if (!deptId && !flag) {
      return Message.error('请先选择项目');
    }
    if (!unobjs.windModel && !datas.windModel && !flag) {
      return Message.error('请先选择风机');
    }
    if (!flag) {
      let params = {
        faultRuleLineIds: arrObj,
        projectName:
          this.formCreate.current.getFieldValue().projectName.label ||
          this.formCreate.current.getFieldValue().projectName,
        windModel: unobjs.windModel || datas.windModel,
      };
      let data = await exportFaultRuleLine(params);

      if (data.data && data.data instanceof Blob) {
        const realFileName = data.response.headers
          .get('content-disposition')
          .split('filename=')[1]
          .split(';')[0];
        downloadHandle(data.data, decodeURI(realFileName));
      } else {
        tAlert.error('导出失败');
      }
    }
  };

  showeditModal = async (data) => {
    let objs = this.state.showButton;
    // let unobjs = { ...this.state.unplanshows };
    // let jobobj={...this.state.saveDatas};
    let objarr = [...this.state.plantable];
    let unPlan = [...this.state.NonWorkPlan];
    let saveDatas = { ...this.state.saveDatas };
    let planSelect = [...this.state.selectType];
    // let selectobj=[]
    if (data.name === '编辑') {
      let obj = data.type === 'plan' ? '计划工作编辑' : '非计划工作编辑';
      let title = data.type === 'plan' ? this.state.PlanTitle : this.state.unPlanTitle;
      let res = await TreeModaling.show(obj, title);
      if (data.type === 'plan') {
        objarr.forEach((item) => {
          if (objs.some((children) => item.id === children.id || item.ids === children.ids)) {
            for (let kes in res) {
              item[kes] = res[kes];
            }
          }
        });
        saveDatas.planOrderRulesList = objarr;
        this.setState({
          plantable: objarr,
          saveDatas: saveDatas,
        });
      } else {
        unPlan.forEach((item) => {
          if (item.windModel === data.windModel) {
            item.faultRuleLineList.forEach((i) => {
              if (
                item.showRow.some(
                  (children) =>
                    (i.faultrulelineId && children.faultrulelineId === i.faultrulelineId) ||
                    (i.id && children.id === i.id) ||
                    (i.ids && children.ids === i.ids),
                )
              ) {
                for (let kes in res) {
                  i[kes] = res[kes];
                }
              }
            });
          }
        });
        saveDatas.faultRuleLineGroupWindModelList = unPlan;
        this.setState({
          NonWorkPlan: unPlan,
          saveDatas: saveDatas,
        });
      }
    } else {
      // let title = data.type === 'plan' ? this.state.PlanTitle : this.state.unPlanTitle;
      if (data.type === 'plan') {
        objarr.forEach((item) => {
          if (
            objs.some(
              (children) =>
                (item.ids && item.ids === children.ids) || (item.id && item.id === children.id),
            )
          ) {
            item.update = true;
            item.del = true;
          }
        });
        objarr = _.remove(objarr, function (n) {
          return !(n.newData && n.del);
        });
        objarr.forEach((i) => {
          planSelect.forEach((m) => {
            if (i.type === m.value) {
              m.disable = true;
            }
          });
        });
        objs = _.remove(objs, function (n) {
          return !(n.newData && n.del);
        });
        saveDatas.planOrderRulesList = objarr;
        this.setState({
          plantable: objarr,
          showButton: objs,
          selectType: planSelect,
          saveDatas: saveDatas,
        });
      } else {
        unPlan.forEach((item) => {
          if (item.windModel === data.windModel) {
            item.faultRuleLineList.forEach((i) => {
              if (
                item.showRow.some(
                  (children) =>
                    (i.ids && i.ids === children.ids) ||
                    (i.id && i.id === children.id) ||
                    (children.faultrulelineId && children.faultrulelineId === i.faultrulelineId),
                )
              ) {
                i.del = true;
              }
            });
            item.faultRuleLineList = _.remove(item.faultRuleLineList, function (n) {
              return !(n.newData && n.del);
            });
          }
          let inds =
            (item.showRow &&
              item.showRow.filter((m) => {
                return !(m.del && m.newData);
              })) ||
            [];
          item.len = inds.length;
        });
        this.setState({
          NonWorkPlan: unPlan,
        });
      }
    }
  };

  renderTable = (value, item) => {
    if (item === 'plan') {
      this.setState({
        showButton: value,
      });
    } else {
      let obj = [...this.state.NonWorkPlan];
      obj.forEach((i) => {
        if ((i.id && i.id === item.id) || (i.windModel && i.windModel === item.windModel)) {
          i.show = value.length == 0 ? false : true;
          i.len = value.length;
          i.showRow = value;
        }
      });
      this.setState({
        NonWorkPlan: obj,
        unplanshows: { windModel: item.windModel, values: value, data: item },
      });
    }
  };

  shouldComponentUpdate(nextprops) {
    if (JSON.stringify(nextprops.viewDetail) !== JSON.stringify(this.props.viewDetail)) {
      this.setState({
        viewDetail: nextprops.viewDetail.operationRules,
        plantable: nextprops.viewDetail.planOrderRulesList,
      });
    }
    return true;
  }

  shows = async (rowId) => {
    if (rowId.windModel) {
      let obj = [...this.state.NonWorkPlan];
      const { type } = this.props;
      let deptId = this.formCreate.current.getFieldValue().deptId
        ? this.formCreate.current.getFieldValue().deptId
        : this.formCreate.current.getFieldValue().projectName
        ? this.formCreate.current.getFieldValue().projectName.value
        : false;

      if (!deptId) {
        return Message.error('请先选择项目名称');
      }
      let faultCodeList = [],
        maxLineNum = 0;
      obj.forEach((item) => {
        if (rowId.windModel === item.windModel && !item.del) {
          item.faultRuleLineList.forEach((m) => {
            faultCodeList.push(m.faultCode);
            maxLineNum = item.faultRuleLineList[item.faultRuleLineList.length - 1].linenum || 0;
          });
        }
      });
      let data = await downModal.show({
        moduleId: 0,
        exportUrl: importFaultRuleLine,
        downloadUrl: downLoad,
        params: {
          deptId: deptId,
          methodFlag: type === 'newData' ? 'ADD' : 'UPDATE',
          windModel: rowId.windModel,
          faultCodeList: faultCodeList,
          maxLineNum: maxLineNum + 1,
        },
      });
      if (data.index === 1) {
        if (data.data.message === '导入的数据为空') {
          return Message.error('导入的数据为空');
        } else {
          Message.success('导入成功');
          obj.forEach((item) => {
            if (rowId.windModel === item.windModel) {
              item.update = true;
              item.faultRuleLineList = this.changelinenum(
                item.faultRuleLineList,
                data.data.faultRuleLineList,
              );
            }
          });
          this.setState({
            NonWorkPlan: obj,
          });
        }
      }
    } else {
      Message.error('请先选择风机再进行导入操作');
    }
  };

  /*修改序号*/
  changelinenum = (oldData, newData) => {
    let oldNewData = [];
    oldData.forEach((item) => {
      if (item.old || !item.newData) {
        if (!item.old) {
          item.old = true;
          item.del = true;
        }
        oldNewData.push(item);
      }
    });
    newData.forEach((item, index) => {
      item.ids = Date.parse(new Date()) + `${Math.floor(Math.random() * 10000)}+${index}`;
      item.confirm = item.workType === '手动指派' ? '否' : '是';
    });
    return [...oldNewData, ...newData];
  };

  /**风机机型选择 */
  onGenderChange = (value, data) => {
    let NonWorkPlans = [...this.state.NonWorkPlan];
    let selectData = { ...this.state.unplanshows };
    let unselect = [...this.state.unselect];
    let obj = { ...this.state.saveDatas };
    let indData = [];
    let flag = true;
    NonWorkPlans.forEach((item) => {
      if (
        (item.id && item.id === data.id) ||
        (item.windModel && item.windModel === data.windModel)
      ) {
        item.windModel = flag ? value : null;
        item.show = [];
        item.len = 0;
        item.faultRuleLineList = this.newUnplanData('unplan');
        if (JSON.stringify(selectData) !== '{}' && item.id === selectData.data.id) {
          selectData.windModel = item.windModel;
        }
      }
      if (!item.del) {
        indData.push(item.windModel);
      }
    });
    unselect.forEach((i) => {
      let ind = _.indexOf(indData, i.value);
      if (ind !== -1) {
        i.disable = true;
      } else {
        i.disable = false;
      }
    });

    obj.faultRuleLineGroupWindModelList = NonWorkPlans;
    this.setState({
      saveDatas: obj,
      NonWorkPlan: NonWorkPlans,
      unplanshows: selectData,
      unselect: unselect,
    });
  };

  saveData = (value, oldData, select, flag, data, type) => {
    let obj = { ...this.state.saveDatas };
    let showSelect = this.state.showButton;
    let objs = JSON.parse(JSON.stringify(this.state.NonWorkPlan));
    if (type === 'unplan') {
      objs.forEach((item) => {
        if (
          (item.id && item.id === data.id) ||
          (item.windModel && item.windModel === data.windModel)
        ) {
          let showButtons = [];
          item.showRow &&
            item.showRow.forEach((i) => {
              if (
                (select && select.ids && select.ids === i.ids) ||
                (select && select.id && select.id === i.id)
              ) {
                if (!select.del) {
                  showButtons.push(i);
                } else if (select.del && !select.newData) {
                  showButtons.push(i);
                }
              } else {
                showButtons.push(i);
              }
            });
          item.update = true;
          item.showRow = showButtons;
          item.len = value.length === 0 ? 0 : item.showRow ? showButtons.length : 0;
          item.faultRuleLineList = [...oldData, ...value];
        }
      });
      this.setState({
        NonWorkPlan: [...objs],
      });
      obj.faultRuleLineGroupWindModelList = [...objs];
    }
    if (type === 'plan') {
      let showButtons = [];
      value.forEach((i) => {
        if (
          showSelect.some((children) => {
            return children.ids === i.ids;
          })
        ) {
          showButtons.push(i);
        }
      });
      let val = value.map((i) => {
        if (!(i.del && i.newData)) {
          return i;
        }
      });

      obj[data] &&
        obj[data].forEach((item) => {
          let lintItem = item;
          val.forEach((i) => {
            if (i.ids === lintItem.ids) {
              i.tipA = true;
              lintItem = i;
            }
          });
        });
      val.forEach((item) => {
        if (!item.tipA) {
          obj[data].push(item);
        }
      });
      this.setState({
        plantable: val,
      });
      // obj[data] = obj[data];
      showSelect = showButtons;
    }
    this.setState(
      {
        saveDatas: obj,
        showButton: showSelect,
      },
      () => {},
    );
  };
  changeTypeCode = (type, value) => {
    if (type === 'windModel') {
      const { unselect } = this.state;
      let unplansel = unselect.filter((item) => {
        return item.value === value;
      });
      return unplansel.length > 0 ? unplansel[0].description : null;
    }
    if (type === 'type') {
      const { typeSelect } = this.state;
      let planType = typeSelect.filter((item) => {
        return item.description === value || item.value === value;
      });
      return planType[0] ? planType[0].value : null;
    }
  };

  submit = async (e, flag) => {
    e.stopPropagation();
    if (
      this.props.saveButton.isDel === '启用' &&
      this.props.saveButton.checkStatus === '通过' &&
      !flag
    ) {
      tAlert.error('该规则已启用，不可直接保存，请检查后再保存');
    } else {
      this.setState(
        {
          lodingadd: true,
        },
        async () => {
          let deptId = { ...this.formCreate.current.getFieldValue() },
            tablesave = {},
            error = true;
          let request = true;
          deptId.deptId = deptId.deptId
            ? deptId.deptId
            : deptId.projectName
            ? deptId.projectName.value
              ? deptId.projectName.value
              : this.props.type === 'edit'
              ? this.props.viewDetail.operationRules.deptId
              : ''
            : '';
          deptId.projectName = deptId.projectName
            ? deptId.projectName.label || deptId.projectName
            : '';
          deptId.sceneryHousekeeper = '';
          deptId.serviceTeam = '';
          if (!deptId.projectName) {
            this.setState({
              lodingadd: false,
            });
            return Message.error('项目未选择，请先选择项目');
          }
          if (
            !deptId.sceneryHousekeeperIds ||
            deptId.sceneryHousekeeperIds.length === 0 ||
            !deptId.serviceTeamIds ||
            deptId.serviceTeamIds.length === 0
          ) {
            this.setState({
              lodingadd: false,
            });
            return Message.error('必填项没有填，请先填写必填项');
          }
          let configs = [];
          config.forEach((item) => {
            configs.push(item.detil);
          });
          for (let key in deptId) {
            if (deptId[key] === '' && configs.indexOf(key) !== -1) {
              request = false;
            }
          }
          if (!request) {
            this.setState({
              lodingadd: false,
            });
            return Message.error('必填项没有填，请先填写必填项');
          }

          if (
            !this.state.saveDatas.planOrderRulesList ||
            this.state.saveDatas.planOrderRulesList.length == 0
          ) {
            let planOrderRulesList = {};
            planOrderRulesList.planOrderRulesList =
              this.props.type === 'edit' && this.props.viewDetail.planOrderRulesList
                ? [...this.props.viewDetail.planOrderRulesList]
                : [];
            tablesave = { ...this.state.saveDatas, ...planOrderRulesList };
          } else if (
            !this.state.saveDatas.faultRuleLineGroupWindModelList ||
            this.state.saveDatas.faultRuleLineGroupWindModelList.length == 0
          ) {
            let saveDate = { ...this.state.saveDatas };
            tablesave = { ...saveDate, faultRuleLineGroupWindModelList: [] };
          } else {
            let saveDate = { ...this.state.saveDatas };
            tablesave = { ...saveDate };
          }
          tablesave.planOrderRulesList &&
            tablesave.planOrderRulesList.forEach((item) => {
              item.deptId = deptId.deptId;
              // eslint-disable-next-line react/no-string-refs
              error = this.refs.plans0 ? this.refs.plans0.checkTable() : true;
              if (!error && request) {
                request = error;
                return Message.error('有必填内容未填，请填写完整后继续添加');
              }
              item.type = this.changeTypeCode('type', item.type);
              item.flag = item.flag === '是' ? 1 : item.flag === '否' ? 0 : item.flag;
              item.strict =
                item.strict === '是' ? 'TRUE' : item.strict === '否' ? 'FALSE' : item.strict;
              if (item.newData && error) {
                item.id = null;
              }
            });
          let alltable = [];
          tablesave.faultRuleLineGroupWindModelList &&
            tablesave.faultRuleLineGroupWindModelList.forEach((item, i) => {
              let errorobj = [];
              if (!item.windModel && !item.del) {
                error = false;
                request = false;
                return Message.error(`当前有非计划工作机型未选择，请选择机型`);
              }
              // eslint-disable-next-line react/no-string-refs
              error = this.refs[`plan${i}`] ? this.refs[`plan${i}`].checkTable() : true;
              if (!error && request) {
                request = error;
                return Message.error('有必填内容未填，请填写完整后继续添加');
              }
              item.faultRuleLineList.forEach((k) => {
                const len = _.compact(Object.values(k));
                k.confirm = k.confirm === '是' ? 1 : k.confirm === '否' ? 0 : k.confirm;
                if (len.length > 5 && error) {
                  errorobj.push('false');

                  if (!error && request) {
                    request = error;
                    this.setState({
                      lodingadd: false,
                    });
                    return Message.error('有必填内容未填，请填写完整后继续添加');
                  }
                  if (!item.windModel && !error) {
                    error = false;
                    request = false;
                    this.setState({
                      lodingadd: false,
                    });
                    return Message.error(`当前有非计划工作机型未选择，请选择机型`);
                  }
                } else if (k.del) {
                  errorobj.push('false');
                }
                if (k.newData && error) {
                  k.id = null;
                }
              });
              if (errorobj.length === 0) {
                alltable.push('false');
                item.faultRuleLineList = [];
              }
            });
          if (
            alltable.length === tablesave.faultRuleLineGroupWindModelList
              ? tablesave.faultRuleLineGroupWindModelList.length
              : 0
          ) {
            tablesave.faultRuleLineGroupWindModelList = [];
          }
          let tans = {
            faultRuleLineGroupWindModelList: tablesave.faultRuleLineGroupWindModelList,
            planOrderRulesList: tablesave.planOrderRulesList,
          };
          let methodFlags =
            this.props.viewDetail !== '{}'
              ? this.props.viewDetail.methodFlag
                ? this.props.viewDetail.methodFlag
                : this.state.currentState === 'newData'
                ? 'ADD'
                : 'UPDATE'
              : this.state.currentState === 'newData'
              ? 'ADD'
              : 'UPDATE';
          let obj = { check: flag, operationRules: deptId, ...tans, methodFlag: methodFlags };
          if (flag && request) {
            let res = await saveCheckOperationRule(obj);
            if (res && res.statusCode === HttpCode.SUCCESS) {
              this.setState({
                lodingadd: false,
              });
              return this.props._checkedPage(res, obj);
            } else {
              this.setState({
                lodingadd: false,
              });
              notification.error({
                message: res.result,
                description: res.message,
              });
            }
          } else if (request) {
            let res = null;
            if (this.state.currentState === 'edit' && obj.methodFlag === 'UPDATE') {
              res = await editOperationRulesLists(obj);
            } else {
              res = await savePage(obj);
            }
            if (res && res.statusCode === HttpCode.SUCCESS && !flag && error) {
              Message.success('保存成功');
              this.setState({
                lodingadd: false,
              });
              return this.props._onHandleClose(true);
            }
          }
          this.setState({
            lodingadd: false,
          });
        },
      );
    }
    // this.setState({
    //   lodingadd:false
    // })
  };

  returnList = async () => {
    this.props._onHandleClose();
  };

  render() {
    const {
      currentState,
      projectSelectList,
      NonWorkPlan,
      showButton,
      loading,
      viewDetail,
    } = this.state;
    const arr = [
      { id: 'edit', name: '编辑', type: 'plan' },
      { id: 'del', name: '删除', type: 'plan' },
    ];
    const menu = (
      <Menu>
        {arr.map((item, index) => {
          return (
            <Menu.Item
              key={index}
              style={{ textAlign: 'center' }}
              onClick={() => {
                this.showeditModal(item);
              }}
            >
              <span>{item.name}</span>
            </Menu.Item>
          );
        })}
      </Menu>
    );
    const arrs = [
      { id: 'edit', name: '编辑', type: 'unplan' },
      { id: 'del', name: '删除', type: 'unplan' },
    ];

    function menus(data, showeditModal) {
      return (
        <Menu>
          {arrs.map((item, index) => {
            return (
              <Menu.Item
                key={index}
                style={{ textAlign: 'center' }}
                onClick={() => {
                  showeditModal({ ...item, ...data });
                }}
              >
                <span>{item.name}</span>
              </Menu.Item>
            );
          })}
        </Menu>
      );
    }

    return (
      <div>
        <Spin spinning={this.state.lodingadd} style={{ marginTop: '100%' }}>
          <Card bordered={false} bodyStyle={{ padding: '10px 30px 10px 30px' }}>
            {loading ? (
              <div className={styles.example}>
                <Spin />
              </div>
            ) : (
              <Form
                name="customized_form_controls"
                layout="horizontal"
                ref={this.formCreate}
                scrollToFirstError={true}
                onFinish={() => {
                  this.onFinish();
                }}
                onSubmit={() => {
                  return false;
                }}
                onFinishFailed={(errorInfo) => {
                  this.onFinishFailed(errorInfo);
                }}
                initialValues={{ ...viewDetail, windModel: '' }}
              >
                <div className={styles.stationTitle}>
                  <div>
                    <PanelTitle title="场站基本信息" />
                  </div>
                  {currentState === 'lookup' ? (
                    <span
                      className={styles.spn}
                      onClick={() => {
                        this.changeState();
                      }}
                    >
                      {' '}
                      <FormOutlined />
                      编辑
                    </span>
                  ) : null}
                </div>
                <HeaderInput
                  type={this.state.currentState}
                  Detail={projectSelectList}
                  Mokedata={viewDetail}
                  callBack={this.changeCallback}
                />
                <Divider />
                <div className={styles.stationTitle}>
                  <div>
                    <PanelTitle title="基础配置" />
                  </div>
                  {currentState !== 'lookup' ? (
                    <Tooltip
                      title="引用其它场站的配置规则"
                      overlayClassName="overtoop"
                      overlayStyle={{ fontColor: 'red' }}
                    >
                      <Button
                        style={{ marginTop: '15px', marginRight: '13px' }}
                        disabled={this.props.saveButton.isDel === '启用' ? true : false}
                        onClick={() => {
                          this.showModal();
                        }}
                      >
                        引用
                      </Button>
                    </Tooltip>
                  ) : null}
                </div>
                <BasicConfig
                  type={this.state.currentState}
                  formCreate={this.formCreate}
                  Mokedata={viewDetail}
                />
                <Divider />
                <div className={styles.stationTitle}>
                  <div className={styles.plans}>
                    <PanelTitle title="计划工作" />
                  </div>
                  {currentState !== 'lookup' && showButton.length !== 0 ? (
                    <div>
                      <span style={{ marginRight: '9px' }}>
                        已选择<span className={styles.spnColor}>{showButton.length}</span>项
                      </span>
                      <Dropdown overlay={menu} placement="bottomCenter" arrow trigger={['click']}>
                        <Button>批量操作</Button>
                      </Dropdown>
                    </div>
                  ) : null}
                </div>
                {this.state.plantable && this.state.plantable.length > 0 ? (
                  <FooterInput
                    ref={`plans0`}
                    type={this.state.currentState}
                    plan="plan"
                    column={columnAll}
                    plantable={this.state.plantable}
                    returnData={(data, oldData, select, flag) => {
                      this.saveData(data, oldData, select, flag, 'planOrderRulesList', 'plan');
                    }}
                    returnRow={(value, tip) => {
                      this.renderTable(value, tip);
                    }}
                    selectType={this.state.selectType}
                  />
                ) : (
                  <div>
                    <Empty description={'暂无计划工作'} style={{ margin: '90px' }} />
                    {currentState === 'lookup' ? null : (
                      <Button
                        type="dashed"
                        onClick={() => {
                          this.addPlan(true);
                        }}
                        style={{ width: '100%', marginTop: '11px' }}
                      >
                        <PlusOutlined />
                        添加计划工作
                      </Button>
                    )}
                  </div>
                )}
                <Divider />
                <div className={styles.unplans}>
                  <PanelTitle title="非计划工作" />
                </div>
                {this.state.flagUnplan.length !== 0 ? (
                  NonWorkPlan &&
                  NonWorkPlan.map((item, index) => {
                    return !item.del ? (
                      <div id="stationroul" key={index}>
                        <div>
                          <Row>
                            <Col span={8}>
                              {currentState !== 'lookup' ? (
                                <div className={styles.winMarg}>
                                  <div className={styles.textTip}>
                                    <span style={{ color: 'red', marginRight: '5px' }}>*</span>
                                    <span>机型:</span>
                                  </div>
                                  <Select
                                    placeholder="请选择机型"
                                    defaultValue={item.windModel}
                                    value={item.windModel}
                                    style={{ width: '80%' }}
                                    getPopupContainer={() => document.getElementById('stationroul')}
                                    onChange={(value) => {
                                      this.onGenderChange(value, item);
                                    }}
                                    allowClear
                                  >
                                    {this.state.unselect.map((m, ind) => {
                                      return (
                                        <Option key={ind} value={m.value} disabled={m.disable}>
                                          {m.value}
                                        </Option>
                                      );
                                    })}
                                  </Select>
                                </div>
                              ) : (
                                <div className={styles.winModal}>
                                  机型：<span>{item.windModel}</span>
                                </div>
                              )}
                            </Col>
                            <Col span={3}>
                              {currentState !== 'lookup' ? (
                                <span
                                  onClick={() => {
                                    this.delete(item);
                                  }}
                                  className={styles.delspn}
                                >
                                  <DeleteOutlined />
                                  删除
                                </span>
                              ) : null}
                            </Col>
                            <Col span={5} />
                            <Col span={5}>
                              {currentState !== 'lookup' && item.len !== 0 && item.show ? (
                                <div style={{ float: 'right' }}>
                                  <span style={{ marginRight: '9px' }}>
                                    已选择<span className={styles.spnColor}>{item.len}</span>项
                                  </span>
                                  <Dropdown
                                    id={item.id}
                                    overlay={menus(item, this.showeditModal)}
                                    placement="bottomCenter"
                                    arrow
                                    trigger={['click']}
                                  >
                                    <Button>批量操作</Button>
                                  </Dropdown>
                                </div>
                              ) : null}{' '}
                            </Col>
                            <Col span={3}>
                              {currentState !== 'lookup' ? (
                                <div className={styles.flexRight}>
                                  <Button
                                    onClick={() => {
                                      this.exportExal(item);
                                    }}
                                  >
                                    导出
                                  </Button>
                                  <Button
                                    style={{ marginLeft: '15px' }}
                                    onClick={() => {
                                      this.shows(item);
                                    }}
                                  >
                                    导入
                                  </Button>
                                </div>
                              ) : null}
                            </Col>
                          </Row>
                          <FooterInput
                            ref={`plan${index}`}
                            type={currentState}
                            plantable={item.faultRuleLineList}
                            plan="unplan"
                            column={this.state.unPlanTitle}
                            returnData={(data, olddata, select, flag) => {
                              this.saveData(data, olddata, select, flag, item, 'unplan');
                            }}
                            returnRow={(value, tip) => {
                              this.renderTable(value, tip);
                            }}
                            tipData={item}
                            windmodal={item.windModel}
                          />
                          {NonWorkPlan.length - 1 === index ? null : <Divider />}
                        </div>
                      </div>
                    ) : this.state.flagUnplan.length !== 0 ? null : (
                      <div>
                        <Empty description={'暂无非计划工作'} style={{ margin: '90px' }} />
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <Empty description={'暂无非计划工作'} style={{ margin: '90px' }} />
                  </div>
                )}
                {currentState === 'lookup' ? (
                  <Divider />
                ) : (
                  <div>
                    <Button
                      type="dashed"
                      onClick={() => {
                        this.addPlan();
                      }}
                      style={{
                        width: '100%',
                        marginTop: '20px',
                      }}
                    >
                      <PlusOutlined />
                      {this.state.flagUnplan.length !== 0 ? '添加机型' : '添加非计划工作'}
                    </Button>
                    <Divider />
                  </div>
                )}

                {currentState === 'lookup' ? (
                  <div className={styles.styleButton}>
                    <Button
                      onClick={() => {
                        this.returnList();
                      }}
                    >
                      返回
                    </Button>
                  </div>
                ) : (
                  <div className={styles.styleButton}>
                    <Space size={'large'}>
                      <Button
                        onClick={() => {
                          this.returnList();
                        }}
                      >
                        返回
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={(e) => {
                          this.submit(e, false);
                        }}
                      >
                        保存
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={(e) => {
                          this.submit(e, true);
                        }}
                      >
                        检查
                      </Button>
                    </Space>
                  </div>
                )}
              </Form>
            )}
          </Card>
        </Spin>
      </div>
    );
  }
}
index.propTypes = {
  type: PropTypes.string,
  viewDetail: PropTypes.object,
  Editchange: PropTypes.func,
  _onHandleClose: PropTypes.func,
  _checkedPage: PropTypes.func,
  saveButton: PropTypes.object,
  otherParam: PropTypes.object,
};

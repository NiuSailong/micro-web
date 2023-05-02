import React, { Component } from 'react';
import { Modal, Button, Spin, Input } from 'antd';
import TRNotification from '#/utils/notification';
import { AlertResult, HttpCode } from '#/utils/contacts';
import styles from '../index.less';
import { modelList } from '@/services/iotData';
import FormList from '@/pages/IOTData/component/fromList';
import { getTemplateLeft, PAGE_TYPE, templateRight } from '@/pages/IOTData/helper';

class Template extends Component {
  leftFrom = React.createRef();
  rightFrom = React.createRef();
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      spinning: false,
      rightList: [],
      list: [],
      allList: [],
      leftChoose: { model: props.value },
      allModal: {},
      footer: [
        <Button onClick={this.handleCancel} key={'cancelBtn'}>
          {props.pageState !== PAGE_TYPE.READONLY ? '取消' : '返回'}
        </Button>,
      ],
    };
  }

  async componentDidMount() {
    if (this.props.pageState === PAGE_TYPE.READONLY) {
      const cur = {
        model: this.props.value,
      };
      this.modelLineList(cur);
      this.leftFrom?.current?.setFormList([cur]);
      this.setState({ list: [cur] });
    } else {
      this.getTemplateList();
    }
  }

  getTemplateList = async () => {
    this.setState({ spinning: true });
    let res = await modelList();

    if (res?.statusCode === HttpCode.SUCCESS) {
      let allModal = {};
      let list = [];
      res?.data?.forEach((n) => {
        allModal[n.model] = n.list;
        list.push({
          model: n.model,
        });
      });
      this.setState({ list, allList: list, allModal, spinning: false }, () => {
        this.leftFrom?.current?.setFormList(list);
        const cur = list.filter((n) => n.model + '' === this.props.value + '')[0] || list[0];
        this.modelLineList(cur);
      });
    } else {
      this.setState({ spinning: false });
    }
  };

  handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.props.onPress({ index: AlertResult.CANCEL });
    });
  };

  modelLineList = async (item) => {
    const { value, rightList } = this.props;

    const { allModal } = this.state;
    let resultRight = allModal[item.model] || [];
    if (item.model + '' === value + '') {
      resultRight = rightList || [];
    }

    this.rightFrom?.current?.setFormList(resultRight);
    this.setState({
      rightList: resultRight,
      leftChoose: item,
    });
  };

  rightDelete = async (current, index) => {
    let rightList = await this.rightFrom?.current?.getFormList();
    if (rightList[index].add) {
      rightList = rightList.filter((n, ind) => ind !== index);
    } else {
      rightList[index].deleteFlag = true;
    }
    this.setState({
      rightList,
    });
  };

  rightAdd = async (pasteData, addNum, index, pasteArr) => {
    let arr = await this.rightFrom?.current?.getFormList();
    let pasteIndex = index;
    if (pasteData instanceof Array) {
      pasteData.forEach((n) => {
        let obj = { add: true };
        n.forEach((j, ind) => {
          obj[pasteArr[ind]] = j;
        });
        if (arr[pasteIndex]) {
          arr[pasteIndex] = { ...arr[pasteIndex], ...obj };
          pasteIndex++;
        }
      });
    } else {
      arr = [...arr, { add: true }];
    }

    this.rightFrom?.current?.setFormList(arr);
    this.setState({
      rightList: arr,
    });
  };

  // rightChange = (data,index) => {
  //   let {rightList} = this.state;
  //   rightList[index] = {...data, edit: true}
  //   this.setState({
  //     rightList
  //   });
  // };

  handleOk = async () => {
    let data = await this.rightFrom?.current?.getFormList();
    const { leftChoose } = this.state;
    this.setState({ visible: false, spinning: false }, () => {
      this.props.onPress({
        index: AlertResult.SUCCESS,
        value: leftChoose.model,
        list: data,
      });
    });
  };
  onCodeSearch = (val) => {
    const { allList } = this.state;
    const keyWord = val.trim();
    let list = allList.filter((n) => n.model.indexOf(keyWord) !== -1);

    this.setState(
      {
        list,
      },
      () => {
        this.leftFrom?.current?.setFormList(list);
      },
    );
  };
  render() {
    const { spinning, list, rightList, leftChoose, footer } = this.state;
    const { pageState } = this.props;
    const okBtn = [];
    if (pageState !== PAGE_TYPE.READONLY) {
      okBtn.push(
        <Button disabled={spinning} onClick={this.handleOk} key={'okBtn'} type="primary">
          确定使用
        </Button>,
      );
    }
    return (
      <Modal
        width={'75%'}
        maskClosable={false}
        centered={true}
        closable={false}
        visible={this.state.visible}
        wrapClassName={styles.iotTemplateModal}
        footer={[...okBtn, ...footer]}
        title={<div>模版</div>}
      >
        <Spin spinning={spinning}>
          <div className={styles.iotTemplateModal_content}>
            <div className={styles.iotTemplateModal_left}>
              {pageState !== PAGE_TYPE.READONLY ? (
                <Input.Search
                  style={{ paddingRight: 20, marginBottom: 15 }}
                  onSearch={this.onCodeSearch}
                />
              ) : null}

              <FormList
                list={list}
                id={'left'}
                ref={this.leftFrom}
                config={getTemplateLeft()}
                paddingRight={0}
                hiddenDelete={true}
                rowSelect={'radio'}
                rowKey={'model'}
                radioFn={this.modelLineList}
                hiddenAddBtn={true}
                maxHeight={400}
                titleMarginBottom={0}
                chooseValue={leftChoose.model}
                hiddenMargin={true}
                pageState={PAGE_TYPE.READONLY}
              />
            </div>
            <div className={styles.iotTemplateModal_right}>
              <div className={styles.iotTemplateModal_right_title}>{leftChoose.modelName}</div>
              <FormList
                id={'right'}
                ref={this.rightFrom}
                list={rightList}
                maxHeight={405}
                config={templateRight}
                hiddenMargin={true}
                deleteFn={this.rightDelete}
                paddingRight={15}
                addFn={this.rightAdd}
                pageState={!leftChoose?.model ? PAGE_TYPE.READONLY : pageState}
              />
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}

class AlertModal {
  __key__ = '';

  show = (obj = {}) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <Template
            {...obj}
            onPress={(result) => {
              this.dismiss();
              resolve(result);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = () => {
    TRNotification.remove(this.__key__);
    this.__key__ = '';
  };
}

const tAlert = new AlertModal();
export default tAlert;

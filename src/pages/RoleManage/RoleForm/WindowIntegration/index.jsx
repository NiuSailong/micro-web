import React, { Component } from 'react';
import styles from './index.less';
import { Modal } from 'antd';
import TRNotification from '#/utils/notification';
import { CloseOutlined } from '#/utils/antdIcons';
import RoleUpdate from './components/roleupdate';
import planIcon from '@/assets/img/plan_icon.png';

class LeadingInComponent extends Component {
  static defaultProps = {
    data: [],
    otherParam: '',
    exportModel: '',
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false, //对话框是否可见
      isdisabled: true, //
      loading: false, //是否加载中
      isError: false, //是否有错
      selectIndex: -1,
      fileList: [],
      errorList: [],
      params: {},
    };
    this.refnode = React.createRef();
  }
  componentDidMount() {
    this.setState({
      visible: true,
    });
  }

  _onCheckDisabled() {
    const { data } = this.props;
    if (data.length > 0) {
      const { selectIndex, fileList, isError } = this.state;
      if (selectIndex >= 0 && fileList.length > 0 && !isError) {
        return false;
      }
      return true;
    } else {
      const { fileList, isError } = this.state;
      if (fileList.length > 0 && !isError) {
        return false;
      }
      return false;
    }
  }
  setloading = (val, boolean) => {
    this.setState({
      loading: val,
      visible: boolean,
    });
  };
  async _onOk() {
    /**
     * @注意 使用此模板需要传入refname，直接操作子组件事件
     */
    this.setState({ loading: true });
    await this.refnode.current.update(this.setloading);
  }

  _onCancel() {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { loading, isError, visible } = this.state;
    const { title, width, refname } = this.props;
    return (
      <Modal
        width={width}
        centered={true}
        closable={false}
        okText="提交"
        cancelText="取消"
        className="modalWraps"
        maskClosable={false}
        okButtonProps={{ disabled: this._onCheckDisabled(), loading: loading }}
        open={visible}
        onOk={this._onOk.bind(this)}
        onCancel={this._onCancel.bind(this)}
      >
        <div className={styles.row}>
          <img src={planIcon} />
          <div className={styles.content}>{title || '导入'}</div>
          <div className={styles.suffix} />
          <CloseOutlined className={styles.close} onClick={this._onCancel.bind(this)} />
        </div>
        <div className={`${styles.form} ${isError ? styles.formerror : null}`}>
          {/* 子页面渲染区 */}
          <RoleUpdate ref={refname == 'RoleUpdate' ? this.refnode : null} {...this.props} />
        </div>
      </Modal>
    );
  }
}

/**
 *@params 本页面弹窗框架使用参数（不包含子页面弹窗参数）
 *@title 弹窗名称 类型限定String（必传）
 *@width 弹窗宽度 类型限定Number（必传）
 *@refname ref节点 （必传）
 *@其他参数 为子页面使用参数
 *@propTypes 当前页面参数类型限定如上，子页面进行类型限定
 */
class LeadingInModal {
  __key__ = '';
  show = (params) => {
    try {
      if (!(params instanceof Object)) {
        return Promise.resolve('show方法参数传入错误，默认类型是对象');
      } else {
        if (params.title == '' || params.title == null || params.title == undefined)
          return Promise.resolve('title不能为空,默认String类型');
        if (params.width == 0 || params.width == null || params.width == undefined)
          return Promise.resolve('width不能为空，默认Number类型');
      }
      if (
        params.refname == '' ||
        typeof params.refname != 'string' ||
        params.refname == null ||
        params.refname == undefined
      ) {
        return Promise.resolve('refname ref的节点名称不能为空,不能为数字');
      }
    } catch (error) {
      throw new Error(error);
    }

    return new window.Promise((resolve) => {
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <LeadingInComponent
            {...params}
            onPress={(reslt) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(reslt);
            }}
          />
        ),
        dismiss: this.dismiss,
        duration: null,
      });
    });
  };
  dismiss = () => {
    TRNotification.remove(this.__key__);
    this.__key__ = '';
  };
}
const leadingInModal = new LeadingInModal();
export default leadingInModal;

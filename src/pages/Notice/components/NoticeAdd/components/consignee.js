class Department {
  treeData = [];

  checkTreeArray = [];

  expandTreeArray = [];

  filterList = []; // 部门底下过滤全部人员的值

  personList = [];

  userList = [];

  // 清除方法
  setTreeAndCheckData(array, selectPersonList, filterList) {
    this.treeData = [...array];
    this.checkTreeArray = array.map((n) => String(n.deptId));
    this.personList = selectPersonList;
    this.filterList = [...filterList];
  }

  setCheckTreeList(array) {
    this.checkTreeArray = [...array];
  }

  clear = () => {
    this.treeData = [];
    this.userList = [];
    this.expandTreeArray = [];
    this.checkTreeArray = [];
    this.personList = [];
    this.filterList = [];
  };
}

class Role {
  orginRoleData = [];

  roleData = []; // 角色数据

  roleCheckList = []; // 角色选中数据

  filterList = []; // 部门底下过滤全部人员的值

  personList = [];

  userList = [];

  clear = () => {
    this.orginRoleData = [];
    this.roleData = []; // 角色数据
    this.roleCheckList = []; // 角色选中数据
    this.filterList = []; // 部门底下过滤全部人员的值
    this.personList = [];
    this.userList = [];
  };
}

// 存储收件人相关数据
class Consignee {
  department = new Department();

  role = new Role();

  selectTab = ''; // 所选的tab

  clear = () => {
    this.selectTab = '';
    this.department.clear();
    this.role.clear();
  };
}

export default new Consignee();

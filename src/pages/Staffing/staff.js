class Staff {
  constructor() {
    this.stationList = [];
    this.roleIds = [];
    this.levelList = [];
    this.defultStationId = '';
    this.defultLevelId = '';
    this.userList = [];
  }
  onSetList(sList, lList) {
    this.stationList = sList;
    this.levelList = lList;
  }
  onSetRoleIds(ids) {
    this.roleIds = ids;
  }
  clear() {
    this.stationList = [];
    this.levelList = [];
    this.roleIds = [];
    this.defultStationId = '';
    this.defultLevelId = '';
    this.userList = [];
  }
}

Staff.getInstance = (function () {
  let instance;
  return function () {
    instance = instance ? instance : new Staff();
    return instance;
  };
})();

const TRStaff = Staff.getInstance();

export default TRStaff;

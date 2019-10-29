import _ from 'lodash';

export default class {
  data = [];

  all() {
    return this.data;
  }

  findAllBy(params) {
    return _.filter(this.data, params);
  }

  findBy(params, arg) {
    //    if (findBy === 'id') {
    //      return this.data.find(user => user.id === params);
    //    } else if (findBy === 'nickname') {
    //      return this.data.find(user => user.nickname.toLowerCase() === params.toLowerCase());
    //    } else {
    //      const result = this.findAllBy(params);
    //      return result.length > 0 ? result[0] : null;
    //    }
    switch (arg) {
      case 'id':
        return this.data.find(user => user.id === params);
        break;
      case 'nickname':
        return this.data.find(user => user.nickname.toLowerCase() === params.toLowerCase());
        break;
      default:
        const result = this.findAllBy(params);
        return result.length > 0 ? result[0] : null;
    }
  }

  save(entity) {
    this.data.push(entity);
  }
}


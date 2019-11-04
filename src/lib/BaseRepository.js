import _ from 'lodash';

export default class {
  data = [];

  find(params, arg = 'nickname') {
    switch (arg) {
      case 'nickname':
        return this.data.find((user) => {
          return user.nickname === params.toLowerCase();
        });
        break;
      case 'id':
        return this.data.find(user => user.id === params);
        break;
      case 'default':
        return this.data.find(params);
    }
  }

  findAllBy(params) {
    return _.filter(this.data, params);
  }

  findBy(params) {
    const result = this.findAllBy(params);
    return result.length > 0 ? result[0] : null;
  }

  save(entity) {
    this.data.push(entity);
  }

  all() {
    return this.data;
  }

  numberOfUsers() {
    return this.data.length;
  }
}


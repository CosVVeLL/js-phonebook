import _ from 'lodash';

export default class {
  data = [];

  all() {
    return this.data;
  }

  findById(id) {
    return this.data.find(entity => entity.id === id);
    // if (!result) {
    //   throw new Error('Entity not found');
    // }
  }

  findByNickname(nickname) {
    return this.data.find(user => user.nickname.toLowerCase() === nickname.toLowerCase());
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
}


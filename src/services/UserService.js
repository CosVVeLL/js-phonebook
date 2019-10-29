import validate from 'validate.js';

import ApplicationService from './ApplicationService';

export default class extends ApplicationService {
  createUser(nickname, password) {
    const user = new this.entities.User(nickname, password);
    const errors = this.validate(user);
    if (!errors) {
      delete(user.password);
      this.repositories.User.save(user);
    }
    return [user, errors];
  }

  find(params, arg) {
    if (!arg) {
      return this.repositories.User.findBy(params, 'nickname');
    } else {
      return this.repositories.User.findBy(params, findBy);
    }
  }

  findBy(params) {
    return this.repositories.User.findBy(params);
  }

  numberOfUsers() {
    return this.repositories.User.all().length;
  }
}


import validate from 'validate.js';

import ApplicationService from './ApplicationService';
import { User } from '../entities';

export default class extends ApplicationService {
  createUser(nickname, password) {
    const user = new User(nickname, password);
    const errors = this.validate(user);
    if (!errors) {
      delete(user.password);
      this.UserRepository.save(user);
    }
    return [user, errors];
  }

  find(params, arg) {
    if (!arg) {
      return this.UserRepository.findBy(params, 'nickname');
    } else {
      return this.UserRepository.findBy(params, findBy);
    }
  }

  findBy(params) {
    return this.UserRepository.findBy(params);
  }

  numberOfUsers() {
    return this.UserRepository.all().length;
  }
}


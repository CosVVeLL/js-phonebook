import validate from 'validate.js';
import debug from 'debug';

import ApplicationService from './ApplicationService';
import { User } from '../entities';

const UserServiceLog = debug('http:UserService');

export default class extends ApplicationService {
  createUser(nickname, password) {
    const user = new User(nickname, password);
    const errors = this.validate(user);
    //UserServiceLog(this.validate({
    //  password: 'qwerty',
    //  nickname: 'admin',
    //  repositoryName: 'UserRepository',
    //  constructor: { constraints },
    //}));
    if (!errors) {
      delete(user.password);
      this.UserRepository.save(user);
    }
    return [user, errors];
  }

  find(arg, findBy) {
    if (findBy === 'id') {
      return this.UserRepository.findById(arg);
    } else {
      return this.UserRepository.findByNickname(arg);
    }
  }

  numberOfUsers() {
    return this.UserRepository.all().length;
  }
}


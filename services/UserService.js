import ApplicationService from './ApplicationService';
import { User } from '../entities';

export default class extends ApplicationService {
  createUser(nickname, password) {
    const user = new User(nickname, password);
    const errors = this.validate(user);
    if (!errors) {
      //      delete(user.password);
      this.UserRepository.save(user);
    }
    return [user, errors];
  }

  findUser(arg, findBy) {
    if (findBy === 'id') {
      return this.UserRepository.find(user => user.id === arg);
    }
    return this.UserRepository.find(user => user.nickname.toLowerCase() === arg.toLowerCase());
  }

  numberOfUsers() {
    return this.UserRepository.length;
  }
}


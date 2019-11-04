import validate from 'validate.js';

import ApplicationService from './ApplicationService';

export default class extends ApplicationService {
  createUser(nickname, password, confirmPassword) {
    const user = new this.entities.User(nickname, password, confirmPassword);
    const errors = this.validate(user);
    if (!errors) {
      delete(user.password);
      delete(user.confirmPassword);
      this.repositories.User.save(user);
    }
    return [user, errors];
  }
}


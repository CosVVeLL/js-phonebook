import UUID from 'uuid-js';

import ApplicationEntity from './ApplicationEntity';
import encrypt from '..src/lib/encrypt';

export default class extends ApplicationEntity {
  guest = false;

  static constrains = {
    nickname: {
      presence: true,
      uniqueness: true,
      format: {
        pattern: '[a-zA-Z0-9_-]',
        message: 'can only contain a-z, A-Z, 0-9, _ and -',
      },
      length: {
        minimum: 2,
        maximum: 20,
      },
    },
    password: {
      presence: true,
      length: {
        minimum: 6,
        message: 'must be at least 6 characters',
      },
    },
  };

  constructor(nickname, password) {
    super();
    this.id = UUID.create().toString();
    this.nickname = nickname;
    this.passwordDigest = encrypt(password);
  }

  isGuest() {
    return this.guest;
  }
}


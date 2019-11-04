import ApplicationEntity from './ApplicationEntity';
import encrypt from '../lib/encrypt';

export default class extends ApplicationEntity {
  guest = false;

  static constraints = {
    nickname: {
      presence: {
        allowEmpty: false,
        message: "can't be blank",
      },
      uniqueness: {
        message: 'already exist',
      },
      format: {
        pattern: '[a-zA-Z0-9_-]+',
        message: 'can only contain English alphabet, digits 0 to 9, _ and -',
      },
      length: {
        minimum: 2,
        maximum: 20,
        tooShort: 'nickname must be between 2 and 20 characters',
        tooLong: 'nickname must be between 2 and 20 characters',
      },
    },
    password: {
      presence: {
        allowEmpty: false,
        message: "can't be blank",
      },
      length: {
        minimum: 6,
        message: 'must be at least 6 characters',
      },
    },
    confirmPassword: {
      equality: {
        attribute: 'password',
        message: "^Passwords don't match",
      },
    },
  };

  constructor(nickname, password, confirmPassword) {
    super();
    this.repositoryName = 'User';
    this.nickname = nickname.toLowerCase();
    this.handle = nickname;
    this.passwordDigest = encrypt(password);

    this.password = password;
    this.confirmPassword = confirmPassword;
  }

  isGuest() {
    return this.guest;
  }

  getNickname() {
    return this.nickname;
  }
  getHandle() {
    return this.handle;
  }

  getPasswordDigest() {
    return this.passwordDigest;
  }
}


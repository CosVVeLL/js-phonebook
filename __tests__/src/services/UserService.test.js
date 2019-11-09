import serviceManager from '../../../src/';
import encrypt from '../../../src/lib/encrypt';

describe('UserService', () => {
  let service;
  beforeEach(() => {
    const manager = serviceManager();
    service = manager.services.User;
  });

  it('create user', () => {
    const nickname = 'MegaMan';
    const password = '159Qaz';
    const confirmPassword = '159Qaz';
    const [user] = service.createUser(nickname, password, confirmPassword);
    const expected = {
      nickname: nickname.toLowerCase(),
      handle: nickname,
      passwordDigest: encrypt(password),
    };
    expect(user).toMatchObject(expected);
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('confirmPassword');
  });
});


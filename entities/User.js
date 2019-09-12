export default class User {
  guest = false;

  constructor(nickname, passwordDigest) {
    this.nickname = nickname;
    this.passwordDigest = passwordDigest;
  }

  isGuest() {
    return this.guest;
  }
}


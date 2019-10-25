import ApplicationEntity from './ApplicationEntity';

export default class extends ApplicationEntity {
  guest = true;

  isGuest() {
    return this.guest;
  }
}


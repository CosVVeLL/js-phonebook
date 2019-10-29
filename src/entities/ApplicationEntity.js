import UUID from 'uuid-js';

import BaseEntity from '../lib/BaseEntity';

export default class extends BaseEntity {
  constructor() {
    super()
    this.id = UUID.create().toString();
  }
}


import Bottle from 'bottlejs';

import entities from './entities';
import repositories from './repositories';
import services from './services';
import validator from './lib/validation';

export default () => {
  const bottle = new Bottle();
  bottle.factory('entities', () => entities);
  bottle.factory('repositories', () => (
    Object.keys(repositories).reduce((acc, name) => (
      { ...acc, [name]: new repositories[name]() }
    ), {})
  ));
  bottle.factory('validate', (container) => validator(container));
  bottle.factory('services', (container) => (
    Object.keys(services).reduce((acc, name) => (
      { ...acc, [name]: new services[name](container) }
    ), {})
  ));
  return bottle.container;
};


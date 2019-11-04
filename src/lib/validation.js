import _ from 'lodash';
import validate from 'validate.js';

import BaseEntity from './BaseEntity';

export default ({ repositories }) => {
  const entityValidator = (entity, options = { exceptions: false }) => {
    const errors = validate(entity, entity.constructor.constraints);
    if (errors && options.exception) {
      throw new Error(`${entity} is not valid (${errors})`);
    }
    return errors;
  };

  validate.validators.uniqueness = (value, options, key, attributes) => {
    if (!value) {
      return null;
    }
    const className = attributes.repositoryName;
    const repository = repositories[className];
    const scope = options.scope || [];
    const nickname = options.nickname || '';
    const params = { [key]: value, ..._.pick(attributes, scope) };
    const result = repository.findBy(params);
    const isEntity = result instanceof BaseEntity;
    if (isEntity && result.id !== attributes.id) {
      return 'already exists';
    }
    return null;
  };

  validate.validators.association = (value) => {
    if (!value) {
      return null;
    }
    return entityValidator(value);
  };

  validate.validators.dateObject = (value) => {
    if (!(value instanceof Date)) {
      return 'are not date';
    }
    return null;
  };

  return entityValidator;
};


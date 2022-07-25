'use strict';

module.exports = {
  plugins: {
    options: {
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ response: '*', request: '*' }]
          },
          { module: 'good-console' },
          'stdout'
        ]
      }
    }
  }
};

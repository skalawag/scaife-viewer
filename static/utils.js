const path = require('path');

exports.resolve = function resolve(rest) {
  return path.join(__dirname, rest);
};

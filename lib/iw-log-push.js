'use strict';

const got = require("got");


module.exports = options => {
  return got.post(`${options.host || "127.0.0.1"}:${options.port || 9880}/${options.tag || ""}`, {
    body: JSON.stringify(options.data),
    json: true
  });
};

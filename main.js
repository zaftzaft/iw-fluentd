'use strict';

const path    = require("path");
const Promise = require("bluebird");
const fs      = Promise.promisifyAll(require("fs"));
const co      = require("co");

const parser  = require("./lib/iw-parser");
const logPush = require("./lib/iw-log-push");


function dirParse(options){
  let files = options.files;
  let targetDir = options.targetDir;

  return co(function*(){
    let results = [];

    for(let i = 0, l = files.length;i < l;i++){
      let filename = files[i];

      yield fs.readFileAsync(path.join(targetDir, filename), "utf8")
        .then(parser)
        .then(res => {

          results.push({
            filename: filename,
            date: filename,
            name: options.name || "",
            data: res
          });

        });

    }

    return results;
  });
}


function main(options){
  const targetDir = options.targetDir;
  const PUSHED_PATH = path.join(targetDir, ".pushed.json");

  const prefix = options.prefix || "";
  const name = options.name || require("os").hostname();
  const suffix = options.suffix || "";

  const tag = `${prefix}${name}${suffix}`;

  return Promise.all([
    fs.readdirAsync(path.resolve(targetDir)),

    fs.readFileAsync(PUSHED_PATH, "utf8")
      .then(res => JSON.parse(res))
      .catch(e => Promise.resolve([]))
  ])
  .then(results => {
    let files = results[0];
    let pushed = results[1];


    files = files
      .filter(f => f[0] != ".")
      .filter(f => !pushed.includes(f));

    return {
      files: files,
      pushed: pushed
    };

  })

  .then(res => {
    return dirParse({
      files: res.files,
      targetDir: targetDir,
      name: tag
    })
    .then(parsed => {
      res.parsed = parsed;
      return res;
    });

  })


  .then(res => {
    let parsed = res.parsed;

    return co(function*(){
      for(let i = 0, l = parsed.length;i < l;i++){

        yield logPush({
          data: parsed[i],
          tag: tag
        })
        .then(() => {
          res.pushed.push(parsed[i].filename);
        });

      }
    })
    .then(() => res);

  })

  .then(res => {
    return fs.writeFileAsync(
      PUSHED_PATH,
      JSON.stringify(res.pushed)
    )
    .then(() => res);
  });

}


module.exports = main;

'use strict';

const readline = require("readline");


const parser = source => {
  return new Promise(resolve => {
    let data = [];
    let point = -1;

    if(source === ""){
      return resolve({});
    }

    let lines = source.split("\n");

    lines.forEach(input => {

      if(/^BSS/.test(input)){
        data[++point] = {
          name: input,
          sub:  {}
        };
      }
      else{

        if(/^\t[\w ]+:/.test(input)){
          let f = input.split(":");
          data[point][f[0].trim().toLowerCase()] = f.slice(1).join(":").trim();
          return;
        }

        data[point].sub[input] = 0;
      }

    });

    let results = data.map((info, name) => {
      return {
        ssid:   info.ssid,
        freq:   parseInt(info.freq, 10),
        signal: parseInt(info.signal.split(" ")[0], 10)
      };
    });

    resolve(results);
  });
};


module.exports = parser;

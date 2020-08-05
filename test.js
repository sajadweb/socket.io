const _ = require('lodash');
const { castArray, result } = require('lodash');
const redisClient = require('redis').createClient();
const async = require('async');
// loadash
// var array = ['{ "hello": "world", "hi": "there" }', '{"hi": "there" }'];
// var other = _.concat(array, '{ "nice": "team" }');

// console.log(other);
// // => [1, 2, 3, [4]]

// console.log(_.toString(other));

// console.log(_.toArray(other));

/*-----------------------------------------------------------------------------------------*/

// for (let i = 0; i < 100000; i++) {
//   redisClient.del(i);
// }


//redis
// redisClient.scan(10, "match", "*0*", (err, result) => {
//   console.log(result);

// })
// redisClient.get(0, (err, res) => {
//   console.log(res);
// });



// let cursor = 0;
// async.doWhilst((cb) => {
//   console.log('do');
//   redisClient.scan(cursor, "match", "*111*", (err, result) => {

//     cb(null, result);
//   });

// }, (result, cb) => {
//   console.log(result);
//   if (result[0] == "0") {
//     return cb("finish searching", false);
//   }
//   cursor = result[0];
//   cb(null, true)
// }, (err) => {
//   console.log(err);
// })

/*------------------------------------- */
//async

// async.until((res, cb) => {
//   console.log(cb);
//   res(null, false);
// }, (cbb) => {
//   cbb(null, 'r')
// })

// let start = 0;
// async.doWhilst((cb) => {
//   console.log('do');
//   start++;
//   cb(null, start);
// }, (res, cb) => {
//   console.log(res);
//   cb(null, true)
// }, (err) => {
//   console.log(err);
// })


/**------------------------ */
// const mainn = require('./main').startServer;
// console.log(mainn(require('express')()));
const mainjs = require('./main');
const app = require('express')();
const server = require('http').createServer(app);
mainjs.init(server);
server.listen(7999, () => {
  console.log('started')
})

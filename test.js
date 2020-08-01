const _ = require('lodash');
const { castArray } = require('lodash');
const redisClient = require('redis').createClient();
const async = require('async');
//loadash
// var array = ['{ "hello": "world", "hi": "there" }', '{"hi": "there" }'];
// var other = _.concat(array, '{ "nice": "team" }');

// console.log(other);
// // => [1, 2, 3, [4]]

// console.log(_.toString(other));

// console.log(_.toArray(other));

/*-----------------------------------------------------------------------------------------*/

//redis
// redisClient.scan(10, "match", "*0*", (err, result) => {
//   console.log(result);

// })
// redisClient.get(0, (err, res) => {
//   console.log(res);
// });

// async.forever((next, res) => {
//   console.log(res);
//   let start = 0;
//   redisClient.scan(start, "match", "1*", (err, result) => {
//     console.log(result);
//     if (result[0] == "0") {
//       next("finish scan");
//     } else {
//       start = 60;
//       next(null,);
//     }
//   })
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

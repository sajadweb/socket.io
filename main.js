require('dotenv').config()
const NTypes = require('./model/notifications_type');
const subscriber = require('./redis/sub');
const io = require('./socket/io');



subscriber.subscribe(NTypes.one);
subscriber.subscribe(NTypes.multi);
subscriber.subscribe(NTypes.all);











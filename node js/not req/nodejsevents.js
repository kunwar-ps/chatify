const EventEmitter = require('events');
class MyEmitter extends EventEmitter{}

const my_emitter1 = new MyEmitter();

my_emitter1.on('event1' , ()=> {
	console.log('event occured');
});
  
my_emitter1.emit('event1')
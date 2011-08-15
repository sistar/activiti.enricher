// Quick and dirty prime checking.
Number.prototype.isPrime = function () {
  var i = 2;
  while (i<=this - 1) {
    if (this % i ==0) {
      return false;
      break;
    }
    i++;
  }
  if (i == this) {
    return true;
  }
};

// This object will count up in intervals of 50ms
// and emit a #prime event when a prime number is
// encountered.
function Counter() {
  this.interval   = 50;
  this.currentNum = 0;
}

// Add the EventEmitter to the object.
Counter.prototype = new process.EventEmitter();

// Self explanatory really.
Counter.prototype.count = function() {
  if (this.currentNum.isPrime()) this.emit('prime');
  this.currentNum++;
};

Counter.prototype.run = function() {
  var self = this;
  setInterval(function(){
    self.count();
  },this.interval);
};

var counter = new Counter();

// Listen for the event and output
counter.on('prime',function(){
  console.log(this.currentNum + ' is prime');
});

counter.run();

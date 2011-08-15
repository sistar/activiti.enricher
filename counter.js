var sys = require('sys'),
    rest = require('restler'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    events = require('events');

module.exports = Counter;
function Counter() {
    events.EventEmitter.call(this);
}
// inherit events.EventEmitter
Counter.super_ = events.EventEmitter;
Counter.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Counter,
        enumerable: false
    }
});



// n anforderer
//  parallel = event =>
// 1 entgegennehmer

// 1 aussteller


var fName = 'busines_key_counter.json';
var openRequests = [];
var runningRequest = null;

Counter.prototype.createUniqueBusinessKey = function(cback) {
    var self = this;
    if (runningRequest == null){
        runningRequest = self; //sync
        doUpdate(cback);
    } else {
        openRequests.push(cback);
    }

}


function doUpdate(cback)  {
    path.exists(fName, function(exists) {
        if (!exists) {
            console.log('writing brand new counter to: ' + fName);
            fs.writeFile(fName, JSON.stringify({"maxKey":0}), function(err) {
                if (err) throw err;
                readActKey(cback);
            });
        } else {
            console.log('incrementing counter to: ' + fName);
            readActKey(cback);
        }
    });

}

var actData = null;

function readActKey(cback) {

    if(actData == null){
        fs.readFile(fName, function(err, data) {

            if (err) throw err;
            console.log('read data from file:'+data);
            actData = JSON.parse(data);
            incrementActKey(cback);
        });
    } else {
        incrementActKey(cback);
    }
}

function incrementActKey(cback){
    actData.maxKey = actData.maxKey + 1;
    fs.writeFile(fName, JSON.stringify(actData), function(err) {
        if (err) throw err;
        console.log('incremented data:' + actData.maxKey);

        runningRequest = openRequests.shift();

        if(runningRequest != null){
            doUpdate(runningRequest);
            console.log('succeeding req');
        } else {
            console.log('no Successor req');
        };
            cback(actData);
    });

}



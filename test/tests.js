
this.suite1 = {
    'test array': function (test){
        var openRequests = [];
        openRequests.push('A');
        openRequests.push('B');

        console.log(openRequests.shift());
        console.log(openRequests.shift());
        console.log(openRequests.shift()==null);
        test.done();
    },

    'test one': function (test) {
        var Counter = require('counter');
        var counter = new Counter();
        counter.createUniqueBusinessKey(
                    function(actKey){
                console.log('bk2:'+ actKey.maxKey);
                test.ok(true, 'everythings ok');

            });

        counter.createUniqueBusinessKey(
                    function(actKey){
                console.log('bk3:'+ actKey.maxKey);
                test.ok(true, 'everythings ok');

            });

        setTimeout(function () {
            test.done();
        }, 15);
    },
    'test combo': function(test){
        var Counter = require('counter');
        var Combo = require('combo');
        var counter = new Counter();

        var combo = new Combo(function(a, b) {
                console.dir(a);
                console.dir(b);
                //test.ok(a[0].maxKey + 1 == b[0].maxKey   , 'everythings ok:'+a[0].maxKey + ' '+ b[0].maxKey);
            }
        );

        counter.createUniqueBusinessKey(combo.add());
        counter.createUniqueBusinessKey(combo.add());

        setTimeout(function () {
            test.done();
        }, 15);

    },
    'apples and oranges': function (test) {
        test.equal('apples', 'apples', 'comparing apples and oranges');
        test.done();
    }
};
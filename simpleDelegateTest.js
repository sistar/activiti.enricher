

function hello(name){
   console.log('hello '+name);
}

function invoker(ctx,targetFunction){
    targetFunction.apply(ctx);
}


f = function(){
    hello(name);
}

function b(name){
    self = this;
    self.name = name;
    invoker(this,f);
}

b('ralf');



/**
 * Created by lucifer on 2016/4/27.
 */
var NwBuilder = require('nw-builder');

var nw = new NwBuilder({
    files:'./**',
    platforms:['win32'],
    version:'0.14.2'
});

nw.on('log', console.log);

nw.build().then(function(){
    console.log('all done!!!');
}).catch(function(error){
    console.error(error);
});
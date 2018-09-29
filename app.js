'use strict';
var forever = require('forever');
var child = new (forever.Monitor )('bot.js', {
  //options : options
} );

//These lines actually kicks things off
child.start();
forever.startServer( child );
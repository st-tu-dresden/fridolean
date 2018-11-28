'use strict';

var SwaggerExpress = require('swagger-express-mw');
//var app = require('express')();

function swaggerStart(app){

  var config = {
    appRoot: __dirname // required config
  };

  SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }

    // install middleware
    swaggerExpress.register(app);

    //var port = 10010;
    //app.listen(port);

    console.log("Swagger successfully included!")
  });
}

module.exports = {swaggerStart};

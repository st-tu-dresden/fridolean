'use strict';

//import manager from '../../../project_manager/test'
let util = require('util');


function getTest(req, res) {
  let hello = 'Hello World';

  //manager.hallo.doSomething();

  res.json(hello);
}

function postTest(req, res) {
    console.log(JSON.stringify(req.swagger));

    let foo = `Value of foo: ${req.swagger.params.data.value.foo}`;
    
    res.json(foo);
}

module.exports = {
  getTest,
  postTest
};

'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
var customFormats = module.exports = function(zSchema) {
  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

  /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function(val) {
    return !decimalPattern.test(val.toString());
  });

  /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function(val) {
    // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val);
  });

  zSchema.registerFormat('int64', function(val) {
    return Number.isInteger(val);
  });

  zSchema.registerFormat('float', function(val) {
    // better parsing for custom "float" format
    if (Number.parseFloat(val)) {
      return true;
    } else {
      return false;
    }
  });

  zSchema.registerFormat('date', function(val) {
    // should parse a a date
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('dateTime', function(val) {
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('password', function(val) {
    // should parse as a string
    return typeof val === 'string';
  });
};

customFormats(ZSchema);

var validator = new ZSchema({});
var request = require('request');
var expect = chai.expect;

const {requestUser} = require('./helper');
const user2 = require('./data/user2.json');      
const user3 = require('./data/user3.json');      


describe('/users/{userID}/projects', function() {
  
  let authToken = null;
  let user = null;
  
  before(done => {
    const {requestUser} = require('./helper');
    requestUser(responseJson => {
      authToken = responseJson.token;
      user = responseJson.user;
      done();
    })
  });

  describe('get', function() {
    it('should respond with 200 Success', function(done) {
      /*eslint-disable*/
      var schema = {
        "properties": {
          "projects": {
            "type": "array",
            // "items": {
            //   "properties": {
            //     "_id": {
            //       "type": "string",
            //       "format": "uuid"
            //     },
            //     "title": {
            //       "type": "string"
            //     },
            //     "visibility": {
            //       "type": "string",
            //       "description": "visibility tag like `PUBLIC` or `PRIVATE`"
            //     },
            //     "lastEdited": {
            //       "type": "integer",
            //       "description": "Milliseconds since Unix epoch (Jan 1, 1970)"
            //     },
            //     "description": {
            //       "type": "string"
            //     },
            //     "members": {
            //       "type": "array",
            //       "items": {
            //         "properties": {
            //           "userID": {
            //             "type": "string"
            //           },
            //           "email": {
            //             "type": "string"
            //           },
            //           "rights": {
            //             "type": "string"
            //           }
            //         }
            //       }
            //     }
            //   }
            // }
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/users/' + user.id + '/projects',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 400 Bad Request', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/users/' + user.id + 'bad request' + '/projects',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(400);

        // expect(body).to.equal(null || undefined); // non-json response or no schema
        expect(body).to.deep.equal({ message: 'user id incorrect' });
        
        done();
      });
    });

    it('should respond with 401 Unauthorized', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/users/' + user.id + '/projects',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(body).to.equal(null || undefined); // non-json response or no schema
        done();
      });
    });

    it('should respond with 403 Forbidden', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/users/' + user2._id + '/projects',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(403);

        expect(body).to.equal(null || undefined); // non-json response or no schema
        done();
      });
    });

    it('should respond with 404 Not Found', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/users/' + user3._id + '/projects',
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(404);

        expect(body).to.deep.equal({ message: 'user not found' }); // non-json response or no schema
        done();
      });
    });

    // it('should respond with default Error', function(done) {
    //   /*eslint-disable*/
    //   var schema = {
    //     "required": [
    //       "message"
    //     ],
    //     "properties": {
    //       "message": {
    //         "type": "string"
    //       }
    //     }
    //   };

    //   /*eslint-enable*/
    //   request({
    //     url: 'http://localhost:3001/api/v1/users/' + user.id + '/projects',
    //     json: true,
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + authToken
    //     }
    //   },
    //   function(error, res, body) {
    //     if (error) return done(error);

    //     expect(res.statusCode).to.equal('DEFAULT RESPONSE CODE HERE');

    //     expect(validator.validate(body, schema)).to.be.true;
    //     done();
    //   });
    // });

  });

});

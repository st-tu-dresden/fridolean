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
const project1 = require('./data/project1.json');      
const project2 = require('./data/project2.json');
const project3 = require('./data/project3.json');

const user3 = require('./data/user3.json');
const user2 = require('./data/user2.json');
const user1 = require('./data/user1.json');

describe('/projects/{projectID}/collaborators', function() {

  let authToken = null;
  let user = null;
  before(done => {
    requestUser(responseJson => {
      authToken = responseJson.token;
      // call done to start processing following blocks
      done();
    })


  });

  describe('post', function() {

    it('should respond with 200 Success', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: {
          "email": user2.email,
          "rights": "EDIT"
        }
      },
      function(error, res, body) {
        if (error) return done(error);
        console.log(body);
        expect(res.statusCode).to.equal(200);

        expect(body).to.equal(null || undefined); // non-json response or no schema
        done();
      });
    });

    it('should respond with 400 Bad Request', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: {
          "email": user2.email,
          "rights": "string" // should not be accepted
        }
      },
      function(error, res, body) {
        if (error) return done(error);
        expect(res.statusCode).to.equal(400);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 401 Unauthorized', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' 
        },
        body: {
          "email": user2.email,
          "rights": "EDIT"
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 403 Forbidden', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project2._id + '/collaborators',
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: {
          "email": user2.email,
          "rights": "EDIT"
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(403);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    // it('should respond with 500 Internal Server Error', function(done) {
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
    //     url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
    //     json: true,
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + authToken
    //     },
    //     body: {
    //       data: 'DATA GOES HERE'
    //     }
    //   },
    //   function(error, res, body) {
    //     if (error) return done(error);

    //     expect(res.statusCode).to.equal(500);

    //     expect(validator.validate(body, schema)).to.be.true;
    //     done();
    //   });
    // });

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
    //     url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
    //     json: true,
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + authToken
    //     },
    //     body: {
    //       data: 'DATA GOES HERE'
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

  describe('put', function() {
    
    afterEach(done => {
      //restore db
      const {seedData} = require('./data/seed');
      
      seedData(() => {
          done();        
      });
    })

    it('should respond with 200 Success', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: {
          "email": user1.email,
          "rights": "EDIT" // updated rights
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body).to.equal(null || undefined); // non-json response or no schema
        done();
      });
    });

    it('should respond with 400 Bad Request', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: {
          "email": user1.email,
          "rights": "string" // should be bad request
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(400);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 401 Unauthorized', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '
        },
        body: {
          data: 'DATA GOES HERE'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 403 Forbidden', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project2._id + '/collaborators',
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: {
          "email": user2.email,
          "rights": "EDIT"
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(403);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    // it('should respond with 500 Internal Server Error', function(done) {
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
    //     url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
    //     json: true,
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + authToken
    //     },
    //     body: {
    //       data: 'DATA GOES HERE'
    //     }
    //   },
    //   function(error, res, body) {
    //     if (error) return done(error);

    //     expect(res.statusCode).to.equal(500);

    //     expect(validator.validate(body, schema)).to.be.true;
    //     done();
    //   });
    // });

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
    //     url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
    //     json: true,
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + authToken
    //     },
    //     body: {
    //       data: 'DATA GOES HERE'
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

  describe('delete', function() {

    afterEach(done => {
      //restore db
      const {seedData} = require('./data/seed');
      
      seedData(() => {
          done();        
      });
    })

    it('should respond with 200 Success', function(done) {
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        body: {
          email: user1.email
        },
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(body).to.equal(null || undefined); // non-json response or no schema
        done();
      });
    });

    it('should respond with 400 Bad Request', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        body: {
         //empty body
        },
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(400);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 401 Unauthorized', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
        json: true,
        body: {
          email: user3.email
        },
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(401);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with 403 Forbidden', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:3001/api/v1/projects/' + project2._id + '/collaborators',
        json: true,
        body: {
            "email": user1.email,
        },
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(403);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    // it('should respond with 500 Internal Server Error', function(done) {
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
    //     url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
    //     json: true,
    //     qs: {
    //       email: user3.email
    //     },
    //     method: 'DELETE',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + authToken
    //     }
    //   },
    //   function(error, res, body) {
    //     if (error) return done(error);

    //     expect(res.statusCode).to.equal(500);

    //     expect(validator.validate(body, schema)).to.be.true;
    //     done();
    //   });
    // });

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
    //     url: 'http://localhost:3001/api/v1/projects/' + project1._id + '/collaborators',
    //     json: true,
    //     qs: {
    //       email: user3.email
    //     },
    //     method: 'DELETE',
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

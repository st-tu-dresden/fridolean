const fetch = require('isomorphic-fetch'); /* global fetch */;

const user1 = require('./data/user1.json');


function requestUser(callback) {
    fetch("http://localhost:3001/auth/signin", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // our registered user data
            email: user1.email,
            password: user1.password
        })
      }).then(response => {
          if (response.status === 200) {
              response.json().then(responseJson => {
                  // save the token                    
                  authToken = responseJson.token;
                  user = responseJson.user;
                  //console.log("TOKEN " + authToken);
                  //console.log("USER " + JSON.stringify(user));
                  //console.log("- - - - - - ")
                  callback(responseJson);
              })
    
          } else {
              // failure
              response.json().then(responseJson => {
                  const errors = responseJson.errors ? responseJson.errors : {};
                  errors.summary = responseJson.message;
                  console.log("Failed to log in during testing!");
                  console.log(`Email: ${user1.email}, Password: ${user1.password}`);
              })
          }
      })
      .catch((error) => {
          console.log("Fetch Error: ", error);
      })
}

before(done => {
    console.log("-------------------------------------");
    console.log("---runs once before every testfile---");
    const {seedData} = require('./data/seed');
    
    seedData((status) => {
        done();        
        console.log("-------------------------------------");     
    });
})

after(function() {
    // runs after all tests in this block
    //process.exit();
});

module.exports = {
    requestUser
}
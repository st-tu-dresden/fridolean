# To run the API tests in /client:

1) seed (populate) the database: `node client/data/seed.js` Therefore you need a db connection.

2) run the tests in the /rest folder: `npm test`. To run a specific test use `mocha testfile.js`. 

    The backend(api) server needs to be running.

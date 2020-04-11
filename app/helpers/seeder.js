const Customer = require("../models/customer.model.js");
const faker = require('faker');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

for (let i = 0; i < 10; i++) {
  // Create a Customer
  let name = faker.internet.userName();
  let email = name.toLowerCase() + '@gmail.com';
  let active = getRandomInt(2);

  const customer = new Customer({name, email, active});

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Customer."
      });
    console.log("Customers created successfully");
  });
}

const Order = require("../models/order.model.js");
const faker = require('faker');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


for (let i = 0; i < 20; i++) {
  let number = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
  let payment_status = getRandomInt(2);
  let payment_method = '';
  let status = '';
  if(payment_status === 1){
    payment_method = 'Stripe-card_' + faker.internet.password();
    status = 'completed';
  } else {
    payment_method = null;
    status = 'pending';
  }

  const order = new Order({
    order_number: 'ORD-' + number,
    user_id: 2,
    status: status,
    grand_total: faker.finance.amount(),
    item_count: getRandomInt(10),
    payment_status: payment_status,
    payment_method: payment_method,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    country: faker.address.country(),
    post_code: faker.address.zipCode(),
    phone_number: faker.phone.phoneNumberFormat(),
    notes: faker.lorem.text()
  });

  Order.createOrder(order, (err, data) => {
    if (err){
      console.log(err)
    }
    console.log(data);
  });
}

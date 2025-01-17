const Order = require("../models/order.model.js");
const faker = require('faker');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


for (let i = 0; i < 7; i++) {
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
    view_status: 1,
    user_id: 3,
    status: status,
    grand_total: faker.finance.amount(),
    item_count: /*getRandomInt(10)*/3,
    payment_status: payment_status,
    payment_method: payment_method,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    country: faker.address.country(),
    post_code: faker.address.zipCode(),
    phone_number: faker.phone.phoneNumberFormat(),
    email: faker.internet.email(),
    notes: faker.lorem.text()
  });
let booksInCart = [
  {
    item: {
      id: 86,
      code: 828917,
      name: 'Джерело',
      price: 145,
      authors: 'В.Пелевин',
      genres: 'классика'
    },
    quantity: 2,
    price: 290
  },
  {
    item: {
      id: 89,
      code: 251284,
      name: 'Обіцянка собаки ',
      price: 95.7,
      authors: 'М.Твен',
      genres: 'история'
    },
    quantity: 2,
    price: 191.4
  },
  {
    item: {
      id: 90,
      code: 721365,
      name: 'На запах м`яса ',
      price: 100.7,
      authors: 'С.Джио',
      genres: 'история'
    },
    quantity: 1,
    price: 100.7
  }
];

  Order.createOrder(order, booksInCart, (err, data) => {
    if (err){
      console.log(err)
    }
    console.log(data);
  });
}

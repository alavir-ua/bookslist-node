
// Конструктор
const Cart = function (cart) {
  this.items = cart.items || {};
  this.totalItems = cart.totalItems || 0;
  this.totalPrice = cart.totalPrice || 0;


  this.addBook = (item, id) => {
    let cartItem = this.items[id];

    if (!cartItem) {
      cartItem = this.items[id] = {item: item, quantity: 0, price: 0};
    }
    cartItem.quantity++;
    cartItem.price = cartItem.item.price * cartItem.quantity;
    this.totalItems++;
    function sum() {
      let result = 0;
      for (let i = 0, max = arguments.length; i < max; i++ ) {
        result += arguments[i]*10;
      }
      return result / 10;
    }
    this.totalPrice = sum(this.totalPrice ,cartItem.item.price);
  }

  this.removeBook = (id) => {
    this.totalItems -= this.items[id].quantity;
    function sub() {
      let result = arguments[0]*10;
      for (let i = arguments.length - 1; 0 < i; i-- ) {
        result -= arguments[i]*10;
      }
      return result / 10;
    }
    this.totalPrice = sub(this.totalPrice, this.items[id].price);
    delete this.items[id];
  }

  this.getItems = () => {
    let arr = [];
    for (let id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  }

  this.clear = () => {
    this.items = {};
    this.totalItems = 0;
    this.totalPrice = 0;
  }
};
module.exports = Cart;



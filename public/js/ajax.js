$(function () {
  $(document).on('click', '#addToCart', function (e) {
    e.preventDefault();
    let id = $(this).attr("data-id");
    $.ajax({
      type: 'GET',
      url: '/cart/add/' + id,
      success: function (result) {
        let count = result.count;
        $('#cart-count').text(count);
      }
    });
  });

  $(document).on('click', '#delFromCart', function (e) {
    e.preventDefault(e);
    let id = $(this).attr("data-id");
    $.ajax({
      type: 'GET',
      url: '/cart/remove/' + id,
      success: function (result) {

        let count = result.count;
        let items = result.booksInCart;
        let totalPrice = result.totalPrice;
        let html = '';

        if (count !== 0) {
          items.forEach(function (book) {
            html += '<tr>' + '<td>' + book.item.code + '</td>' +
              '<td>' + `<a href="/view/${book.item.id}">` + book.item.name + '</a></td>' +
              '<td>' + book.price + '</td>' +
              '<td>' + book.quantity + '</td>' +
              '<td>' + `<a id="delFromCart" data-id="${book.item.id}" href="#">` + '<i class="fa fa-times"></i></a></td></tr>';
          });
          html += '<tr><td colspan="4">Общая стоимость, ₴:</td>' +
            '<td>' + totalPrice + '</td></tr>';
          $('tbody').html(html);
          $('#cart-count').text(count);
        } else {
          html = '<h4>Корзина пуста</h4><br>\n' +
            '\n' +
            '          <a class="btn btn-default checkout" href="/"><i class="fa fa-shopping-cart"></i> Вернуться к покупкам</a>';
          $('#cartBlock').html(html);
          $('#cart-count').text(count);
        }
      }
    });
  });

  $(document).on('click', '#clearCart', function (e) {
    e.preventDefault();
    $.ajax({
      type: 'GET',
      url: '/cart/clear',
      success: function (result) {
        let count = result.count;
        html = '<h4>Корзина пуста</h4><br>\n' +
          '\n' +
          '          <a class="btn btn-default checkout" href="/"><i class="fa fa-shopping-cart"></i> Вернуться к покупкам</a>';
        $('#cartBlock').html(html);
        $('#cart-count').text(count);
      }
    });
  });

  $(document).on('submit', '#registerForm', function (e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/user/register',
      data: {
        name: $('#name').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        confirmPassword: $('#confirmPassword').val()
      },
      success: function () {
        console.log('Register successful');
        window.location.href = '/user/cabinet';
      },
      error: function (data) {
        $('#error-group').css('display', 'block');
        let errors = JSON.parse(data.responseText);
        let errorsList = '';
        for (let i = 0; i < errors.length; i++) {
          errorsList += '<li>' + '*&nbsp' + errors[i].msg + '</li>';
        }
        $('#errors').html(errorsList);
      }
    });
  });
});

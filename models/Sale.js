<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Продажи - <%= seller %> (<%= point %>)</title>
  <script>
    function submitSales() {
      const sales = [];
      document.querySelectorAll('.product-row').forEach(row => {
        const productId = row.dataset.id;
        const qty = parseInt(row.querySelector('input[type=number]').value) || 0;
        sales.push({ product_id: productId, quantity: qty });
      });
      fetch('/sales', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          seller: "<%= seller %>",
          point: "<%= point %>",
          sales: sales
        })
      }).then(r => r.json())
        .then(data => {
          if(data.success){
            alert('Продажи сохранены');
            document.querySelectorAll('.product-row input[type=number]').forEach(i => i.value = 0);
          } else {
            alert('Ошибка: ' + data.error);
          }
        });
      return false;
    }
  </script>
</head>
<body>
  <h1>Продажи продавца: <%= seller %> (точка: <%= point %>)</h1>
  <form onsubmit="return submitSales()">
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr><th>Товар</th><th>Цена</th><th>Количество</th></tr>
      </thead>
      <tbody>
        <% products.forEach(p => { %>
          <tr class="product-row" data-id="<%= p.id %>">
            <td><%= p.name %></td>
            <td><%= p.price %> р.</td>
            <td><input type="number" min="0" value="0" /></td>
          </tr>
        <% }) %>
      </tbody>
    </table>
    <button type="submit">Отправить продажи</button>
  </form>
  <br />
  <a href="/">Вернуться к входу</a>
</body>
</html>

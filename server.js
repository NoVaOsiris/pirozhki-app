const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// SQLite DB
const db = new sqlite3.Database('./sales.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

// Создаём таблицы, если нет
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    price REAL NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    point TEXT NOT NULL,
    seller TEXT NOT NULL,
    sale_date TEXT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    point TEXT NOT NULL,
    opening_balance INTEGER NOT NULL,
    receipts INTEGER NOT NULL,
    transfers INTEGER NOT NULL,
    write_off INTEGER NOT NULL,
    closing_balance INTEGER NOT NULL,
    stock_date TEXT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
});

// Константы торговых точек
const points = ['Мечникова', 'Бородинка', 'Меркурий', 'Почта', 'Обжорка', 'Пышка', 'Клио'];

// Вход продавца (выбор точки и имя)
app.get('/', (req, res) => {
  res.render('index', { points });
});

app.post('/login', (req, res) => {
  const { seller, point } = req.body;
  if (!seller || !point || !points.includes(point)) {
    return res.status(400).send('Неверные данные');
  }
  // Редирект к форме продаж с параметрами
  res.redirect(`/sales?seller=${encodeURIComponent(seller)}&point=${encodeURIComponent(point)}`);
});

// Страница для продаж
app.get('/sales', (req, res) => {
  const { seller, point } = req.query;
  if (!seller || !point) return res.redirect('/');
  db.all('SELECT * FROM products ORDER BY name', [], (err, products) => {
    if (err) return res.status(500).send(err.message);
    res.render('sales', { seller, point, products });
  });
});

// Принять продажу (список товаров + кол-во)
app.post('/sales', (req, res) => {
  const { seller, point, sales } = req.body;
  /*
    sales = [{ product_id: 1, quantity: 3 }, { product_id: 2, quantity: 0 }, ...]
    quantity может быть 0 или больше
  */
  if (!seller || !point || !Array.isArray(sales)) {
    return res.status(400).json({ error: 'Неверные данные' });
  }
  const saleDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  const stmt = db.prepare(`INSERT INTO sales (product_id, quantity, point, seller, sale_date) VALUES (?, ?, ?, ?, ?)`);
  db.serialize(() => {
    sales.forEach(({ product_id, quantity }) => {
      quantity = parseInt(quantity, 10);
      if (quantity > 0) {
        stmt.run(product_id, quantity, point, seller, saleDate);
      }
    });
    stmt.finalize();
  });

  res.json({ success: true, message: 'Продажи сохранены' });
});

// Админка - управление товарами и отчет
app.get('/admin', (req, res) => {
  // Получаем все товары + цены
  db.all('SELECT * FROM products ORDER BY name', [], (err, products) => {
    if (err) return res.status(500).send(err.message);
    // Отчёт продаж (группировка по точкам и дням)
    const sql = `
      SELECT point, sale_date, products.name, SUM(quantity) as total_qty, SUM(quantity * price) as total_sum
      FROM sales
      JOIN products ON sales.product_id = products.id
      GROUP BY point, sale_date, products.name
      ORDER BY sale_date DESC, point, products.name
    `;
    db.all(sql, [], (err2, salesReport) => {
      if (err2) return res.status(500).send(err2.message);
      res.render('admin', { products, salesReport, points });
    });
  });
});

// Добавить или изменить товар (админка)
app.post('/admin/product', (req, res) => {
  const { id, name, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Заполните все поля' });

  if (id) {
    // Обновить
    db.run(`UPDATE products SET name = ?, price = ? WHERE id = ?`, [name, price, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } else {
    // Добавить новый
    db.run(`INSERT INTO products (name, price) VALUES (?, ?)`, [name, price], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  }
});

// Удалить товар (админка)
app.post('/admin/product/delete', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Нет ID' });
  db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

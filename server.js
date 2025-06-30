const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./sales.db');

// 🔄 Обновление/создание таблиц базы данных
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT,
    item TEXT,
    quantity INTEGER,
    seller TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS lunch_breaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller TEXT,
    date TEXT,
    start_time TEXT,
    end_time TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller TEXT,
    date TEXT,
    type TEXT,         -- 'поступление' или 'перемещение'
    item TEXT,
    quantity INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS daily_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller TEXT,
    date TEXT,
    item TEXT,
    quantity INTEGER
  )`);
});


db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    time TEXT,
    item TEXT,
    quantity INTEGER
)`);

function login() {
  const select = document.getElementById('sellerName');
  const seller = select.value;
  if (!seller || seller === "Выберите вашу точку") {
    alert("Пожалуйста, выберите точку продаж");
    return;
  }
  localStorage.setItem('seller', seller);
  showSalesUI();
}
<script>
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("seller", data.seller); // например "Мечникова"
    showSalesUI();
  } else {
    alert("Неверный логин или пароль");
  }
}
</script>
const users = [
  { username: "mechnikova", password: "1234", seller: "Мечникова" },
  { username: "borodinka", password: "1234", seller: "Бородинка" },
  { username: "merkury", password: "1234", seller: "Меркурий" },
  { username: "pochta", password: "1234", seller: "Почта" },
  { username: "obzhorka", password: "1234", seller: "Обжорка" },
  { username: "pyshka", password: "1234", seller: "Пышка" },
  { username: "klio", password: "1234", seller: "Клио" },
];

app.post('/sale', (req, res) => {
    const { item, quantity } = req.body;
    const time = new Date().toISOString();
    db.run('INSERT INTO sales (time, item, quantity) VALUES (?, ?, ?)', [time, item, quantity]);
    res.sendStatus(200);
});

app.get('/admin', (req, res) => {
    db.all('SELECT * FROM sales ORDER BY time DESC', [], (err, rows) => {
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

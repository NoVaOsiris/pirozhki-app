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

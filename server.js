const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./sales.db');

db.serialize(() => {
    // Таблицы
    db.run(`CREATE TABLE IF NOT EXISTS sellers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    price INTEGER NOT NULL
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    sale_time TEXT NOT NULL,
    FOREIGN KEY(seller_id) REFERENCES sellers(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    opening_balance INTEGER DEFAULT 0,
    receipt INTEGER DEFAULT 0,
    transfer INTEGER DEFAULT 0,
    write_off INTEGER DEFAULT 0,
    closing_balance INTEGER DEFAULT 0,
    FOREIGN KEY(seller_id) REFERENCES sellers(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

    // Добавление точек и админа (если нет)
    const sellers = [
        { name: "mechnikova", password: "1234", role: "seller" },
        { name: "borodinka", password: "1234", role: "seller" },
        { name: "merkury", password: "1234", role: "seller" },
        { name: "pochta", password: "1234", role: "seller" },
        { name: "obzhorka", password: "1234", role: "seller" },
        { name: "pyshka", password: "1234", role: "seller" },
        { name: "klio", password: "1234", role: "seller" },
        { name: "admin", password: "admin", role: "admin" },
    ];
    sellers.forEach(s => {
        db.run(`INSERT OR IGNORE INTO sellers (name, password, role) VALUES (?, ?, ?)`, [s.name, s.password, s.role]);
    });

    // Добавление товаров (по твоему списку)
    const products = [
        { name: "Самса", price: 18 },
        { name: "Конверт Мясо", price: 15 },
        { name: "Конверт Творог", price: 15 },
        { name: "Конверт Капуста", price: 15 },
        { name: "Штрудель Мясо/грибы", price: 16 },
        { name: "Пирожок печеный мясо", price: 8 },
        { name: "Пирожок печеный творог", price: 8 },
        { name: "Пирожок печеный капуста", price: 8 },
        { name: "Пицца", price: 16 },
        { name: "Ежик сырный", price: 13 },
        { name: "Сосиска в тесте печеная", price: 11 },
        { name: "Пирога", price: 20 },
        { name: "Мини вет/сыр/зел", price: 6 },
        { name: "Мини брын/творог", price: 6 },
        { name: "Мини мясо", price: 6 },
        { name: "Лодочка колб/сыр", price: 18 },
        { name: "Лодочка грудка/гриб", price: 18 },
        { name: "Синнанбон грудка/грибы", price: 18 },
        { name: "Синнабон ветчина/брынза", price: 18 },
        { name: "Шашлык куриный", price: 25 },
        { name: "Гусарка", price: 16 },
        { name: "Колосок сосиска/сыр", price: 17 },
        { name: "Сэндвич", price: 16 },
        { name: "Плацинда мясо/картошка", price: 18 },
        { name: "Плацинда брынза/творог", price: 18 },
        { name: "Плацинда капуста", price: 18 },
        { name: "Беляш", price: 10 },
        { name: "Сосиска в тесте жареная", price: 10 },
        { name: "Пирожки жар. капуста", price: 7 },
        { name: "Пирожки жарен. картошка", price: 7 },
        { name: "Котлета жаренная", price: 10 },
        { name: "Круассан шоколад", price: 15 },
        { name: "Круассан кокос", price: 15 },
        { name: "Мини абрикос", price: 6 },
        { name: "Мини клубника", price: 6 },
        { name: "Пончик с кремом", price: 18 },
        { name: "Крендель", price: 11 },
        { name: "Штрудель Вишня", price: 16 },
        { name: "Штрудель Яблоко", price: 13 },
        { name: "Булочка «Маковый рай»", price: 16 },
        { name: "Булочка школьная", price: 7 },
        { name: "Чебурек мясо", price: 15 },
        { name: "Чебурек брынза", price: 15 },
        { name: "Осетинский пирог", price: 15 },
        { name: "Кармашек", price: 15 },
    ];
    products.forEach(p => {
        db.run(`INSERT OR IGNORE INTO products (name, price) VALUES (?, ?)`, [p.name, p.price]);
    });
});

// Корень
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API - логин
app.post('/api/login', (req, res) => {
    const { name, password } = req.body;
    db.get(`SELECT * FROM sellers WHERE name = ? AND password = ?`, [name, password], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!row) return res.status(401).json({ error: 'Неверные данные' });
        res.json({ id: row.id, name: row.name, role: row.role });
    });
});

// API - получить товары
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products ORDER BY name`, (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(rows);
    });
});

// API - добавить/редактировать товар (только админ)
app.post('/api/products', (req, res) => {
    const { id, name, price } = req.body;
    if (id) {
        db.run(`UPDATE products SET name = ?, price = ? WHERE id = ?`, [name, price, id], function (err) {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.json({ success: true });
        });
    } else {
        db.run(`INSERT INTO products (name, price) VALUES (?, ?)`, [name, price], function (err) {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.json({ success: true, id: this.lastID });
        });
    }
});

// API - удалить товар (только админ)
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ success: true });
    });
});

// API - оформить продажу
app.post('/api/sales', (req, res) => {
    const { seller_id, items } = req.body; // items = [{product_id, quantity}]
    const sale_time = new Date().toISOString();
    if (!items || items.length === 0) return res.status(400).json({ error: 'Нет товаров' });

    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO sales (seller_id, product_id, quantity, sale_time) VALUES (?, ?, ?, ?)`);
        items.forEach(item => {
            stmt.run(seller_id, item.product_id, item.quantity, sale_time);
        });
        stmt.finalize(err => {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.json({ success: true });
        });
    });
});

// API - получить продажи (фильтр по точке и дате)
app.get('/api/sales', (req, res) => {
    const { seller_id, date } = req.query;
    let sql = `SELECT sales.id, sales.quantity, sales.sale_time, sellers.name as seller_name, products.name as product_name, products.price 
             FROM sales JOIN sellers ON sales.seller_id = sellers.id 
             JOIN products ON sales.product_id = products.id`;
    const conditions = [];
    const params = [];
    if (seller_id) {
        conditions.push('sales.seller_id = ?');
        params.push(seller_id);
    }
    if (date) {
        conditions.push('date(sale_time) = ?');
        params.push(date);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY sale_time DESC';

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

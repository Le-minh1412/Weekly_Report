--quản lí dồ ăn --
CREATE TABLE products (
    id INT  PRIMARY KEY,
    status TINYINT(1) NOT NULL,
    title VARCHAR(255) NOT NULL,
    img VARCHAR(255),
    category VARCHAR(100),
    price INT NOT NULL,
    description TEXT
);
--admin --
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    status TINYINT,
    join_date DATETIME,
    user_type TINYINT
);

--cart--
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, product_id)
);
--Đơn hàng--
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_method VARCHAR(20), 
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    delivery_address TEXT,
    note TEXT,
    total_price INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status INT DEFAULT 0 
);
--Chi tiết--
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit INT NOT NULL, 
    note TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
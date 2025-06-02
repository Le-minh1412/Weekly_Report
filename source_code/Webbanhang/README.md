--Link trang chủ : http://localhost/Webbanhang/index.php
(chứa tài khoản , sản phẩm , chi tiết sản phẩm ,tin tức , liên hệ, giỏ hàng , thanh toán ,...)
--Link trang quản lí : http://localhost/Webbanhang/admin.php
(quản lí người dùng , sản phẩm, đơn đặt hàng , thống kê... ) ,trang này không thể mở trực tiếp nếu không đăng nhập admin

--Các bước tiến hành thực hiện (demo bằng xampp , quản lí dữ liệu trên phpmyadmin)

Tải về dự án về ,thay kết nối file php/connect.php để cấu hình 
(nếu để mặc định là  $servername = "localhost";  $username = "root" $password=""; thì không cần cấu hình lại ) 

Dùng câu truy vấn sau trên http://localhost/phpmyadmin: 
    CREATE DATABASE webbanhang CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci ;
để tạo csdl có tên webbanhang trong phpmyadmin;
Tạo các bảng bằng câu lệnh có trong sql/shop.sql

Truy cập vào link http://localhost/Webbanhang/php/save_products.php (file save_products.php này chứa danh sách sản phẩm và
mục đích là lưu danh sách dữ liệu sản phẩm vào phpmyadmin , sau khi có admin thì có thể xử lí bằng giao diện thêm để lưu)
Quá trình lưu csdl vào phpmyadmin có thể bị trễ nên có thể load lại cả trang http://localhost/phpmyadmin và http://localhost/Webbanhang/index.php
để hiển thị sản phẩm lên

Phần đăng kí tài khoản khi đăng kí thành công phải đăng nhập lại mới vào được tài khoản mục đích là cho người dùng ghi nhớ tài khoản và mật khẩu 

Tài khoản admin có thể tự tạo bằng câu lệnh sau trên http://localhost/phpmyadmin khi truy vấn :
    INSERT INTO users (fullname, phone, password, user_type, status, join_date)
    VALUES ('Admin ', '0123456789', '123456', 1, 1, NOW());
Vì admin sẽ có kiểu user_type=1
Từ đó ta có tài khoản admin để quản lí :  0123456789 , mk: 123456
Khi đăng nhập vào admin sẽ có phần hiển thị lên ở phần tài khoản quản lí cửa hàng , click vào sẽ xem được quản lí cửa hàng 


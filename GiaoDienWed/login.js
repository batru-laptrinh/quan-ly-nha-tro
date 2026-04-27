const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

function thucHienDangNhap() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user === '' || pass === '') return alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
    
    fetch("http://localhost:5062/api/TaiKhoan/dangnhap", {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ Username: user, Password: pass })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (data.role === 'admin') window.location.href = "admin.html"; 
            else if (data.role === 'user') window.location.href = "user.html?room=" + data.room; 
        } else alert('❌ ' + data.message);
    }).catch(err => alert('🚨 Lỗi kết nối! Server C# đang tắt.'));
}

document.getElementById('password').addEventListener('keypress', function (e) { 
    if (e.key === 'Enter') thucHienDangNhap(); 
});

function moQuenMatKhau() { 
    document.getElementById('rs-phong').value = ""; 
    document.getElementById('rs-sdt').value = ""; 
    document.getElementById('rs-email').value = ""; 
    document.getElementById('modal-quen-mk').style.display = 'flex'; 
}

function dongQuenMatKhau() { 
    document.getElementById('modal-quen-mk').style.display = 'none'; 
}

async function xuLyPhucHoi() {
    const phong = document.getElementById('rs-phong').value.trim();
    const sdt = document.getElementById('rs-sdt').value.trim();
    const email = document.getElementById('rs-email').value.trim();
    
    if(!phong || !sdt || !email) return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
    
    try {
        const res = await fetch("https://localhost:5062/api/quenmatkhau", { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ TenPhong: phong, SoDienThoai: sdt, Email: email }) 
        });
        if(res.ok) { 
            alert(`✅ Yêu cầu khôi phục mật khẩu đã gửi thành công!`); 
            dongQuenMatKhau(); 
        }
    } catch (error) { 
        alert("❌ Lỗi kết nối C#!"); 
    }
}
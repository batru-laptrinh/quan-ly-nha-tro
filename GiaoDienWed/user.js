const API_PHONG = "https://ungrudged-bibliographically-jayla.ngrok-free.dev/api/phong"; 
const API_HOADON = "https://ungrudged-bibliographically-jayla.ngrok-free.dev/api/hoadon"; 
const API_YEUCAU = "https://ungrudged-bibliographically-jayla.ngrok-free.dev/api/yeucau";
const API_CAIDAT = "https://ungrudged-bibliographically-jayla.ngrok-free.dev/api/caidat";
const API_NGUOITHUE = "https://ungrudged-bibliographically-jayla.ngrok-free.dev/api/nguoithue"; 

const reqOpt = { headers: { 'ngrok-skip-browser-warning': 'true' } };

let phongHienTai = null;
let caiDatHeThong = null;
let tatCaHoaDonCuaToi = []; 

function formatTien(tien) { return new Intl.NumberFormat('vi-VN').format(tien) + " đ"; }

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme_htt', isDark ? 'dark' : 'light');
    updateDarkModeButton(isDark);
}

function updateDarkModeButton(isDark) {
    const btn = document.getElementById('btn-toggle-dark');
    if(isDark) {
        btn.innerHTML = '<i class="fas fa-sun" style="color: #fbbf24;"></i> Light Mode';
    } else {
        btn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme_htt');
    if(savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateDarkModeButton(true);
    }
}

checkSavedTheme();

setInterval(() => {
    document.getElementById('real-clock').innerText = new Date().toLocaleTimeString('vi-VN');
}, 1000);

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tenPhongTuURL = urlParams.get('room');
    if(!tenPhongTuURL) {
        window.location.href = "login.html";
        return;
    }
    try {
        const resP = await fetch(API_PHONG, reqOpt); 
        const dsPhong = await resP.json();
        phongHienTai = dsPhong.find(p => p.soPhong.toUpperCase() === tenPhongTuURL.toUpperCase());
        if(!phongHienTai) {
            window.location.href = "login.html";
            return;
        }
        try {
            const resCD = await fetch(API_CAIDAT, reqOpt);
            if(resCD.ok) caiDatHeThong = await resCD.json();
        } catch(e) {}
        document.getElementById('loading-screen').style.display = "none";
        document.getElementById('app-content').style.display = "block";
        renderGiaoDienDashboard();
    } catch(e) {
        document.getElementById('loading-screen').innerHTML = `<div style="color: #ef4444;">LỖI KẾT NỐI SERVER</div>`;
    }
}

async function renderGiaoDienDashboard() {
    let tenP = phongHienTai.soPhong.toUpperCase().startsWith("P.") ? phongHienTai.soPhong : "P." + phongHienTai.soPhong;
    document.getElementById('txt-room-number').innerText = tenP;
    document.getElementById('info-sophong').innerText = tenP;
    document.getElementById('info-giaphong').innerText = formatTien(phongHienTai.giaThue);
    try {
        const resNT = await fetch(API_NGUOITHUE, reqOpt);
        if(resNT.ok) {
            const dsNguoiThue = await resNT.json();
            const khachHienTai = dsNguoiThue.find(nt => nt.maPhong === phongHienTai.maPhong);
            if(khachHienTai) {
                document.getElementById('info-nguoithue').innerText = khachHienTai.hoTen;
                document.getElementById('info-tiencoc').innerText = formatTien(khachHienTai.tienCoc || 0);
                if(khachHienTai.nguoiOGhep) {
                    try {
                        let dsOghep = JSON.parse(khachHienTai.nguoiOGhep);
                        if(Array.isArray(dsOghep) && dsOghep.length > 0) {
                            document.getElementById('info-oghep').innerText = dsOghep.map(og => og.ten).join(", ");
                        } else {
                            document.getElementById('info-oghep').innerText = "Không có";
                        }
                    } catch(e) { document.getElementById('info-oghep').innerText = "Không có"; }
                } else {
                    document.getElementById('info-oghep').innerText = "Không có";
                }
            } else {
                document.getElementById('info-nguoithue').innerText = "-";
                document.getElementById('info-tiencoc').innerText = "0 đ";
                document.getElementById('info-oghep').innerText = "Không có";
            }
        }
    } catch(e) {}

    try {
        const resYC = await fetch(API_YEUCAU, reqOpt);      
        if(resYC.ok) {
            const dsTatCaYeuCau = await resYC.json();
            const lsKhuVuc = document.getElementById('khu-vuc-lich-su');
            const yeuCauCuaPhong = dsTatCaYeuCau.filter(yc => yc.maPhong === phongHienTai.maPhong);
            if(yeuCauCuaPhong.length > 0) {
                lsKhuVuc.innerHTML = "";
                yeuCauCuaPhong.forEach(yc => {
                    let d = new Date(yc.ngayGui).toLocaleDateString('vi-VN');
                    let b = yc.trangThai === "Đã xong" ? "done" : "wait";
                    lsKhuVuc.innerHTML += `<div class="history-item"><span class="date">${d}</span><span class="content">${yc.noiDung}</span><span class="badge-stt ${b}">${yc.trangThai}</span></div>`;
                });
            }
        }
    } catch(e) {}

    try {
        const resHD = await fetch(API_HOADON, reqOpt);
        if (resHD.ok) {
            const tatCaHoaDon = await resHD.json();
            tatCaHoaDonCuaToi = tatCaHoaDon.filter(hd => hd.maPhong === phongHienTai.maPhong);
        }
    } catch(e) {
        tatCaHoaDonCuaToi = [];
    }
    
    const khuVucBill = document.getElementById('khu-vuc-hoadon');
    const hopChonThang = document.getElementById('box-chon-thang');
    const selectThang = document.getElementById('thang-hoa-don');
    const khuVucLichSu = document.getElementById('khu-vuc-lich-su-thanh-toan');

    if(tatCaHoaDonCuaToi.length === 0) {
        khuVucBill.innerHTML = `<div class="empty-state">Bạn chưa có hóa đơn nào.</div>`;
        hopChonThang.style.display = 'none';
        khuVucLichSu.style.display = 'none';
        return;
    }

    tatCaHoaDonCuaToi.sort((a, b) => {
        let [mA, yA] = a.thangNam.split('/');
        let [mB, yB] = b.thangNam.split('/');
        return new Date(yB, mB - 1) - new Date(yA, mA - 1);
    });

    hopChonThang.style.display = 'flex';
    selectThang.innerHTML = "";
    tatCaHoaDonCuaToi.forEach(hd => {
        let option = document.createElement('option');
        option.value = hd.maHoaDon;
        let textTrangThai = hd.trangThai === "Đã đóng" ? " - Đã TT" : " - CHƯA ĐÓNG";
        option.text = `Tháng ${hd.thangNam} ${textTrangThai}`;
        selectThang.appendChild(option);
    });

    renderHoaDonChiTiet(tatCaHoaDonCuaToi[0].maHoaDon);
    renderLichSuThanhToan();
}

function renderHoaDonTheoThang() {
    const maHD = parseInt(document.getElementById('thang-hoa-don').value);
    renderHoaDonChiTiet(maHD);
}

function renderHoaDonChiTiet(maHD) {
    const hd = tatCaHoaDonCuaToi.find(h => h.maHoaDon === maHD);
    const khuVucBill = document.getElementById('khu-vuc-hoadon');
    let soDien = hd.soDienMoi - hd.soDienCu;
    let soNuoc = hd.soNuocMoi - hd.soNuocCu;
    let tienDien = soDien * hd.donGiaDien;
    let tienNuoc = soNuoc * hd.donGiaNuoc;
    let giaPhongGoc = hd.giaThue > 0 ? hd.giaThue : phongHienTai.giaThue;
    let tongTien = giaPhongGoc + tienDien + tienNuoc;
    let isPaid = hd.trangThai === "Đã đóng";
    let statusClass = isPaid ? "paid" : "unpaid";
    let iconStatus = isPaid ? "fa-check" : "fa-hourglass-half";
    let nutThanhToan = isPaid ? '' : `<button class="btn-pay-green" onclick="moModalQR(${tongTien}, '${hd.thangNam}')"><i class="fas fa-credit-card"></i> Thanh Toán</button>`;

    khuVucBill.innerHTML = `
        <div class="bill-box">
            <div class="bill-left">
                <div class="total-label">Tổng thanh toán:</div>
                <div class="total-amount">${formatTien(tongTien)}</div>
                <div class="status-text ${statusClass}"><i class="fas ${iconStatus}"></i> ${hd.trangThai}</div>
                ${nutThanhToan}
            </div>
            <div class="bill-right">
                <div class="room-fee-row"><span>Tiền phòng gốc:</span><strong>${formatTien(giaPhongGoc)}</strong></div>
                <div class="usage-grid">
                    <div class="usage-box elec">
                        <h4><i class="fas fa-bolt"></i> Chi Tiết Điện</h4>
                        <div class="usage-row">
                            <div class="usage-calc"><strong>${soDien} số</strong><br>Mới: ${hd.soDienMoi} - Cũ: ${hd.soDienCu}</div>
                            <div class="usage-price">${formatTien(tienDien)}</div>
                        </div>
                    </div>
                    <div class="usage-box water">
                        <h4><i class="fas fa-tint"></i> Chi Tiết Nước</h4>
                        <div class="usage-row">
                            <div class="usage-calc"><strong>${soNuoc} khối</strong><br>Mới: ${hd.soNuocMoi} - Cũ: ${hd.soNuocCu}</div>
                            <div class="usage-price">${formatTien(tienNuoc)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLichSuThanhToan() {
    const tbody = document.getElementById('bang-lich-su-thanh-toan');
    tbody.innerHTML = '';
    tatCaHoaDonCuaToi.forEach(hd => {
        let soDien = hd.soDienMoi - hd.soDienCu;
        let soNuoc = hd.soNuocMoi - hd.soNuocCu;
        let tienDien = soDien * hd.donGiaDien;
        let tienNuoc = soNuoc * hd.donGiaNuoc;
        let giaPhongGoc = hd.giaThue > 0 ? hd.giaThue : phongHienTai.giaThue;
        let tongTien = giaPhongGoc + tienDien + tienNuoc;
        let isPaid = hd.trangThai === "Đã đóng";
        let badgeClass = isPaid ? "badge-stt done" : "badge-stt wait";
        let colorAmount = isPaid ? '#10b981' : '#ef4444';
        tbody.innerHTML += `<tr><td style="font-weight: 600;">#HD${hd.maHoaDon}</td><td><strong>${hd.thangNam}</strong></td><td class="col-right" style="font-weight: bold; color: ${colorAmount};">${formatTien(tongTien)}</td><td class="col-center"><span class="${badgeClass}">${hd.trangThai}</span></td></tr>`;
    });
}

function moModalQR(tongTien, thangNam) {
    if(!caiDatHeThong || !caiDatHeThong.nganHang || !caiDatHeThong.soTaiKhoan) return;
    let tenP = phongHienTai.soPhong.toUpperCase().replace("P.", "");
    let noiDungCK = `Thanh toan tien phong P${tenP} thang ${thangNam}`.replace(/\//g, '');
    let bankCode = caiDatHeThong.nganHang.trim();
    let accountNo = caiDatHeThong.soTaiKhoan.trim();
    let accountName = caiDatHeThong.tenChuTaiKhoan.trim();
    let qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${tongTien}&addInfo=${noiDungCK}&accountName=${accountName}`;
    document.getElementById('img-qr-code').src = qrUrl;
    document.getElementById('qr-tong-tien').innerText = formatTien(tongTien);
    document.getElementById('qr-chu-tk').innerText = accountName;
    document.getElementById('qr-so-tk').innerText = accountNo;
    document.getElementById('qr-ngan-hang').innerText = bankCode;
    document.getElementById('modal-qr').style.display = 'flex';
}

async function guiYeuCauHoTro() {
    const noiDung = document.getElementById('txt-yeu-cau').value.trim();
    if(!noiDung) return;
    const data = { maPhong: phongHienTai.maPhong, noiDung: noiDung };
    try {
        await fetch(API_YEUCAU, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, 
            body: JSON.stringify(data) 
        });
        alert("Đã gửi báo cáo cho quản lý!");
        document.getElementById('txt-yeu-cau').value = ""; 
        document.getElementById('modal-hotro').style.display = 'none';
        renderGiaoDienDashboard(); 
    } catch (e) {}
}

function dangXuat() {
    if(confirm("Đăng xuất?")) {
        window.location.href = "login.html";
    }
}
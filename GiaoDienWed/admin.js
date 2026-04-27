const API_PHONG = "http://localhost:5062/api/phong"; 
const API_QUENMK = "http://localhost:5062/api/quenmatkhau";
const API_NGUOITHUE = "http://localhost:5062/api/nguoithue"; 
const API_HOADON = "http://localhost:5062/api/hoadon"; 
const API_YEUCAU = "http://localhost:5062/api/yeucau";

let cheDoHienTai = 'them', currentIdPhong_Sua = null, currentIdXoa = null, loaiXoa = null;
let cheDoNguoiThue = 'them', currentIdNguoiThue_Sua = null, currentIdPhong_HoaDon = null;
let tatCaDuLieuPhong = [], tatCaNguoiThue = [], tatCaHoaDon = [], tatCaYeuCau = [];

function formatTien(tien) { return new Intl.NumberFormat('vi-VN').format(tien) + " đ"; }

function chuyenTab(idTabCanMo, element, titleName) { 
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); 
    document.getElementById(idTabCanMo).classList.add('active'); 
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    if(element) element.classList.add('active');
    if(titleName) document.getElementById('pageTitle').innerText = titleName;
    document.querySelector('.content-container').scrollTo(0, 0); 
}

async function loadDuLieuTuSQL() {
    try {
        const resPhong = await fetch(API_PHONG); 
        if(resPhong.ok) tatCaDuLieuPhong = await resPhong.json();
        const resNT = await fetch(API_NGUOITHUE); 
        if(resNT.ok) tatCaNguoiThue = await resNT.json();
        tatCaDuLieuPhong.forEach(p => { 
            const coKhach = tatCaNguoiThue.some(nt => nt.maPhong === p.maPhong);
            p.trangThai = coKhach ? "Đã thuê" : "Trống";
        });
        let countTrong = 0, countThue = 0;
        tatCaDuLieuPhong.forEach(p => { if(p.trangThai === "Trống") countTrong++; else countThue++; });
        document.getElementById("count-tong").innerText = tatCaDuLieuPhong.length; 
        document.getElementById("count-trong").innerText = countTrong; 
        document.getElementById("count-thue").innerText = countThue;
        xuLyLocDuLieu();
        veBangNguoiThue(tatCaNguoiThue);
        const datalist = document.getElementById('danh-sach-phong-datalist'); datalist.innerHTML = "";
        tatCaDuLieuPhong.forEach(p => { let tenP = p.soPhong.toUpperCase().startsWith("P.") ? p.soPhong : "P." + p.soPhong; datalist.innerHTML += `<option value="${tenP}">`; });
    } catch (error) {}

    try {
        const resHD = await fetch(API_HOADON); 
        if(resHD.ok) { 
            tatCaHoaDon = await resHD.json(); 
            veBangHoaDon(tatCaHoaDon); 
            tinhToanDoanhThu(); 
        }
    } catch(e) {}

    try {
        const resYC = await fetch(API_YEUCAU); 
        if(resYC.ok) { tatCaYeuCau = await resYC.json(); veBangYeuCau(tatCaYeuCau); }
    } catch(e) {}

    try {
        const resMK = await fetch(API_QUENMK); 
        if(resMK.ok) {
            const dsQuenMK = await resMK.json();
            const tbodyMK = document.getElementById("bang-quen-mk"); tbodyMK.innerHTML = "";
            dsQuenMK.forEach(mk => { 
                let tenP = mk.tenPhong.trim().toUpperCase(); if (!tenP.startsWith("P.")) tenP = tenP.startsWith("P") ? "P." + tenP.substring(1) : "P." + tenP;
                tbodyMK.innerHTML += `<tr><td>#YC${mk.maYeuCau}</td><td class="text-center"><strong>${tenP}</strong></td><td class="text-center">${mk.soDienThoai}</td><td>${mk.email}</td><td class="text-center"><span class="badge-status pending">Chờ cấp</span></td><td class="text-center"><button class="row-action-btn" title="Đã giải quyết" onclick="xoaYeuCauMK(${mk.maYeuCau})"><i class="fas fa-check" style="color:#38a169"></i></button></td></tr>`; 
            });
        }
    } catch(e) {}
}

function inHopDong(idKhach) {
    const khach = tatCaNguoiThue.find(x => x.maNguoiThue == idKhach);
    if(!khach) return alert("Lỗi: Không tìm thấy dữ liệu khách thuê!");
    const phong = tatCaDuLieuPhong.find(p => p.maPhong == khach.maPhong);
    let tenPhong = "P.---";
    let giaPhong = "0 đ";
    if(phong) {
        tenPhong = phong.soPhong.toUpperCase().startsWith("P.") ? phong.soPhong.toUpperCase() : "P." + phong.soPhong.toUpperCase();
        giaPhong = formatTien(phong.giaThue);
    }
    const today = new Date();
    document.getElementById('hd-ngay').innerText = today.getDate().toString().padStart(2, '0');
    document.getElementById('hd-thang').innerText = (today.getMonth() + 1).toString().padStart(2, '0');
    document.getElementById('hd-nam').innerText = today.getFullYear();
    document.getElementById('hd-ten-khach').innerText = khach.hoTen.toUpperCase();
    document.getElementById('hd-ky-ten-b').innerText = khach.hoTen;
    document.getElementById('hd-cccd').innerText = khach.cccd || ".........................";
    document.getElementById('hd-sdt').innerText = khach.soDienThoai || ".........................";
    document.getElementById('hd-so-phong').innerText = tenPhong;
    document.getElementById('hd-gia-phong').innerText = giaPhong;
    const element = document.getElementById('mau-hop-dong');
    alert(`⏳ Đang tạo Hợp đồng cho phòng ${tenPhong}. Vui lòng đợi vài giây...`);
    const opt = {
        margin:       0.8,
        filename:     `Hop_Dong_Thue_Phong_${tenPhong}_${khach.hoTen.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function tinhToanDoanhThu() {
    let tongThucThu = 0, tongDangNo = 0, dtThangNay = 0;
    let date = new Date();
    let thangHienTai = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getFullYear();
    let thongKeThang = {};
    tatCaHoaDon.forEach(hd => {
        let soDien = hd.soDienMoi - hd.soDienCu;
        let soNuoc = hd.soNuocMoi - hd.soNuocCu;
        let tongTienHD = hd.giaThue + (soDien * hd.donGiaDien) + (soNuoc * hd.donGiaNuoc);
        if (!thongKeThang[hd.thangNam]) thongKeThang[hd.thangNam] = { tongHD: 0, daThu: 0, chuaThu: 0 };
        thongKeThang[hd.thangNam].tongHD += tongTienHD;
        if (hd.trangThai === "Đã đóng") {
            tongThucThu += tongTienHD;
            thongKeThang[hd.thangNam].daThu += tongTienHD;
            if (hd.thangNam === thangHienTai) dtThangNay += tongTienHD;
        } else {
            tongDangNo += tongTienHD;
            thongKeThang[hd.thangNam].chuaThu += tongTienHD;
        }
    });
    document.getElementById("dt-thucthu").innerText = formatTien(tongThucThu);
    document.getElementById("dt-dangno").innerText = formatTien(tongDangNo);
    document.getElementById("dt-thangnay").innerText = formatTien(dtThangNay);
    let tbody = document.getElementById("bang-doanh-thu"); tbody.innerHTML = "";
    let cacThang = Object.keys(thongKeThang).sort((a, b) => {
        let [mA, yA] = a.split('/'); let [mB, yB] = b.split('/');
        return new Date(yB, mB - 1) - new Date(yA, mA - 1);
    });
    if(cacThang.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 40px; color: #a0aec0;">Chưa có dữ liệu.</td></tr>`;
        return;
    }
    cacThang.forEach(thang => {
        let d = thongKeThang[thang];
        let phanTram = d.tongHD > 0 ? Math.round((d.daThu / d.tongHD) * 100) : 0;
        let mauTienDo = phanTram === 100 ? '#38a169' : (phanTram > 0 ? '#dd6b20' : '#e53e3e');
        tbody.innerHTML += `<tr><td class="text-center"><strong>Tháng ${thang}</strong></td><td class="text-right" style="color:#4a5568; font-weight:600;">${formatTien(d.tongHD)}</td><td class="text-right" style="color:#38a169; font-weight:bold">${formatTien(d.daThu)}</td><td class="text-right" style="color:#e53e3e; font-weight:bold">${formatTien(d.chuaThu)}</td><td class="text-center"><div style="background: #edf2f7; border-radius: 10px; height: 8px; width: 100px; margin: 0 auto; overflow: hidden; position: relative;"><div style="background: ${mauTienDo}; height: 100%; width: ${phanTram}%;"></div></div><div style="font-size:11px; color:#718096; margin-top:4px; font-weight:600;">Đã thu ${phanTram}%</div></td></tr>`;
    });
}

function xuLyLocDuLieu() {
    const tuKhoa = document.getElementById('searchRoom').value.toLowerCase();
    const trangThaiLoc = document.getElementById('filterStatus').value;
    const duLieuDaLoc = tatCaDuLieuPhong.filter(p => { return p.soPhong.toLowerCase().includes(tuKhoa) && ((trangThaiLoc === 'all') || (p.trangThai === trangThaiLoc)); });
    veBangDuLieu(duLieuDaLoc);
}

function veBangDuLieu(danhSach) {
    const tbody = document.getElementById("bang-du-lieu-phong"); tbody.innerHTML = ""; 
    if(danhSach.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 40px; color: #a0aec0;">Không tìm thấy phòng!</td></tr>`; return; }
    danhSach.forEach((p, index) => {
        let statusBadgeClass = p.trangThai === "Trống" ? "empty" : "rented";
        let formatTenPhong = p.soPhong.trim().toUpperCase(); if (!formatTenPhong.startsWith("P.")) formatTenPhong = "P." + formatTenPhong;
        tbody.innerHTML += `<tr><td class="text-center">${index + 1}</td><td class="text-center"><strong>${formatTenPhong}</strong></td><td class="text-right col-price">${new Intl.NumberFormat('vi-VN').format(p.giaThue)} đ</td><td class="text-center"><span class="badge-status ${statusBadgeClass}">${p.trangThai}</span></td><td class="text-center"><button class="row-action-btn" onclick="moPopupChiTiet(${p.maPhong}, '${formatTenPhong}', ${p.giaThue}, '${p.trangThai}')"><i class="fas fa-eye" style="color:#805ad5"></i></button><button class="row-action-btn" onclick="moPopupHoaDon(${p.maPhong}, '${formatTenPhong}')"><i class="fas fa-bolt" style="color:#dd6b20"></i></button><button class="row-action-btn" onclick="moPopupSua(${p.maPhong}, '${formatTenPhong}', ${p.giaThue}, '${p.trangThai}')"><i class="fas fa-pen" style="color:#3182ce"></i></button><button class="row-action-btn btn-row-delete" onclick="moPopupConfirmXoa(${p.maPhong}, 'phong')"><i class="fas fa-trash"></i></button></td></tr>`; 
    }); 
}

async function xuLyLuuPhong() { 
    const pData = { soPhong: document.getElementById('in-so-phong').value.trim(), giaThue: Number(document.getElementById('in-gia-thue').value), trangThai: document.getElementById('in-trang-thai').value }; 
    if (!pData.soPhong || !pData.giaThue) return alert("Nhập đủ thông tin!"); 
    if (cheDoHienTai === 'them') await fetch(API_PHONG, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pData) }); 
    else await fetch(`${API_PHONG}/${currentIdPhong_Sua}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pData) }); 
    dongTatCaPopup(); loadDuLieuTuSQL(); 
}

function moPopupThem() { cheDoHienTai = 'them'; document.getElementById('popup-title').innerText = "Thêm Phòng Mới"; document.getElementById('in-so-phong').value = ""; document.getElementById('in-gia-thue').value = ""; document.getElementById('in-trang-thai').value = "Trống"; document.getElementById('khu-vuc-doi-tt').style.display = 'none'; document.getElementById('popup-nhap-lieu').style.display = 'flex'; }
function moPopupSua(id, so, gia, tt) { cheDoHienTai = 'sua'; currentIdPhong_Sua = id; document.getElementById('popup-title').innerText = "Sửa: " + so; document.getElementById('in-so-phong').value = so; document.getElementById('in-gia-thue').value = gia; document.getElementById('in-trang-thai').value = tt; document.getElementById('khu-vuc-doi-tt').style.display = 'block'; document.getElementById('popup-nhap-lieu').style.display = 'flex'; }

function moPopupChiTiet(maPhong, tenPhong, giaThue, trangThai) { 
    document.getElementById('hs-ten-phong').innerText = tenPhong; 
    const khuVucHienThi = document.getElementById('khu-vuc-hoso-noidung'); 
    let khachThue = tatCaNguoiThue.find(nt => nt.maPhong === maPhong); 
    if (trangThai === "Trống" || !khachThue) { 
        khuVucHienThi.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fas fa-door-open" style="font-size: 50px; color: #cbd5e0; margin-bottom: 20px;"></i><h3 style="color: #4a5568;">Phòng đang trống!</h3></div>`; 
    } else { 
        let hoaDonMoiNhat = tatCaHoaDon.find(hd => hd.maPhong === maPhong); 
        let dienCu = 0, dienMoi = 0, soDien = 0, nuocCu = 0, nuocMoi = 0, soNuoc = 0, giaDien = 3000, giaNuoc = 15000, tienDien = 0, tienNuoc = 0, tongCong = giaThue; 
        if(hoaDonMoiNhat) { 
            dienCu = hoaDonMoiNhat.soDienCu; dienMoi = hoaDonMoiNhat.soDienMoi; soDien = dienMoi - dienCu; 
            nuocCu = hoaDonMoiNhat.soNuocCu; nuocMoi = hoaDonMoiNhat.soNuocMoi; soNuoc = nuocMoi - nuocCu; 
            giaDien = hoaDonMoiNhat.donGiaDien; giaNuoc = hoaDonMoiNhat.donGiaNuoc; 
            tienDien = soDien * giaDien; tienNuoc = soNuoc * giaNuoc; tongCong = giaThue + tienDien + tienNuoc; 
        } 
        let tableOGhep = ""; 
        if(khachThue.nguoiOGhep) { 
            try { 
                let dsOghep = JSON.parse(khachThue.nguoiOGhep); 
                if(Array.isArray(dsOghep) && dsOghep.length > 0) { 
                    dsOghep.forEach(og => { tableOGhep += `<tr><td><strong>${og.ten}</strong></td><td>${og.sdt || '-'}</td><td>${og.cccd || '-'}</td></tr>`; }); 
                } else { tableOGhep = `<tr><td colspan="3" style="text-align:center;">Chưa có người ở ghép</td></tr>`; } 
            } catch(e) { tableOGhep = `<tr><td colspan="3" style="text-align:center;">Chưa có người ở ghép</td></tr>`; } 
        } else { tableOGhep = `<tr><td colspan="3" style="text-align:center;">Chưa có người ở ghép</td></tr>`; } 
        khuVucHienThi.innerHTML = `<div class="profile-grid"><div class="profile-card"><h4>Đại Diện Thuê</h4><div class="info-row"><span class="lbl">Họ tên:</span> <span class="val">${khachThue.hoTen}</span></div><div class="info-row"><span class="lbl">SĐT:</span> <span class="val">${khachThue.soDienThoai || '-'}</span></div><div class="info-row"><span class="lbl">CCCD:</span> <span class="val">${khachThue.cccd || '-'}</span></div><div class="info-row"><span class="lbl">Tiền gốc:</span> <span class="val">${formatTien(giaThue)}</span></div></div><div class="profile-card blue-top"><h4>Chỉ số gần nhất</h4>${hoaDonMoiNhat ? `<div class="calc-row"><div style="display:flex; justify-content:space-between;"><span>Điện</span><span>${soDien} số</span></div><div class="money">${formatTien(tienDien)}</div></div><div class="calc-row"><div style="display:flex; justify-content:space-between;"><span>Nước</span><span>${soNuoc} khối</span></div><div class="money">${formatTien(tienNuoc)}</div></div><div class="info-row"><span class="lbl">TỔNG CỘNG:</span> <span class="val">${formatTien(tongCong)}</span></div>` : `<p style="text-align:center;">Chưa có hóa đơn.</p>`}</div></div><div class="profile-card"><h4>Danh sách ở ghép</h4><table><thead><tr><th>Họ Tên</th><th>SĐT</th><th>CCCD</th></tr></thead><tbody>${tableOGhep}</tbody></table></div>`; 
    } 
    document.getElementById('popup-ho-so-phong').style.display = 'flex'; 
}

function locTimKiemNguoiThue() {
    const tuKhoa = document.getElementById('searchNguoiThue').value.toLowerCase();
    const ketQua = tatCaNguoiThue.filter(nt => nt.hoTen.toLowerCase().includes(tuKhoa) || (nt.soDienThoai && nt.soDienThoai.includes(tuKhoa)));
    veBangNguoiThue(ketQua);
}

function veBangNguoiThue(danhSach) {
    const tbody = document.getElementById("bang-nguoi-thue"); tbody.innerHTML = ""; 
    if(danhSach.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="text-center">Chưa có khách.</td></tr>`; return; } 
    danhSach.forEach((nt, index) => { 
        let phongCuaKhach = tatCaDuLieuPhong.find(p => p.maPhong == nt.maPhong); 
        let tenPhong = phongCuaKhach ? (phongCuaKhach.soPhong.toUpperCase().startsWith("P.") ? phongCuaKhach.soPhong.toUpperCase() : "P." + phongCuaKhach.soPhong.toUpperCase()) : "Trống"; 
        let hienThiOGhep = `-`; 
        if(nt.nguoiOGhep) { try { let dsOghep = JSON.parse(nt.nguoiOGhep); if(Array.isArray(dsOghep) && dsOghep.length > 0) hienThiOGhep = dsOghep.map(og => `• ${og.ten}`).join('<br>'); } catch(e) {} } 
        tbody.innerHTML += `<tr><td class="text-center">${index + 1}</td><td><strong>${nt.hoTen}</strong></td><td>${nt.soDienThoai || '-'}<br>${nt.cccd || '-'}</td><td>${hienThiOGhep}</td><td class="text-center"><span class="badge-status rented">${tenPhong}</span></td><td class="text-center"><button class="row-action-btn" onclick="inHopDong(${nt.maNguoiThue})"><i class="fas fa-file-pdf" style="color:#e53e3e"></i></button><button class="row-action-btn" onclick="moPopupSuaNguoiThue(${nt.maNguoiThue})"><i class="fas fa-pen" style="color:#3182ce"></i></button><button class="row-action-btn btn-row-delete" onclick="moPopupConfirmXoa(${nt.maNguoiThue}, 'nguoithue')"><i class="fas fa-trash"></i></button></td></tr>`; 
    }); 
}

function themDongNguoiOGhep(ten = '', sdt = '', cccd = '') { 
    const container = document.getElementById('container-nguoi-oghep'); 
    const idDocNhat = 'og_' + Date.now() + Math.floor(Math.random() * 100); 
    const dongHTML = `<div class="dong-oghep" id="${idDocNhat}"><input type="text" class="og-ten" placeholder="Họ Tên" value="${ten}" style="flex: 2;"><input type="text" class="og-sdt" placeholder="SĐT" value="${sdt}" style="flex: 1.5;"><input type="text" class="og-cccd" placeholder="CCCD" value="${cccd}" style="flex: 1.5;"><button type="button" class="btn-remove-oghep" onclick="xoaDongNguoiOGhep('${idDocNhat}')"><i class="fas fa-times"></i></button></div>`; 
    container.insertAdjacentHTML('beforeend', dongHTML); 
    container.scrollTop = container.scrollHeight; 
}

function xoaDongNguoiOGhep(idDong) { const dongCanXoa = document.getElementById(idDong); if(dongCanXoa) dongCanXoa.remove(); }

function moPopupThemNguoiThue() { cheDoNguoiThue = 'them'; document.getElementById('popup-nt-title').innerText = "Thêm Khách Mới"; document.getElementById('in-nt-ten').value = ""; document.getElementById('in-nt-sdt').value = ""; document.getElementById('in-nt-cccd').value = ""; document.getElementById('in-nt-phong-text').value = ""; document.getElementById('container-nguoi-oghep').innerHTML = ""; document.getElementById('popup-nguoi-thue').style.display = 'flex'; }

function moPopupSuaNguoiThue(idKhach) { 
    const nt = tatCaNguoiThue.find(x => x.maNguoiThue == idKhach); 
    if(!nt) return; 
    cheDoNguoiThue = 'sua'; currentIdNguoiThue_Sua = idKhach; 
    document.getElementById('popup-nt-title').innerText = "Sửa: " + nt.hoTen; 
    document.getElementById('in-nt-ten').value = nt.hoTen; document.getElementById('in-nt-sdt').value = nt.soDienThoai; document.getElementById('in-nt-cccd').value = nt.cccd; 
    let phong = tatCaDuLieuPhong.find(p => p.maPhong == nt.maPhong); document.getElementById('in-nt-phong-text').value = phong ? (phong.soPhong.toUpperCase().startsWith("P.") ? phong.soPhong.toUpperCase() : "P." + phong.soPhong.toUpperCase()) : ''; 
    document.getElementById('container-nguoi-oghep').innerHTML = ""; 
    if(nt.nguoiOGhep) { try { let dsOghep = JSON.parse(nt.nguoiOGhep); if(Array.isArray(dsOghep)) dsOghep.forEach(og => themDongNguoiOGhep(og.ten, og.sdt, og.cccd)); } catch(e) {} } 
    document.getElementById('popup-nguoi-thue').style.display = 'flex'; 
}

async function xuLyLuuNguoiThue() { 
    const tenPhongNhapVao = document.getElementById('in-nt-phong-text').value.trim().toUpperCase(); 
    let phongTimThay = tatCaDuLieuPhong.find(p => { let tp = p.soPhong.toUpperCase().startsWith("P.") ? p.soPhong.toUpperCase() : "P." + p.soPhong.toUpperCase(); return tp === tenPhongNhapVao || p.soPhong.toUpperCase() === tenPhongNhapVao; }); 
    if(!phongTimThay) return alert("❌ Số phòng không tồn tại!"); 
    const dsOghepHTML = document.querySelectorAll('.dong-oghep'); let mangOghep = []; 
    dsOghepHTML.forEach(dong => { let t = dong.querySelector('.og-ten').value.trim(); let s = dong.querySelector('.og-sdt').value.trim(); let c = dong.querySelector('.og-cccd').value.trim(); if(t || s || c) mangOghep.push({ ten: t, sdt: s, cccd: c }); }); 
    const data = { hoTen: document.getElementById('in-nt-ten').value.trim(), soDienThoai: document.getElementById('in-nt-sdt').value.trim(), cccd: document.getElementById('in-nt-cccd').value.trim(), nguoiOGhep: JSON.stringify(mangOghep), maPhong: phongTimThay.maPhong }; 
    if(!data.hoTen) return; 
    try { 
        if(cheDoNguoiThue === 'them') await fetch(API_NGUOITHUE, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }); 
        else await fetch(`${API_NGUOITHUE}/${currentIdNguoiThue_Sua}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }); 
        dongTatCaPopup(); loadDuLieuTuSQL(); 
    } catch(e) {} 
}

function locTimKiemHoaDon() {
    const tuKhoa = document.getElementById('searchHoaDon').value.toLowerCase();
    const ketQua = tatCaHoaDon.filter(hd => hd.thangNam.toLowerCase().includes(tuKhoa) || hd.soPhong.toLowerCase().includes(tuKhoa));
    veBangHoaDon(ketQua);
}

function veBangHoaDon(danhSach) {
    const tbody = document.getElementById("bang-hoa-don"); tbody.innerHTML = "";
    if(danhSach.length === 0) return;
    danhSach.forEach(hd => {
        let tenPhong = hd.soPhong.toUpperCase().startsWith("P.") ? hd.soPhong.toUpperCase() : "P." + hd.soPhong.toUpperCase();
        let soDien = hd.soDienMoi - hd.soDienCu; let tienDien = soDien * hd.donGiaDien; 
        let soNuoc = hd.soNuocMoi - hd.soNuocCu; let tienNuoc = soNuoc * hd.donGiaNuoc; 
        let tongTien = hd.giaThue + tienDien + tienNuoc;
        let badgeClass = hd.trangThai === "Đã đóng" ? "success" : "pending";
        tbody.innerHTML += `<tr><td class="text-center">#HD${hd.maHoaDon}</td><td class="text-center"><strong>${tenPhong}</strong></td><td class="text-center">${hd.thangNam}</td><td class="text-center">${soDien} số</td><td class="text-center">${soNuoc} khối</td><td class="text-right col-price">${formatTien(tongTien)}</td><td class="text-center"><span class="badge-status ${badgeClass}">${hd.trangThai}</span></td><td class="text-center"><button class="row-action-btn btn-row-delete" onclick="moPopupConfirmXoa(${hd.maHoaDon}, 'hoadon')"><i class="fas fa-trash"></i></button></td></tr>`;
    });
}

function moPopupHoaDon(idPhong, tenPhong) { 
    currentIdPhong_HoaDon = idPhong; document.getElementById('ten-phong-hd').innerText = tenPhong; 
    let date = new Date(); let thangNay = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getFullYear();
    document.getElementById('hd-thang').value = thangNay; 
    document.getElementById('hd-dien-cu').value = ""; document.getElementById('hd-dien-moi').value = ""; 
    document.getElementById('hd-nuoc-cu').value = ""; document.getElementById('hd-nuoc-moi').value = ""; 
    document.getElementById('popup-hoadon').style.display = 'flex'; 
}

async function xuLyLuuHoaDon() { 
    const hdData = { maPhong: currentIdPhong_HoaDon, thangNam: document.getElementById('hd-thang').value, soDienCu: Number(document.getElementById('hd-dien-cu').value), soDienMoi: Number(document.getElementById('hd-dien-moi').value), soNuocCu: Number(document.getElementById('hd-nuoc-cu').value), soNuocMoi: Number(document.getElementById('hd-nuoc-moi').value) }; 
    if(!hdData.thangNam || hdData.soDienMoi <= hdData.soDienCu || hdData.soNuocMoi <= hdData.soNuocCu) return;
    try { 
        await fetch(API_HOADON, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hdData) }); 
        dongTatCaPopup(); 
        chuyenTab('tab-hoadon', document.querySelectorAll('.menu-item')[2], 'Hóa Đơn Hàng Tháng'); 
        loadDuLieuTuSQL(); 
    } catch(e) {}
}

function xuatExcelHoaDon() {
    if(tatCaHoaDon.length === 0) return;
    let dataToExport = [["Mã HĐ", "Phòng", "Tháng", "Số Điện", "Tiền Điện", "Số Nước", "Tiền Nước", "Tiền Phòng", "TỔNG TIỀN", "Trạng Thái"]];
    tatCaHoaDon.forEach(hd => {
        let soDien = hd.soDienMoi - hd.soDienCu, soNuoc = hd.soNuocMoi - hd.soNuocCu;
        let tDien = soDien * hd.donGiaDien, tNuoc = soNuoc * hd.donGiaNuoc;
        dataToExport.push(["#HD" + hd.maHoaDon, hd.soPhong, hd.thangNam, soDien, tDien, soNuoc, tNuoc, hd.giaThue, hd.giaThue + tDien + tNuoc, hd.trangThai]);
    });
    let ws = XLSX.utils.aoa_to_sheet(dataToExport);
    let wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Bang_Ke");
    XLSX.writeFile(wb, `DoanhThu.xlsx`);
}

function veBangYeuCau(danhSach) {
    const tbody = document.getElementById("bang-yeu-cau"); tbody.innerHTML = "";
    if(danhSach.length === 0) return;
    danhSach.forEach((yc, index) => {
        let tenP = yc.soPhong.toUpperCase().startsWith("P.") ? yc.soPhong : "P." + yc.soPhong;
        let ngayGui = new Date(yc.ngayGui).toLocaleDateString('vi-VN');
        let badge = yc.trangThai === "Đã xong" ? `<span class="badge-status success">Đã xong</span>` : `<span class="badge-status pending">Đang chờ</span>`;
        let nutXuLy = yc.trangThai === "Đã xong" ? `<button class="row-action-btn btn-row-delete" onclick="moPopupConfirmXoa(${yc.maYeuCau}, 'yeucau')"><i class="fas fa-trash"></i></button>` : `<button class="row-action-btn" onclick="xacNhanSuaXong(${yc.maYeuCau})"><i class="fas fa-check"></i></button>`;
        tbody.innerHTML += `<tr><td class="text-center">${index + 1}</td><td class="text-center"><strong>${tenP}</strong></td><td>${yc.noiDung}</td><td class="text-center">${ngayGui}</td><td class="text-center">${badge}</td><td class="text-center">${nutXuLy}</td></tr>`;
    });
}

async function xacNhanSuaXong(id) { if(confirm("Xác nhận đã sửa xong?")) { await fetch(`${API_YEUCAU}/xuly/${id}`, { method: 'PUT' }); loadDuLieuTuSQL(); } }
async function xoaYeuCauMK(id) { if(confirm("Xác nhận?")) { await fetch(`${API_QUENMK}/${id}`, { method: 'DELETE' }); loadDuLieuTuSQL(); } }

function moPopupConfirmXoa(id, loai) { currentIdXoa = id; loaiXoa = loai; document.getElementById('popup-confirm-xoa').style.display = 'flex'; }

document.getElementById('btn-xac-nhan-xoa').onclick = async function() { 
    try { 
        if(loaiXoa === 'phong') await fetch(`${API_PHONG}/${currentIdXoa}`, { method: 'DELETE' }); 
        else if(loaiXoa === 'nguoithue') await fetch(`${API_NGUOITHUE}/${currentIdXoa}`, { method: 'DELETE' }); 
        else if(loaiXoa === 'hoadon') await fetch(`${API_HOADON}/${currentIdXoa}`, { method: 'DELETE' }); 
        else if(loaiXoa === 'yeucau') await fetch(`${API_YEUCAU}/${currentIdXoa}`, { method: 'DELETE' }); 
        dongTatCaPopup(); loadDuLieuTuSQL(); 
    } catch(e) {} 
};

function dongTatCaPopup() { document.querySelectorAll('.modal-overlay').forEach(p => p.style.display = 'none'); }
function xuLyDangXuat() { if(confirm("Đăng xuất khỏi hệ thống?")) window.location.href = "login.html"; }

window.onload = loadDuLieuTuSQL;
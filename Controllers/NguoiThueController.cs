using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiThueController : ControllerBase
    {
        public class NguoiThue
        {
            public int MaNguoiThue { get; set; }
            public string HoTen { get; set; }
            public string? SoDienThoai { get; set; }
            public string? CCCD { get; set; }
            public int MaPhong { get; set; }
            public string? NguoiOGhep { get; set; } 
            
            // --- 3 CỘT MỚI ĐỂ QUẢN LÝ HỢP ĐỒNG ---
            public DateTime? NgayBatDau { get; set; }
            public DateTime? NgayKetThuc { get; set; }
            public decimal? TienCoc { get; set; }
        }

        private readonly string _chuoiKetNoi;
        public NguoiThueController(IConfiguration config) => _chuoiKetNoi = config.GetConnectionString("DefaultConnection");

        [HttpGet]
        public IActionResult LayDanhSach()
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            return Ok(db.Query<NguoiThue>("SELECT * FROM NguoiThue ORDER BY MaNguoiThue DESC"));
        }

        [HttpPost]
        public IActionResult ThemNguoi([FromBody] NguoiThue nt)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            
            // 1. Thêm khách thuê + Hợp đồng vào CSDL
            string sqlInsert = @"
                INSERT INTO NguoiThue (HoTen, SoDienThoai, CCCD, MaPhong, NguoiOGhep, NgayBatDau, NgayKetThuc, TienCoc) 
                VALUES (@HoTen, @SoDienThoai, @CCCD, @MaPhong, @NguoiOGhep, @NgayBatDau, @NgayKetThuc, @TienCoc)";
            db.Execute(sqlInsert, nt);
            
            // 2. TỰ ĐỘNG HÓA: Cập nhật trạng thái phòng thành "Đã thuê"
            db.Execute("UPDATE Phong SET TrangThai = N'Đã thuê' WHERE MaPhong = @MaPhong", new { MaPhong = nt.MaPhong });

            return Ok(new { success = true });
        }

        [HttpPut("{id}")]
        public IActionResult SuaNguoi(int id, [FromBody] NguoiThue nt)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            nt.MaNguoiThue = id;
            
            // 1. Cập nhật thông tin khách + Hợp đồng
            string sqlUpdate = @"
                UPDATE NguoiThue 
                SET HoTen = @HoTen, SoDienThoai = @SoDienThoai, CCCD = @CCCD, MaPhong = @MaPhong, 
                    NguoiOGhep = @NguoiOGhep, NgayBatDau = @NgayBatDau, NgayKetThuc = @NgayKetThuc, TienCoc = @TienCoc 
                WHERE MaNguoiThue = @MaNguoiThue";
            db.Execute(sqlUpdate, nt);
            
            // 2. Đảm bảo phòng khách đang ở chắc chắn được đánh dấu là "Đã thuê"
            db.Execute("UPDATE Phong SET TrangThai = N'Đã thuê' WHERE MaPhong = @MaPhong", new { MaPhong = nt.MaPhong });

            return Ok(new { success = true });
        }

        [HttpDelete("{id}")]
        public IActionResult XoaNguoi(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            
            var maPhong = db.QueryFirstOrDefault<int>("SELECT MaPhong FROM NguoiThue WHERE MaNguoiThue = @id", new { id });
            
            db.Execute("DELETE FROM NguoiThue WHERE MaNguoiThue = @id", new { id });
            
            if (maPhong > 0) 
            {
                db.Execute("UPDATE Phong SET TrangThai = N'Trống' WHERE MaPhong = @maPhong", new { maPhong });
            }

            return Ok();
        }
    }
}
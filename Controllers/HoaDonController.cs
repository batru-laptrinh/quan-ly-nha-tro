using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoaDonController : ControllerBase
    {
        public class HoaDon
        {
            public int MaHoaDon { get; set; }
            public int MaPhong { get; set; }
            public string? SoPhong { get; set; } // Dùng để hiển thị tên phòng trên web
            public string ThangNam { get; set; }
            public int SoDienCu { get; set; }
            public int SoDienMoi { get; set; }
            public decimal DonGiaDien { get; set; }
            public int SoNuocCu { get; set; }
            public int SoNuocMoi { get; set; }
            public decimal DonGiaNuoc { get; set; }
            public decimal GiaThue { get; set; }
            public string? TrangThai { get; set; }
        }

        private readonly string _chuoiKetNoi;
        public HoaDonController(IConfiguration config) => _chuoiKetNoi = config.GetConnectionString("DefaultConnection");

        // 1. Lấy danh sách toàn bộ hóa đơn
        [HttpGet]
        public IActionResult LayDanhSach()
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            string sql = @"
                SELECT h.*, p.SoPhong 
                FROM HoaDon h 
                JOIN Phong p ON h.MaPhong = p.MaPhong 
                ORDER BY h.MaHoaDon DESC";
            return Ok(db.Query<HoaDon>(sql));
        }

        // 2. Tạo hóa đơn mới
        [HttpPost]
        public IActionResult TaoHoaDon([FromBody] HoaDon hd)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            
            // Tự động chốt giá phòng hiện tại
            var giaThue = db.QueryFirstOrDefault<decimal>("SELECT GiaThue FROM Phong WHERE MaPhong = @MaPhong", new { hd.MaPhong });
            hd.GiaThue = giaThue;
            
            // Lấy cấu hình giá điện nước (Tạm thời fix cứng, sau này sẽ làm bảng cấu hình sau)
            hd.DonGiaDien = 3000;
            hd.DonGiaNuoc = 15000;
            hd.TrangThai = "Chưa đóng";

            string sql = @"
                INSERT INTO HoaDon (MaPhong, ThangNam, SoDienCu, SoDienMoi, DonGiaDien, SoNuocCu, SoNuocMoi, DonGiaNuoc, GiaThue, TrangThai)
                VALUES (@MaPhong, @ThangNam, @SoDienCu, @SoDienMoi, @DonGiaDien, @SoNuocCu, @SoNuocMoi, @DonGiaNuoc, @GiaThue, @TrangThai)";
            
            db.Execute(sql, hd);
            return Ok(new { success = true });
        }

        // 3. Đánh dấu đã thanh toán (Khách đóng tiền)
        [HttpPut("thanhtoan/{id}")]
        public IActionResult XacNhanThanhToan(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            db.Execute("UPDATE HoaDon SET TrangThai = N'Đã đóng' WHERE MaHoaDon = @id", new { id });
            return Ok(new { success = true });
        }

        // 4. Xóa hóa đơn (Nếu làm sai)
        [HttpDelete("{id}")]
        public IActionResult XoaHoaDon(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            db.Execute("DELETE FROM HoaDon WHERE MaHoaDon = @id", new { id });
            return Ok();
        }
    }
}
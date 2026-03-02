using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YeuCauController : ControllerBase
    {
        public class YeuCau
        {
            public int MaYeuCau { get; set; }
            public int MaPhong { get; set; }
            public string? SoPhong { get; set; }
            public string NoiDung { get; set; }
            public DateTime NgayGui { get; set; }
            public string? TrangThai { get; set; }
        }

        private readonly string _chuoiKetNoi;
        public YeuCauController(IConfiguration config) => _chuoiKetNoi = config.GetConnectionString("DefaultConnection");

        // 1. DÀNH CHO ADMIN: Lấy danh sách yêu cầu để hiển thị lên bảng
        [HttpGet]
        public IActionResult LayDanhSach()
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            // Nối bảng YeuCau với bảng Phong để lấy đúng tên phòng (P.101, P.102...)
            string sql = @"
                SELECT y.*, p.SoPhong 
                FROM YeuCau y 
                LEFT JOIN Phong p ON y.MaPhong = p.MaPhong 
                ORDER BY y.TrangThai DESC, y.NgayGui DESC"; 
            return Ok(db.Query<YeuCau>(sql));
        }

        // 2. DÀNH CHO KHÁCH THUÊ: Khách gửi yêu cầu hỏng hóc từ điện thoại
        [HttpPost]
        public IActionResult TaoYeuCau([FromBody] YeuCau yc)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            // Mặc định trạng thái khi khách vừa gửi là 'Chờ xử lý'
            string sql = "INSERT INTO YeuCau (MaPhong, NoiDung, TrangThai) VALUES (@MaPhong, @NoiDung, N'Chờ xử lý')";
            db.Execute(sql, yc);
            return Ok(new { success = true });
        }

        // 3. DÀNH CHO ADMIN: Bấm dấu check xanh lá để xác nhận đã sửa xong
        [HttpPut("hoanthanh/{id}")]
        public IActionResult XacNhanXong(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            db.Execute("UPDATE YeuCau SET TrangThai = N'Đã xong' WHERE MaYeuCau = @id", new { id });
            return Ok(new { success = true });
        }

        // 4. DÀNH CHO ADMIN: Xóa yêu cầu
        [HttpDelete("{id}")]
        public IActionResult XoaYeuCau(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            db.Execute("DELETE FROM YeuCau WHERE MaYeuCau = @id", new { id });
            return Ok();
        }
    }
}
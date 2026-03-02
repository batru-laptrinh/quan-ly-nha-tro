using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuenMatKhauController : ControllerBase
    {
        public class YeuCauMK
        {
            public string TenPhong { get; set; }
            public string SoDienThoai { get; set; }
            public string Email { get; set; }
        }

        private readonly string _chuoiKetNoi;
        public QuenMatKhauController(IConfiguration config) => _chuoiKetNoi = config.GetConnectionString("DefaultConnection");

        // Nhận dữ liệu từ trang login.html
        [HttpPost]
        public IActionResult GuiYeuCau([FromBody] YeuCauMK yc)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var sql = "INSERT INTO YeuCauMatKhau (TenPhong, SoDienThoai, Email) VALUES (@TenPhong, @SoDienThoai, @Email)";
            db.Execute(sql, yc);
            return Ok(new { success = true });
        }

        // Gửi dữ liệu ra trang admin.html
        [HttpGet]
        public IActionResult LayDanhSach()
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var sql = "SELECT * FROM YeuCauMatKhau ORDER BY MaYeuCau DESC";
            return Ok(db.Query(sql));
        }

        // Admin bấm Xóa yêu cầu sau khi xử lý xong
        [HttpDelete("{id}")]
        public IActionResult XoaYeuCau(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            db.Execute("DELETE FROM YeuCauMatKhau WHERE MaYeuCau = @id", new { id });
            return Ok();
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using QuanLyNhaTroAPI.Models;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhongController : ControllerBase
    {
        private readonly string _chuoiKetNoi;

        // Lấy chuỗi kết nối từ file appsettings.json
        public PhongController(IConfiguration config)
        {
            _chuoiKetNoi = config.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        public IActionResult LayDanhSachPhong()
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var danhSach = db.Query<Phong>("SELECT * FROM Phong").ToList();
            return Ok(danhSach);
        }

        [HttpPost]
        public IActionResult ThemPhongMoi([FromBody] Phong p)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var sql = "INSERT INTO Phong (SoPhong, GiaThue, TrangThai) VALUES (@SoPhong, @GiaThue, @TrangThai)";
            db.Execute(sql, p);
            return Ok(new { success = true, message = "Thêm thành công!" });
        }

        [HttpPut("{id}")]
        public IActionResult SuaPhong(int id, [FromBody] Phong p)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            
            // Đã sửa chuẩn @MaPhong ở đây để đổi trạng thái ngon lành
            var sql = "UPDATE Phong SET SoPhong = @SoPhong, GiaThue = @GiaThue, TrangThai = @TrangThai WHERE MaPhong = @MaPhong";
            
            p.MaPhong = id; 
            db.Execute(sql, p);
            return Ok(new { success = true, message = "Sửa thành công!" });
        }

        [HttpDelete("{id}")]
        public IActionResult XoaPhong(int id)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var sql = "DELETE FROM Phong WHERE MaPhong = @id";
            db.Execute(sql, new { id });
            return Ok(new { success = true, message = "Xóa thành công!" });
        }
    }
}
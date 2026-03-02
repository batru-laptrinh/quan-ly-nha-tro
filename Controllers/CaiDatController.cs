using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CaiDatController : ControllerBase
    {
        public class CaiDat
        {
            public int Id { get; set; } = 1;
            public decimal GiaDien { get; set; }
            public decimal GiaNuoc { get; set; }
            public string? NganHang { get; set; }
            public string? TenChuTaiKhoan { get; set; }
            public string? SoTaiKhoan { get; set; }
        }

        private readonly string _chuoiKetNoi;
        public CaiDatController(IConfiguration config) => _chuoiKetNoi = config.GetConnectionString("DefaultConnection");

        [HttpGet]
        public IActionResult LayCaiDat()
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var cd = db.QueryFirstOrDefault<CaiDat>("SELECT * FROM CaiDat WHERE Id = 1");
            if (cd == null) cd = new CaiDat { GiaDien = 3000, GiaNuoc = 15000 };
            return Ok(cd);
        }

        [HttpPost]
        public IActionResult LuuCaiDat([FromBody] CaiDat cd)
        {
            using var db = new SqlConnection(_chuoiKetNoi);
            var exists = db.ExecuteScalar<int>("SELECT COUNT(1) FROM CaiDat WHERE Id = 1");
            if (exists > 0)
            {
                db.Execute("UPDATE CaiDat SET GiaDien=@GiaDien, GiaNuoc=@GiaNuoc, NganHang=@NganHang, TenChuTaiKhoan=@TenChuTaiKhoan, SoTaiKhoan=@SoTaiKhoan WHERE Id=1", cd);
            }
            else
            {
                db.Execute("INSERT INTO CaiDat (Id, GiaDien, GiaNuoc, NganHang, TenChuTaiKhoan, SoTaiKhoan) VALUES (1, @GiaDien, @GiaNuoc, @NganHang, @TenChuTaiKhoan, @SoTaiKhoan)", cd);
            }
            return Ok(new { success = true });
        }
    }
}
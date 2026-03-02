using Microsoft.AspNetCore.Mvc;

namespace QuanLyNhaTroAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoanController : ControllerBase
    {
        public class ThongTinDangNhap
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("dangnhap")]
        public IActionResult DangNhap([FromBody] ThongTinDangNhap req)
        {
            if (req == null || string.IsNullOrEmpty(req.Username) || string.IsNullOrEmpty(req.Password))
            {
                return Ok(new { success = false, message = "Vui lòng nhập đủ tài khoản và mật khẩu!" });
            }

            // Chuyển tài khoản về chữ thường để người dùng gõ hoa hay thường đều được (VD: Admin hay admin đều ok)
            string user = req.Username.Trim().ToLower();
            string pass = req.Password.Trim();

            // ==========================================
            // 1. KIỂM TRA TÀI KHOẢN ADMIN
            // ==========================================
            if (user == "admin" && pass == "123456")
            {
                return Ok(new { success = true, role = "admin" });
            }

            // ==========================================
            // 2. KIỂM TRA TÀI KHOẢN USER (TỪNG PHÒNG)
            // ==========================================
            // Nếu tài khoản bắt đầu bằng chữ "p" (VD: p101, p102, P.101...) và pass là 123456
            if (user.StartsWith("p") && pass == "123456")
            {
                // Lọc lấy đúng số phòng. (VD: Khách gõ "p.101" hay "p101" thì máy tính đều hiểu là "101")
                string soPhong = user.Replace("p", "").Replace(".", "").Trim();
                
                // Nắn lại thành chuẩn "P.101" để gửi sang trang user.html
                string tenPhongChuan = "P." + soPhong;

                return Ok(new { success = true, role = "user", room = tenPhongChuan });
            }

            // ==========================================
            // 3. TRƯỜNG HỢP NHẬP SAI
            // ==========================================
            return Ok(new { success = false, message = "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại!" });
        }
    }
}
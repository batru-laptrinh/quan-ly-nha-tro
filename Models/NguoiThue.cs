using System;
using System.ComponentModel.DataAnnotations;

namespace QuanLyNhaTroAPI.Models
{
    public class NguoiThue
    {
        [Key]
        public int MaNguoiThue { get; set; }
        
        public string HoTen { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Cccd { get; set; }
        public string? NguoiOGhep { get; set; }
        
        public int MaPhong { get; set; }

        // ==========================================
        // 3 CỘT MỚI DÀNH CHO HỢP ĐỒNG
        // ==========================================
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public decimal TienCoc { get; set; } // Dùng decimal để lưu tiền tệ chuẩn xác
    }
}
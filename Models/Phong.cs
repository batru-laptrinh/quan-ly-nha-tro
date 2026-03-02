namespace QuanLyNhaTroAPI.Models
{
    public class Phong
    {
        public int MaPhong { get; set; }
        public string SoPhong { get; set; }
        public decimal GiaThue { get; set; } // Thêm cột Giá thuê
        public string TrangThai { get; set; }
    }
}
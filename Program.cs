var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình cho phép Web HTML kết nối (CORS)
builder.Services.AddCors(options => {
    options.AddPolicy("ChoPhepWeb", policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// 2. Kích hoạt Controller và Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. Hiển thị trang giao diện Swagger màu xanh
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 4. Bật quyền CORS cho Web (Bắt buộc đứng trước MapControllers)
app.UseCors("ChoPhepWeb");

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
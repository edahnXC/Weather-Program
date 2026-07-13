using Microsoft.AspNetCore.Mvc;

namespace WeatherProgram.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;

        public WeatherController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _apiKey = _configuration["OpenWeatherMap:ApiKey"] ?? throw new ArgumentNullException("ApiKey missing");
        }

        [HttpGet]
        public async Task<IActionResult> GetWeather([FromQuery] string query, [FromQuery] string unit = "metric")
        {
            var url = $"https://api.openweathermap.org/data/2.5/weather?{query}&units={unit}&appid={_apiKey}";
            
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorContent);
            }
            
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }

        [HttpGet("forecast")]
        public async Task<IActionResult> GetForecast([FromQuery] string query, [FromQuery] string unit = "metric")
        {
            var url = $"https://api.openweathermap.org/data/2.5/forecast?{query}&units={unit}&appid={_apiKey}";
            
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorContent);
            }
            
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }

        [HttpGet("geo")]
        public async Task<IActionResult> GetGeo([FromQuery] string query)
        {
            var url = $"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=6&appid={_apiKey}";
            
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorContent);
            }
            
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }

        [HttpGet("tile/{layer}/{z}/{x}/{y}")]
        public async Task<IActionResult> GetTile(string layer, int z, int x, int y)
        {
            var url = $"https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={_apiKey}";
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode);
            }
            
            var stream = await response.Content.ReadAsStreamAsync();
            return File(stream, "image/png");
        }
    }
}

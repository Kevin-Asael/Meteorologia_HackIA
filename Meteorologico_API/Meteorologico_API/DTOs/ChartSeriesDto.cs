/// Path: DTOs/ChartSeriesDto.cs
namespace Meteorologico_API.DTOs
{
    public class ChartSeriesDto
    {
        public int TagId { get; set; }
        public string? StationName { get; set; }
        public string? ParameterName { get; set; }
        public string? Unit { get; set; }
        public List<ChartPointDto> Points { get; set; } = new();
    }
}

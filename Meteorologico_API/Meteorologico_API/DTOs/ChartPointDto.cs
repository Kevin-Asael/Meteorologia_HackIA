/// Path: DTOs/ChartPointDto.cs
namespace Meteorologico_API.DTOs
{
    public class ChartPointDto
    {
        public DateTime Timestamp { get; set; }
        public double? Value { get; set; }
    }
}

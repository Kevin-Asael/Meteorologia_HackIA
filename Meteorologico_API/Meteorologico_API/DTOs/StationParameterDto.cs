/// Path: DTOs/StationParameterDto.cs
namespace Meteorologico_API.DTOs
{
    public class StationParameterDto
    {
        public int TagId { get; set; }
        public int ParameterId { get; set; }
        public string? ParameterName { get; set; }
        public string? Unit { get; set; }
        public double? LowLowLimit { get; set; }
        public double? LowLimit { get; set; }
        public double? HighLimit { get; set; }
        public double? HighHighLimit { get; set; }
    }
}

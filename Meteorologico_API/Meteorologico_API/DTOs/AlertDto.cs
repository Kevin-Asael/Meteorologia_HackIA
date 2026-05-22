namespace Meteorologico_API.DTOs
{
    public class AlertDto
    {
        public string StationName { get; set; }
        public string ParameterName { get; set; }
        public double? CurrentValue { get; set; }
        public string Unit { get; set; }
        public string AlertType { get; set; }
        public string RecommendationText { get; set; }
    }
}
using System;

namespace Meteorologico_API.Models
{
    public class RecentValue
    {
        public int TagId { get; set; }
        public DateTime TimeOfMeasurement { get; set; }
        public double? MeasuredValue { get; set; }

        public Tag Tag { get; set; }
    }
}
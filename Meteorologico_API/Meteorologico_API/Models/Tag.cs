using System.Collections.Generic;

namespace Meteorologico_API.Models
{
    public class Tag
    {
        public int TagId { get; set; }
        public int LocId { get; set; }
        public int ParId { get; set; }
        public string TagName { get; set; }
        public string TagCode { get; set; }
        public double? LoLoLim { get; set; }
        public double? LoLim { get; set; }
        public double? HiLim { get; set; }
        public double? HiHiLim { get; set; }
        public double? MinRange { get; set; }
        public double? MaxRange { get; set; }

        public Location Location { get; set; }
        public Param Param { get; set; }
        public ICollection<Measurement> Measurements { get; set; } = new List<Measurement>();
        public ICollection<RecentValue> RecentValues { get; set; } = new List<RecentValue>();
    }
}
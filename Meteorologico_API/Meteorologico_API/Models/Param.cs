using System.Collections.Generic;

namespace Meteorologico_API.Models
{
    public class Param
    {
        public int ParId { get; set; }
        public string ParCode { get; set; }
        public string ParName { get; set; }
        public string Unit { get; set; }
        public double? DispFactor { get; set; }
        public double? DispOffset { get; set; }
        public string DispUnit { get; set; }

        public ICollection<Tag> Tags { get; set; } = new List<Tag>();
    }
}
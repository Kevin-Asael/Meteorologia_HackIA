using System.Collections.Generic;

namespace Meteorologico_API.Models
{
    public class Location
    {
        public int LocId { get; set; }
        public int? ParentLocId { get; set; }
        public string LocName { get; set; }
        public string LocCode { get; set; }
        public string DaqCode { get; set; }

        public ICollection<Tag> Tags { get; set; } = new List<Tag>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
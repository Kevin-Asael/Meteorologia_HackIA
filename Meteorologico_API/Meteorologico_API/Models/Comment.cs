using System;

namespace Meteorologico_API.Models
{
    public class Comment
    {
        public int LocId { get; set; }
        public DateTime TimeOfComment { get; set; }
        public string? CommentText { get; set; }

        public Location? Location { get; set; }
    }
}
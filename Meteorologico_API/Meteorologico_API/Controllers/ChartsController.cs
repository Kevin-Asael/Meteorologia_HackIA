/// Path: Controllers/ChartsController.cs
using Meteorologico_API.Data;
using Meteorologico_API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Meteorologico_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChartsController : ControllerBase
    {
        private const int DefaultRangeHours = 24;
        private const int MaxPoints = 5000;

        private readonly ApplicationDbContext _context;

        public ChartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("tag/{tagId}")]
        public async Task<IActionResult> GetTagHistory(
            int tagId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var (fromDate, toDate) = ResolveRange(from, to);

            var history = await _context.Measurements
                .Where(m => m.TagId == tagId
                            && m.TimeOfMeasurement >= fromDate
                            && m.TimeOfMeasurement <= toDate)
                .OrderBy(m => m.TimeOfMeasurement)
                .Take(MaxPoints)
                .Select(m => new ChartPointDto
                {
                    Timestamp = m.TimeOfMeasurement,
                    Value = m.MeasuredValue
                })
                .ToListAsync();

            return Ok(history);
        }

        [HttpGet("station/{locId}/parameter/{parId}")]
        public async Task<IActionResult> GetStationParameterHistory(
            int locId,
            int parId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var (fromDate, toDate) = ResolveRange(from, to);

            var history = await (from m in _context.Measurements
                                 join t in _context.Tags on m.TagId equals t.TagId
                                 where t.LocId == locId
                                       && t.ParId == parId
                                       && m.TimeOfMeasurement >= fromDate
                                       && m.TimeOfMeasurement <= toDate
                                 orderby m.TimeOfMeasurement
                                 select new ChartPointDto
                                 {
                                     Timestamp = m.TimeOfMeasurement,
                                     Value = m.MeasuredValue
                                 })
                                 .Take(MaxPoints)
                                 .ToListAsync();

            return Ok(history);
        }

        [HttpGet("compare")]
        public async Task<IActionResult> CompareTags(
            [FromQuery] string tagIds,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            if (string.IsNullOrWhiteSpace(tagIds))
            {
                return BadRequest(new { error = "tagIds query parameter is required" });
            }

            var ids = tagIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => int.TryParse(s.Trim(), out var id) ? id : -1)
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (ids.Count == 0)
            {
                return BadRequest(new { error = "No valid tagIds provided" });
            }

            var (fromDate, toDate) = ResolveRange(from, to);

            var rows = await (from m in _context.Measurements
                              join t in _context.Tags on m.TagId equals t.TagId
                              join p in _context.Params on t.ParId equals p.ParId
                              join l in _context.Locations on t.LocId equals l.LocId
                              where ids.Contains(m.TagId)
                                    && m.TimeOfMeasurement >= fromDate
                                    && m.TimeOfMeasurement <= toDate
                              select new
                              {
                                  m.TagId,
                                  StationName = l.LocName,
                                  ParameterName = p.ParName,
                                  Unit = p.Unit,
                                  Timestamp = m.TimeOfMeasurement,
                                  Value = m.MeasuredValue
                              }).ToListAsync();

            var series = rows
                .GroupBy(r => new { r.TagId, r.StationName, r.ParameterName, r.Unit })
                .Select(g => new ChartSeriesDto
                {
                    TagId = g.Key.TagId,
                    StationName = g.Key.StationName,
                    ParameterName = g.Key.ParameterName,
                    Unit = g.Key.Unit,
                    Points = g.OrderBy(p => p.Timestamp)
                        .Take(MaxPoints)
                        .Select(p => new ChartPointDto
                        {
                            Timestamp = p.Timestamp,
                            Value = p.Value
                        }).ToList()
                }).ToList();

            return Ok(series);
        }

        [HttpGet("latest/tag/{tagId}")]
        public async Task<IActionResult> GetLatestForTag(int tagId, [FromQuery] int limit = 100)
        {
            if (limit <= 0 || limit > MaxPoints) limit = 100;

            var latest = await _context.Measurements
                .Where(m => m.TagId == tagId)
                .OrderByDescending(m => m.TimeOfMeasurement)
                .Take(limit)
                .Select(m => new ChartPointDto
                {
                    Timestamp = m.TimeOfMeasurement,
                    Value = m.MeasuredValue
                })
                .ToListAsync();

            latest.Reverse();
            return Ok(latest);
        }

        private static (DateTime From, DateTime To) ResolveRange(DateTime? from, DateTime? to)
        {
            var toDate = to ?? DateTime.Now;
            var fromDate = from ?? toDate.AddHours(-DefaultRangeHours);

            fromDate = DateTime.SpecifyKind(fromDate, DateTimeKind.Unspecified);
            toDate = DateTime.SpecifyKind(toDate, DateTimeKind.Unspecified);

            return (fromDate, toDate);
        }
    }
}

using System.Linq;
using System.Threading.Tasks;
using Meteorologico_API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Meteorologico_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherMapController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WeatherMapController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentMapData()
        {
            var stationsData = await (from rv in _context.RecentValues
                                      join t in _context.Tags on rv.TagId equals t.TagId
                                      join p in _context.Params on t.ParId equals p.ParId
                                      join l in _context.Locations on t.LocId equals l.LocId
                                      group new { p, rv } by new { l.LocId, l.LocName, l.LocCode } into g
                                      select new
                                      {
                                          StationId = g.Key.LocId,
                                          StationName = g.Key.LocName,
                                          StationCode = g.Key.LocCode,
                                          Measurements = g.Select(x => new
                                          {
                                              ParameterName = x.p.ParName,
                                              Value = x.rv.MeasuredValue,
                                              Unit = x.p.Unit,
                                              Timestamp = x.rv.TimeOfMeasurement
                                          }).ToList()
                                      }).ToListAsync();

            return Ok(stationsData);
        }
    }
}
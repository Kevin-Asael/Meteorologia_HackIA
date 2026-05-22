/// Path: Controllers/StationsController.cs
using Meteorologico_API.Data;
using Meteorologico_API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Meteorologico_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetStations()
        {
            var stations = await _context.Locations
                .OrderBy(l => l.LocName)
                .Select(l => new StationDto
                {
                    StationId = l.LocId,
                    StationName = l.LocName,
                    StationCode = l.LocCode
                })
                .ToListAsync();

            return Ok(stations);
        }

        [HttpGet("{locId}")]
        public async Task<IActionResult> GetStation(int locId)
        {
            var station = await _context.Locations
                .Where(l => l.LocId == locId)
                .Select(l => new StationDto
                {
                    StationId = l.LocId,
                    StationName = l.LocName,
                    StationCode = l.LocCode
                })
                .FirstOrDefaultAsync();

            if (station == null)
            {
                return NotFound(new { error = "Station not found" });
            }

            return Ok(station);
        }

        [HttpGet("{locId}/parameters")]
        public async Task<IActionResult> GetStationParameters(int locId)
        {
            var parameters = await (from t in _context.Tags
                                    join p in _context.Params on t.ParId equals p.ParId
                                    where t.LocId == locId
                                    orderby p.ParName
                                    select new StationParameterDto
                                    {
                                        TagId = t.TagId,
                                        ParameterId = p.ParId,
                                        ParameterName = p.ParName,
                                        Unit = p.Unit,
                                        LowLowLimit = t.LoLoLim,
                                        LowLimit = t.LoLim,
                                        HighLimit = t.HiLim,
                                        HighHighLimit = t.HiHiLim
                                    }).ToListAsync();

            return Ok(parameters);
        }
    }
}

using Meteorologico_API.Data;
using Meteorologico_API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Meteorologico_API.Services
{
    public class AgroAlertAgentService : IAgroAlertAgentService
    {
        private readonly ApplicationDbContext _context;

        public AgroAlertAgentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AlertDto>> GetAnomaliesAsync()
        {
            var latestReadings = _context.RecentValues.Where(rv =>
                !_context.RecentValues.Any(other =>
                    other.TagId == rv.TagId && other.TimeOfMeasurement > rv.TimeOfMeasurement));

            var anomalies = await (from rv in latestReadings
                                   join t in _context.Tags on rv.TagId equals t.TagId
                                   join p in _context.Params on t.ParId equals p.ParId
                                   join l in _context.Locations on t.LocId equals l.LocId
                                   where rv.MeasuredValue.HasValue
                                         && (
                                             (t.LoLoLim.HasValue && rv.MeasuredValue <= t.LoLoLim)
                                             || (t.HiHiLim.HasValue && rv.MeasuredValue >= t.HiHiLim)
                                         )
                                   select new AlertDto
                                   {
                                       StationName = l.LocName,
                                       ParameterName = p.ParName,
                                       CurrentValue = rv.MeasuredValue,
                                       Unit = p.Unit,
                                       AlertType = t.LoLoLim.HasValue && rv.MeasuredValue <= t.LoLoLim
                                           ? "Critical Low"
                                           : "Critical High",
                                       RecommendationText =
                                           $"In-app alert: atypical {p.ParName} at {l.LocName}. Review station readings and apply mitigation if needed."
                                   }).ToListAsync();

            return anomalies;
        }
    }
}

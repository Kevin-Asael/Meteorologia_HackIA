using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            var anomalies = await (from rv in _context.RecentValues
                                   join t in _context.Tags on rv.TagId equals t.TagId
                                   join p in _context.Params on t.ParId equals p.ParId
                                   join l in _context.Locations on t.LocId equals l.LocId
                                   where rv.MeasuredValue <= t.LoLoLim || rv.MeasuredValue >= t.HiHiLim
                                   select new AlertDto
                                   {
                                       StationName = l.LocName,
                                       ParameterName = p.ParName,
                                       CurrentValue = rv.MeasuredValue,
                                       Unit = p.Unit,
                                       AlertType = rv.MeasuredValue <= t.LoLoLim ? "Crítico Bajo" : "Crítico Alto",
                                       RecommendationText = $"Atención agrónomo: Se detectó {p.ParName} atípica en {l.LocName}. Aplique medidas de mitigación inmediatas en el cultivo para evitar pérdidas."
                                   }).ToListAsync();

            return anomalies;
        }
    }
}
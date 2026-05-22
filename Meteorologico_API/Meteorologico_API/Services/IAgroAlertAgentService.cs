using System.Collections.Generic;
using System.Threading.Tasks;
using Meteorologico_API.DTOs;

namespace Meteorologico_API.Services
{
    public interface IAgroAlertAgentService
    {
        Task<IEnumerable<AlertDto>> GetAnomaliesAsync();
    }
}
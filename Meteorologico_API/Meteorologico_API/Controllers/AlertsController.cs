using System.Threading.Tasks;
using Meteorologico_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Meteorologico_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlertsController : ControllerBase
    {
        private readonly IAgroAlertAgentService _alertAgentService;

        public AlertsController(IAgroAlertAgentService alertAgentService)
        {
            _alertAgentService = alertAgentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAlerts()
        {
            var alerts = await _alertAgentService.GetAnomaliesAsync();
            return Ok(alerts);
        }
    }
}
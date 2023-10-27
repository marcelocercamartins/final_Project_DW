using apiApp.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace apiApp.Controllers
{
    [Route("api/Persons")]
    [ApiController]
    public class PersonsEverywhere : ControllerBase
    {
        public PersonsEverywhere()
        {
            
        }


        [HttpGet]
        public person getTest()
        {
            return new person { Id = 1, Name = "Michael" };
        }

        [HttpPut]
        public void createPerson()
        {
            List<person> persons = new List<person>();
           foreach(var item in persons) { }
        }

    }
}

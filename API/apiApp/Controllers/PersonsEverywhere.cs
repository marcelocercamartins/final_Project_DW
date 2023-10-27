using apiApp.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Immutable;


namespace apiApp.Controllers
{
    [Route("api/Persons")]
    [ApiController]
    public class PersonsEverywhere : ControllerBase
    {
        public List<person> people = new List<person>();

        public PersonsEverywhere()
        {
            people.Add(new person { ID = 1, Name = "a" });
            people.Add(new person { ID = 2, Name = "b" });
            people.Add(new person { ID = 3, Name = "c" });
        }


        [HttpGet]
        public List<person> getPeople() => people;

        [HttpGet("{PersonID:int}")]
        public person GetPerson(int PersonID) => people.FirstOrDefault(x => x.ID == PersonID);

        [HttpPut]
        public void createPerson(string name) => people.Add(new person { ID = 10, Name = name });
    }
}

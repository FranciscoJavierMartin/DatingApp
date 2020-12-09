using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTO;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
  public class UsersController : BaseApiController
  {
    private readonly IUserRespository _userRepository;
    private readonly IMapper _mapper;
    public UsersController(IUserRespository userRepository, IMapper mapper)
    {
      _mapper = mapper;
      _userRepository = userRepository;

    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
      var users = await _userRepository.GetMembersAsync();
      return Ok(users);
    }

    [Authorize]
    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
      return await _userRepository.GetMemberAsync(username);
    }
  }
}
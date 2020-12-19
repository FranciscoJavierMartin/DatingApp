using System.Linq;
using System.Threading.Tasks;
using API.DTO;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
  public class AccountController : BaseApiController
  {
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    public AccountController(UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager, ITokenService tokenService,
      IMapper mapper)
    {
      _userManager = userManager;
      _signInManager = signInManager;
      _mapper = mapper;
      _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
      ActionResult<UserDto> res;
      if (await UserExists(registerDto.Username))
      {
        res = BadRequest("Username is taken");
      }
      else
      {
        var user = _mapper.Map<AppUser>(registerDto);
        user.UserName = registerDto.Username.ToLower();

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        var roleResult = await _userManager.AddToRoleAsync(user, "Member");
        if (result.Succeeded)
        {


          if (!roleResult.Succeeded)
          {
            res = BadRequest(roleResult.Errors);
          }
          else
          {
            res = new UserDto
            {
              Username = user.UserName,
              Token = await _tokenService.CreateToken(user),
              KnownAs = user.KnownAs,
              Gender = user.Gender,
            };
          }
        }
        else
        {
          res = BadRequest(result.Errors);
        }
      }
      return res;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
      ActionResult<UserDto> res = null;
      string userNameFromLogin = loginDto.Username.ToLower();
      var user = await _userManager.Users
      .Include(p => p.Photos)
      .SingleOrDefaultAsync(x => x.UserName == userNameFromLogin);

      if (user == null)
      {
        res = Unauthorized("Invalid username");
      }
      else
      {
        var result = await _signInManager
          .CheckPasswordSignInAsync(user, loginDto.Password, false);

        if (!result.Succeeded)
        {
          res = Unauthorized();
        }
        else
        {
          res = new UserDto
          {
            Username = user.UserName,
            Token = await _tokenService.CreateToken(user),
            PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
            KnownAs = user.KnownAs,
            Gender = user.Gender,
          };
        }
      }

      return res;
    }

    private async Task<bool> UserExists(string username)
    {
      return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
    }
  }
}
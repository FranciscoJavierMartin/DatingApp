using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTO;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
  public class AccountController : BaseApiController
  {
    private readonly DataContext _context;
    private readonly ITokenService _tokenService;
    public AccountController(DataContext context, ITokenService tokenService)
    {
      _tokenService = tokenService;
      _context = context;
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
        using var hmac = new HMACSHA512();

        var user = new AppUser
        {
          UserName = registerDto.Username.ToLower(),
          PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
          PasswordSalt = hmac.Key,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        res = new UserDto { Username = user.UserName, Token = _tokenService.CreateToken(user) };
      }
      return res;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
      ActionResult<UserDto> res = null;
      string userNameFromLogin = loginDto.Username.ToLower();
      var user = await _context.Users
      .Include(p => p.Photos)
      .SingleOrDefaultAsync(x => x.UserName == userNameFromLogin);

      if (user == null)
      {
        res = Unauthorized("Invalid username");
      }
      else
      {
        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
        bool hasError = false;

        for (int i = 0; i < computedHash.Length; i++)
        {
          if (computedHash[i] != user.PasswordHash[i])
          {
            res = Unauthorized("Invalid password");
            hasError = true;
            break;
          }
        }

        if (!hasError)
        {
          res = new UserDto
          {
            Username = user.UserName,
            Token = _tokenService.CreateToken(user),
            PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url
          };
        }
      }
      return res;
    }

    private async Task<bool> UserExists(string username)
    {
      return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
    }
  }
}
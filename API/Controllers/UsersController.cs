using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
  public class UsersController : BaseApiController
  {
    private readonly IMapper _mapper;
    private readonly IPhotoService _photoService;
    private readonly IUnitOfWork _unitOfWork;
    public UsersController(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
    {
      _unitOfWork = unitOfWork;
      _photoService = photoService;
      _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
    {
      var gender = await _unitOfWork.UserRepository.GetUserGender(User.GetUsername());
      userParams.CurrentUsername = User.GetUsername();

      if (string.IsNullOrEmpty(userParams.Gender))
      {
        userParams.Gender = gender == "male" ? "female" : "male";
      }

      var users = await _unitOfWork.UserRepository.GetMembersAsync(userParams);
      Response.AddPaginationHeader(users.CurrentPage, users.PageSize,
        users.TotalCount, users.TotalPages);
      return Ok(users);
    }

    [Authorize(Roles = "Member")]
    [HttpGet("{username}", Name = "GetUser")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
      var currentUsername = User.GetUsername();
      return await _unitOfWork.UserRepository.GetMemberAsync(username, isCurrentUser: currentUsername == username);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
      var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());
      _mapper.Map(memberUpdateDto, user);
      _unitOfWork.UserRepository.Update(user);

      return await _unitOfWork.Complete() ? NoContent() : BadRequest("Failed to update user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
    {
      ActionResult<PhotoDto> res;

      var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());
      var result = await _photoService.AddPhotoAsync(file);

      if (result.Error != null)
      {
        res = BadRequest(result.Error.Message);
      }
      else
      {
        var photo = new Photo
        {
          Url = result.SecureUrl.AbsoluteUri,
          PublicId = result.PublicId
        };

        user.Photos.Add(photo);

        if (await _unitOfWork.Complete())
        {
          res = CreatedAtRoute("GetUser", new
          {
            username = user.UserName
          }, _mapper.Map<PhotoDto>(photo));
        }
        else
        {
          res = BadRequest("Problem adding photo");
        }

      }
      return res;
    }

    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
      ActionResult res;
      var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());
      var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

      if (photo.IsMain)
      {
        res = BadRequest("This is already your main photo");
      }
      else
      {
        var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);

        if (currentMain != null)
        {
          currentMain.IsMain = false;
        }
        photo.IsMain = true;

        if (await _unitOfWork.Complete())
        {
          res = NoContent();
        }
        else
        {
          res = BadRequest("Failure to set main photo");
        }
      }

      return res;
    }

    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
      ActionResult res;
      var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());
      var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

      if (photo == null)
      {
        res = NotFound();
      }
      else if (photo.IsMain)
      {
        res = BadRequest("You cannot delete your main photo");
      }
      else if (photo.PublicId != null)
      {
        var result = await _photoService.DeletePhotoAsync(photo.PublicId);
        if (result.Error != null)
        {
          res = BadRequest(result.Error.Message);
        }
        else
        {
          user.Photos.Remove(photo);
          if (await _unitOfWork.Complete())
          {
            res = Ok();
          }
          else
          {
            res = BadRequest("Fail to Delete Photo");
          }
        }
      }
      else
      {
        res = BadRequest("Something goes wrong");
      }

      return res;
    }
  }
}
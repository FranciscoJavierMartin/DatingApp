using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
  [Authorize]
  public class LikesController : BaseApiController
  {

    private readonly IUnitOfWork _unitOfWork;

    public LikesController(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
    }

    [HttpPost("{username}")]
    public async Task<ActionResult> AddLike(string username)
    {
      ActionResult res;
      var sourceUserId = User.GetUserId();
      var likedUser = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
      var sourceUser = await _unitOfWork.LikesRepository.GetUserWithLikes(sourceUserId);

      if (likedUser == null)
      {
        res = NotFound();
      }
      else if (sourceUser.UserName == username)
      {
        res = BadRequest("You cannot like yourself");
      }
      else
      {
        var userLike = await _unitOfWork.LikesRepository.GetUserLike(sourceUserId, likedUser.Id);

        if (userLike != null)
        {
          res = BadRequest("You already like this user");
        }
        else
        {
          userLike = new UserLike
          {
            SourceUserId = sourceUserId,
            LikedUserId = likedUser.Id
          };

          sourceUser.LikedUsers.Add(userLike);

          if (await _unitOfWork.Complete())
          {
            res = Ok();
          }
          else
          {
            res = BadRequest("Failed to like user");
          }
        }
      }
      return res;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
      likesParams.UserId = User.GetUserId();
      var users = await _unitOfWork.LikesRepository.GetUserLikes(likesParams);
      Response.AddPaginationHeader(users.CurrentPage,
        users.PageSize, users.TotalCount, users.TotalPages);
      return Ok(users);
    }
  }
}
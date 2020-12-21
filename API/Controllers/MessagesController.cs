using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
  [Authorize]
  public class MessagesController : BaseApiController
  {
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;

    public MessagesController(IMapper mapper, IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
      _mapper = mapper;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(
      CreateMessageDto createMessageDto)
    {
      ActionResult<MessageDto> res;

      var username = User.GetUsername();

      if (username == createMessageDto.RecipientUsername.ToLower())
      {
        res = BadRequest("You cannot send messages to yourself");
      }
      else
      {
        var sender = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
        var recipient = await _unitOfWork.UserRepository
          .GetUserByUsernameAsync(createMessageDto.RecipientUsername);

        if (recipient == null)
        {
          res = NotFound();
        }
        else
        {
          var message = new Message
          {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content,
          };

          _unitOfWork.MessageRepository.AddMessage(message);

          if (await _unitOfWork.Complete())
          {
            res = Ok(_mapper.Map<MessageDto>(message));
          }
          else
          {
            res = BadRequest("Failed to send message");
          }
        }
      }
      return res;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser(
      [FromQuery] MessageParams messageParams)
    {
      messageParams.Username = User.GetUsername();
      var messages = await _unitOfWork.MessageRepository.GetMessagesForUser(messageParams);
      Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize,
        messages.TotalCount, messages.TotalPages);
      return messages;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
      ActionResult res;
      var username = User.GetUsername();
      var message = await _unitOfWork.MessageRepository.GetMessage(id);
      if (message.Sender.UserName != username && message.Recipient.UserName != username)
      {
        res = Unauthorized();
      }
      else
      {
        if (message.Sender.UserName == username)
        {
          message.SenderDeleted = true;
        }

        if (message.Recipient.UserName == username)
        {
          message.RecipientDeleted = true;
        }

        if (message.SenderDeleted && message.RecipientDeleted)
        {
          _unitOfWork.MessageRepository.DeleteMessage(message);
        }

        if (await _unitOfWork.Complete())
        {
          res = Ok();
        }
        else
        {

          res = BadRequest("Problem deleting the message");
        }
      }

      return res;
    }
  }
}
import { IMessage } from './../models/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ContainerMessage } from '../constants/custom-types';
import { IMessage } from '../models/message';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseUrlMessagesService = `${environment.apiUrl}messages`;

  constructor(private http: HttpClient) {}

  getMessages(
    pageNumber: number,
    pageSize: number,
    container: ContainerMessage
  ) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResult<IMessage[]>(
      this.baseUrlMessagesService,
      params,
      this.http
    );
  }

  getMessageThread(username: string) {
    return this.http.get<IMessage[]>(
      `${this.baseUrlMessagesService}/thread/${username}`
    );
  }

  sendMessage(username: string, content: string) {
    return this.http.post<IMessage>(this.baseUrlMessagesService, {
      recipientUsername: username,
      content,
    });
  }

  deleteMessage(id: number){
    return this.http.delete(`${this.baseUrlMessagesService}/${id}`);
  }
}

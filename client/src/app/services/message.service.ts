import { IMessage } from './../models/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ContainerMessage } from '../constants/custom-types';
import { IMessage } from '../models/message';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { IUser } from '../models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { IGroup } from '../models/group';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseUrlMessagesService = `${environment.apiUrl}messages`;
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private messageThreadSource: BehaviorSubject<
    IMessage[]
  > = new BehaviorSubject<IMessage[]>([]);
  messageThread$: Observable<
    IMessage[]
  > = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient) {}

  createHubConnection(user: IUser, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}message?user=${otherUsername}`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', (messages: IMessage[]) => {
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on('NewMessage', (message: IMessage) => {
      this.messageThread$.pipe(take(1)).subscribe((messages: IMessage[]) => {
        this.messageThreadSource.next([...messages, message]);
      });
    });

    this.hubConnection.on('UpdatedGroup', (group: IGroup) => {
      if (group.connections.some((x) => x.username === otherUsername)) {
        this.messageThread$.pipe(take(1)).subscribe((messages: IMessage[]) => {
          messages.forEach((message: IMessage) => {
            if (!message.dateRead) {
              message.dateRead = new Date(Date.now());
            }
          });
          this.messageThreadSource.next([...messages]);
        });
      }
    });
  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

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

  async sendMessage(username: string, content: string) {
    return this.hubConnection
      .invoke('SendMessage', { recipientUsername: username, content })
      .catch((error) => console.log(error));
  }

  deleteMessage(id: number) {
    return this.http.delete(`${this.baseUrlMessagesService}/${id}`);
  }
}

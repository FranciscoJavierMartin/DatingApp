export interface IGroup {
  name: string;
  connections: IConnection[];
}

interface IConnection {
  connectionId: string;
  username: string;
}

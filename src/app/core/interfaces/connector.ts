export interface Connector {
  id: number;
  title: string;
  code: string;
  implementation: ConnectorType;
  type: string;
  settings: any;
}

export interface ConnectorType {
  name: string;
}

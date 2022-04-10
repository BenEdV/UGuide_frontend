export interface CardAction {
  name: string;
  permissions?: string[];
  callback: (() => void);
}

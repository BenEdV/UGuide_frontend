export interface TableAction {
  name: string;
  icon?: string;
  condition?: (entry: any) => boolean;
  callback: (entry: any) => any;
}

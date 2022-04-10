export interface Model {
  id: number;
  name: string;
  description: string;
  method: string;
  supported_construct_types: ConstructType[];
  constructs: ModelConstruct[];
}

export interface ConstructType {
  id: number;
  name: string;
}

export interface ModelConstruct {
  id: number;
  name: string;
  description: string;
  type: string;
}

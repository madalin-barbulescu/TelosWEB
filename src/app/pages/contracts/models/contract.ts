export class Contract {
  private _abi: any;
  private _account_name: string;
  private _sourceCode: string;
  private readonly _types: any;

  constructor(account_name: string = '', abi: any = {}) {
    abi.actions = abi.actions.sort((a: IContractAction, b: IContractAction) => (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));
    abi.tables = abi.tables.sort((a: IContractTable, b: IContractTable) => (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));
    abi.structs = abi.structs.sort((a: IContractStruct, b: IContractStruct) => (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));

    this._account_name = account_name;
    this._abi = abi;

    this._types = {
      name: 'name (12 length; valid chars:  a-z, 1-5)',
      asset: 'asset ( value with precision <space> symbol; e.g. : 1.0000 TLOS or 0.1000 TLOS , etc )',
      bool: 'bool ( 1 for true,  0 for false )',
      float: 'float ( number )',
      double: 'double ( number )',
      uint32: 'uint32 ( number )',
      uint64: 'uint64 ( number )',
      int32: 'int32 ( number )',
      int64: 'int64 ( number )',
      symbol: 'symbol ( requires decimal precision - e.g. 4,TLOS or 0,VOTE)'
    };
  }

  get abi() {
    return this._abi;
  }

  get account_name() {
    return this._account_name;
  }

  get actions(): IContractAction[] {
    return this._abi.actions;
  }

  get tables(): IContractTable[] {
    return this._abi.tables;
  }

  get structs(): IContractStruct[] {
    return this._abi.structs;
  }

  get sourceCode(): string {
    return this._sourceCode;
  }

  get types() {
    return this._types;
  }

  set sourceCode(sourceCode: string) {
    this._sourceCode = sourceCode;
  }

  getAction(name: string): IContractAction {
    return this.actions.find(action => action.name === name);
  }

  getTabel(name: string): IContractTable {
    return this.tables.find(table => table.name === name);
  }

  getField(structName: string, fieldName: string): IContractField {
    return this.getFields(structName).find(field => field.name === fieldName)
  }

  getStruct(name: string) {
    return this.structs.find(struct => struct.name === name);
  }

  getFields(structName: string): IContractField[] {
    const struct = this.getStruct(structName);

    return (struct && struct.fields) ? struct.fields : []; 
  }
}

export interface IContractAction {
  name: string;
  ricardian_contract: string;
  type: string;
}

export interface IContractTable {
  index_type: string;
  key_names: string[];
  key_types: string[];
  name: string;
  type: string;
}

export interface IContractField {
  name: string;
  type: string;
}

export interface IContractStruct {
  base: string;
  fields: IContractField[];
  name: string;
}
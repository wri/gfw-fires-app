/*eslint-disable */
declare var app: any;

//http://flowtype.org/docs/declarations.html
declare module AltJS {

  declare interface StoreReduce {
    action:any;
    data: any;
  }

  export interface ActionsClass {
    //generateActions?( ...action:Array<string>):void;
    generateActions( ...action:Array<string>):void;
    actions?:Actions;
  }

  export interface Action<T> {
    ( args:T):void;
    defer(data:any):void;
  }

  export type Actions = {[action:string]:Action<any>};

  declare class Alt {
    // constructor(config?:AltConfig);
    actions:Actions;
    // bootstrap(jsonData:string):void;
    // takeSnapshot( ...storeNames:Array<string>):string;
    // flush():Object;
    // recycle( ...stores:Array<AltJS.AltStore<any>>):void;
    // rollback():void;
    // dispatch(action?:AltJS.Action<any>, data?:Object, details?:any):void;
    //
    //Actions methods
    addActions(actionsName:string, ActionsClass: ActionsClassConstructor):void;
    createActions<T>(ActionsClass: ActionsClassConstructor, exportObj?: Object):T;
    createActions<T>(ActionsClass: ActionsClassConstructor, exportObj?: Object, ...constructorArgs:Array<any>):T;
    generateActions<T>( ...actions:Array<string>):T;
    getActions(actionsName:string):AltJS.Actions;
    //
    // //Stores methods
    // addStore(name:string, store:StoreModel<any>, saveStore?:boolean):void;
    // createStore<S>(store:StoreModel<S>, name?:string):AltJS.AltStore<S>;
    // getStore(name:string):AltJS.AltStore<any>;
  }

  declare function ActionsClassConstructor (alt:Alt) : AltJS.ActionsClass;

}




// declare interface Stack<T> {
//   push(item: T): void;
//   pop(): T;
//   isEmpty(): bool;
// }

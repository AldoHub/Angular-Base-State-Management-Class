import { HttpClient, HttpContext, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, take, tap, throwError } from 'rxjs';

export interface ApiOptions { 
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe: 'events';
  context?: HttpContext;
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?: {
    includeHeaders?: string[];
  } | boolean;
} 

export class StateBase<T> {
  resources: T[] = [];
  selectedResource: T | undefined = undefined;
  isLoading = false;
  errorsOnLoading = false;
  isLoadingUpdate = false;
  errorsOnUpdating = false;
  errorsOnDeleting = false;
  isLoadingDelete = false;
  errorsOnCreate = false;
  isLoadingCreate = false;
}


export enum BaseActions {
  Get = 'Get',
  Update = 'Update',
  Delete = 'Delete',
  Create = 'Create'
}


export type Actions<TCustomActions> = TCustomActions | BaseActions;


@Injectable({
  providedIn: 'root'
})
export class StateBaseService<T, StateClass extends StateBase<T>> {

  protected readonly httpClient = inject(HttpClient);
  baseUrl = 'http://localhost:3000';
  
  //all the types should have an "id"
  key: keyof T  = 'id' as keyof T;

  initialState: StateClass = new StateBase() as StateClass;

  //set the initial state of the app
  state = signal<StateClass>(this.initialState);

  constructor() { }

  protected get(url: string , apiOptions?: ApiOptions): Observable<T[]> {
    //update the state values before the call
    this.updateState({
      isLoading: true,
      errorsOnLoading: false
    });
    
    return this.httpClient.get<T[]>( `${this.baseUrl}/${url}`/*, apiOptions*/).pipe(
      take(1),
      catchError((err) => this._catchError(err, {errorsOnLoading: true, isLoading: false})),
      tap((resources: T[]) =>
        this.updateState({
          resources,
          isLoading: false,
          errorsOnLoading: false
        })
      )
    );
  }


  protected update(url: string, resource: T, apiOptions?: ApiOptions): Observable<T> {
    //update the state values before the call
    this.updateState({
      isLoadingUpdate: true,
      errorsOnUpdating: false
    });
    
    return this.httpClient.put<T>(`${this.baseUrl}/${url}`, resource /*, apiOptions */).pipe(
      take(1),
      catchError((err) => this._catchError(err, {errorsOnUpdating: true, isLoadingUpdate: false})),
      tap((resource: T) =>{
        const resources = this.upsertResource(resource, this.state().resources); 
        this.updateState({
          resources,
          isLoadingUpdate: false,
          errorsOnUpdating: false
        })
      }
        
      )
    );
  }


  protected create(url: string, resource: T, apiOptions?: ApiOptions): Observable<T> {
    //update the state values before the call
    this.updateState({
      isLoadingCreate: true,
      errorsOnCreate: false
    });
    
    return this.httpClient.post<T>(`${this.baseUrl}/${url}`, resource /*, apiOptions*/).pipe(
      take(1),
      catchError((err) => this._catchError(err, {errorsOnCreate: true, isLoadingCreate: false})),
      tap((resource: T) =>{
        const resources = this.upsertResource(resource, this.state().resources); 
        this.updateState({
          resources,
          isLoadingCreate: false,
          errorsOnCreate: false
        })
      }
        
      )
    );
  }


  protected delete(url: string, resource: T, apiOptions?: ApiOptions): Observable<void> {
    //update the state values before the call
    this.updateState({
      isLoadingDelete: true,
      errorsOnDeleting: false
    });
    
    return this.httpClient.delete<void>(`${this.baseUrl}/${url}`/*, apiOptions*/).pipe(
      take(1),
      catchError((err) => this._catchError(err, {errorsOnDeleting: true, isLoadingDelete: false})),
      tap(() =>{
        
        const resources = this.state().resources.filter((r) => r[this.key] !== resource[this.key]);
        this.updateState({
          resources,
          isLoadingDelete: false,
          errorsOnDeleting: false
        })
        
      }
        
      )
    );
  }


  //updates or inserts the data
  protected upsertResource(resource: T, resources: T[]) {
    const index = resources.findIndex((i) => i[this.key] === resource[this.key]);
    //update the value or push it into the array of resources if it doesnt exist
    index > -1 ? (resources[index] = resource) : resources.push(resource);

    return resources;

  }


  //update a "part" of the state - using the main class or the inherited class set on the components
  protected updateState(newState: Partial<StateBase<T>> | Partial<StateClass>){
    //update the state signal
    this.state.set({
      ...this.state(),
      ...newState,
    });

  }


  protected _catchError(err: any, newState: Partial<StateBase<T>> | Partial<StateClass>) {
    this.updateState(newState);
    return throwError(() => new Error(err.message));
  }



}

import { Injectable } from '@angular/core';
import { Actions, BaseActions, StateBase, StateBaseService } from './state-base.service';
import { catchError, Observable, tap } from 'rxjs';


export interface Article {
  id?: number;
  title: string;
  content: string
}


class ArticleState extends StateBase<Article> {
  isLoadingCustomData = false;
  errorsLoadingCustomData = false;
}

//CRUD actions are already handled by the BaseService - custom actions would go here
export enum ArticleActions {}


@Injectable({
  providedIn: 'root'
})
export class ArticleService extends StateBaseService<Article, ArticleState>{

  override initialState = new ArticleState();

  //this is an custom function - that uses custom ArticleService data
  customHttpCall(): Observable<Article[]>{
    this.updateState({
      isLoadingCustomData: true,
      errorsLoadingCustomData: false
    });

    return this.httpClient.get<Article[]>(`${this.baseUrl}/articles`).pipe(
      catchError((err) => 
        this._catchError(err, {
          isLoadingCustomData: false,
          errorsLoadingCustomData: true
        })
      ),
      tap((resources) => {
        this.updateState({
          resources,
          isLoadingCustomData: false,
          errorsLoadingCustomData: false
        })
      })
    );
  }


  //Below are BaseService methods inherited by this class
  override get(): Observable<Article[]>{
    return super.get('articles');
  }


  override update(url='articles', payload: Article): Observable<Article>{
    return super.update(url, payload);
  }


  override create(url='articles', payload: Article): Observable<Article>{
    return super.create(url, payload);
  }
 

  override delete(url='articles', payload: Article): Observable<void>{
    return super.delete(`${url}/${payload.id}`, payload);
  }
 
 
}

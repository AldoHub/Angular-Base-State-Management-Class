import { inject, Injectable } from '@angular/core';
import { ArticleService } from './article.service';

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  constructor() { }

  //inject all the new services that need global here
  articleState = inject(ArticleService);

}

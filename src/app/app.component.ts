import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FacadeService } from './services/facade.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Article } from './services/article.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
 
  title = 'ang_base_services';
  //using this facade to get the state of everything
  stateFacade = inject(FacadeService);

  fb = new FormBuilder();
  form = this.fb.group({
    id: this.fb.control(-1, {nonNullable: true}),
    title: this.fb.control('', {nonNullable: true}),
    content: this.fb.control('', {nonNullable: true}),
  });



  getArticles(){
   //---using the getter for the articles
   //this.stateFacade.articleState.get().subscribe();

   //using the custom call function
   this.stateFacade.articleState.customHttpCall().subscribe();
  }


  toggleEdit(article: Article): void{
    this.form.patchValue(article);
  }


  createOrUpdate(): void{
    const article = this.form.value as Article;
    const isCreate = article.id === -1;

    if(isCreate) delete article.id;

    isCreate ? 
    this.stateFacade.articleState.create('articles', article).subscribe() :
    this.stateFacade.articleState.update(`articles/${article.id}`, article).subscribe()

    this.form.reset();
  }


  deleteArticle(article: Article): void{
    this.stateFacade.articleState.delete(`articles`, article).subscribe();
  }


  ngOnInit(): void {
   this.getArticles();
  }

}


//TODO: 48:00
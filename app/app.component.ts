import { Component } from '@angular/core';
import Datastore = require('nedb');

import { Injectable } from '@angular/core';
import { Http, Response, Headers,RequestOptions  } from '@angular/http';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Component({
  selector: 'my-todo-app',
  moduleId: module.id,
  templateUrl: 'app.component.html',
})

@Injectable()

export class AppComponent {

  newTodo: string;
  listTodos: any;
  nbTodos: number;
  nbTodosCompleted: number;
  _filter: string;
  db: any;

  constructor(private http: Http) {
    this.db = new Datastore({ filename: 'path/to/datafile', autoload: true });
    this.getAll();
    this.getNb();
    this.getNbCompleted();
    this._filter = 'tout';
  }


  // Get all tasks
  getAll() {
    this.http.get('http://localhost:8080')
      .map(this.extractTasks)
      .catch(this.handleError)
      .subscribe(
      listTodos => this.listTodos = listTodos
      );
  }

  extractTasks(res: Response) {
    let body = res.json();
    return body || {};
  }



  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }






  // Get number tasks
  getNb() {
    this.db.count({}, (err: Error, count: number) => {
      if (err) throw err;
      this.nbTodos = count;
    });
  }


  // Get number tasks completed
  getNbCompleted() {
    this.db.count({ 'complete': true }, (err: Error, count: number) => {
      if (err) throw err;
      this.nbTodosCompleted = count;
    });
  }


  filter(filter: any) {

    if (filter == 'tout') {
      this.getAll();
    } else {

      this.db.find({ 'complete': filter }, (err: Error, todos: string[]) => {
        if (err) throw err;
        this.listTodos = todos;
      });

    }
    this._filter = filter;

  }

  onSubmit() {
    var todo: any = {
      name: this.newTodo,
      complete: false
    };
    //this.db.insert(todo);


console.log(todo);
let headers = new Headers({ 'Content-Type': 'application/json' });
let options = new RequestOptions({ headers: headers });
this.http.post('http://localhost:8080/new', { todo }, options)
                    .map(this.extractTasks)
      .catch(this.handleError);



    
    this.getAll();
    this.getNb();
    this._filter = 'tout';
    this.newTodo = '';
  }



  completeTodo(id: string) {
    this.db.findOne({ '_id': id }, (err: Error, todo: any) => {
      if (err) throw err;
      if (todo.complete === true) {
        todo.complete = false;
      } else {
        todo.complete = true;
      }
      this.db.update({ _id: id }, { $set: { complete: todo.complete } });
      this.getAll();
      this.getNbCompleted();
    });
  }

  deleteAllTodo() {
    if (confirm("Voulez-vous réellement supprimer toute les taches ?")) {
      this.db.remove({}, { multi: true });
      this.getAll();
      this.getNb();
      this.getNbCompleted();
    }
  }

  deleteAllTodoCompleted() {
    if (confirm("Voulez-vous réellement supprimer toute les taches effectuer ?")) {
      this.db.remove({ 'complete': true }, { multi: true });
      this.getAll();
      this.getNb();
      this.getNbCompleted();
      this._filter = 'tout';
    }
  }

  deleteTodo(id: string) {
    if (confirm("Voulez-vous réellement supprimer cette tache ?")) {
      this.db.remove({ '_id': id });
      this.getAll();
      this.getNb();
      this.getNbCompleted();
    }
  }

}

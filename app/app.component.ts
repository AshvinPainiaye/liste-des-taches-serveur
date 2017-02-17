import { Component } from '@angular/core';
import Datastore = require('nedb');

import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';


//import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs/Rx';
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
  connected: number;
  username: string;
  password: string;
  userId: any;

  constructor(private http: Http) {
    this.connected = 0;
  }



  // DEBUT LOGIN
  extractLogin(res: Response) {
    let body = res.json();
    return body || {};
  }

  onSubmitLogin() {
    var login: any = {
      username: this.username,
      password: this.password,
    };

    this.http.post('http://localhost:8080/login', login)
      .map(this.extractLogin)
      .catch(this.handleError)
      .subscribe(
      connected => {
        this.connected = connected.connected
        this.userId = connected.id
        this.getAll();
        this.getNb();
        this.getNbCompleted();
        this._filter = 'tout';

      });
  }
  // FIN LOGIN


  // NEW TASK
  onSubmit() {
    var todo: any = {
      task: this.newTodo,
      complete: false,
      user_id: this.userId
    };

    this.http.post('http://localhost:8080/new', todo)
      .map(this.extractTasks)
      .catch(this.handleError)
      .subscribe(
      listTodos => this.listTodos.push(todo)
      );

    this.getAll();
    this.getNb();
    this._filter = 'tout';
    this.newTodo = '';
  }

  // DEBUT GET ALL TASKS
  getAll() {
    this.http.get('http://localhost:8080/' + this.userId)
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
  // FIN GET ALL TASKS


  extractNbTasks(res: Response) {
    let body = res.json();
    return body[0]['COUNT(*)'] || {};
  }
  // Get number tasks
  getNb() {
    this.http.get('http://localhost:8080/tasks/count/' + this.userId)
      .map(this.extractNbTasks)
      .catch(this.handleError)
      .subscribe(
      listTodos => this.nbTodos = listTodos
      );
  }
  // Get number tasks completed
  getNbCompleted() {
    this.http.get('http://localhost:8080/tasks/complete/' + this.userId)
      .map(this.extractNbTasks)
      .catch(this.handleError)
      .subscribe(
      listTodos => this.nbTodosCompleted = listTodos
      );
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

  filter(filter: any) {

    if (filter == 'tout') {
      this.getAll();
    } else {

      /*this.db.find({ 'complete': filter }, (err: Error, todos: string[]) => {
        if (err) throw err;
        this.listTodos = todos;
      });*/

    }
    this._filter = filter;
  }


  completeTodo(id: string) {
    var todo: any = {
      id: id,
    };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    this.http.post('http://localhost:8080/complete', todo)
      .map(this.extractTasks)
      .catch(this.handleError)
      .subscribe(
      listTodos => this.listTodos.push(todo)
      );

    this.getAll();
    this.getNbCompleted();
  }


  // DEBUT DELETE 
  deleteAllTodo() {
    if (confirm("Voulez-vous réellement supprimer toute les taches ?")) {
      this.http.delete('http://localhost:8080/delete/all/' + this.userId)
        .map(this.extractTasks)
        .catch(this.handleError)
        .subscribe(
        listTodos => this.listTodos = listTodos
        );

      this.getAll();
      this.getNb();
      this.getNbCompleted();
    }
  }

  deleteAllTodoCompleted() {
    if (confirm("Voulez-vous réellement supprimer toute les taches effectuer ?")) {
    this.http.delete('http://localhost:8080/delete/all/complete/' + this.userId)
        .map(this.extractTasks)
        .catch(this.handleError)
        .subscribe(
        listTodos => this.listTodos = listTodos
        );

      this.getAll();
      this.getNb();
      this.getNbCompleted();
      this._filter = 'tout';
    }
  }

  deleteTodo(id: string) {
    if (confirm("Voulez-vous réellement supprimer cette tache ?")) {
      this.http.delete('http://localhost:8080/delete/' + id)
        .map(this.extractTasks)
        .catch(this.handleError)
        .subscribe(
        listTodos => this.listTodos = listTodos
        );
      this.getAll();
      this.getNb();
      this.getNbCompleted();
    }
  }
  // FIN DELETE

}

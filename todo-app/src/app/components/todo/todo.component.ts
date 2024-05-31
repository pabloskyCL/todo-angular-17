import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, todoModel } from '../../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {

  constructor(){
    console.log('constructor here')
    effect( () => {

      console.log('effect')
      localStorage.setItem('todos', JSON.stringify(this.todoList()));
    })
  }

  ngOnInit() {
    const storage = localStorage.getItem('todos');
    if(storage){
      this.todoList.set(JSON.parse(storage));
    }
  }

  todoList = signal<todoModel[]>([
  ]);

  filter = signal<FilterType>('all');

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todoList = this.todoList();

    if(filter === 'active') {
      return todoList.filter((todo) => todo.completed === false);
    }

    if(filter === 'completed'){
      return todoList.filter((todo)=> todo.completed === true);
    }

    return todoList;

  });

  newTodo = new FormControl('',{
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  });

  addTodo() {
    const newTodoTitle = this.newTodo.value.trim();
    if(this.newTodo.valid && newTodoTitle !== ''){
      
      const todo: todoModel = {
        id: this.todoList().length + 1,
        completed: false,
        title : newTodoTitle,
        editing: false
      }

      this.todoList.update((prevTodos) => [...prevTodos, todo]);
      this.newTodo.reset();

      return;
    }

    this.newTodo.reset();
  };

  toggleTodo(todoId: number){
    this.todoList.update((prevTodos) => prevTodos.map((todo) => {
      return todo.id === todoId ? {...todo,completed: !todo.completed} : todo
    }
  ));
  }

  saveTitle(todoId: number, event: Event){
    const title = (event.target as HTMLInputElement).value;
    this.todoList.update((prevTodos) => 
      prevTodos.map((todo) =>{
        if(todo.id === todoId && todo.title !== title) {
            todo.title = title;
        }
        todo.editing = false;
        return todo;
      }));


  }

  updateEditState(todoId: number){
    return this.todoList.update((prevTodos) => prevTodos.map((todo) => {
      return todo.id === todoId ? {...todo,editing: true} : {...todo, editing: false}
    }));
  }

  deleteTodo(todoId: number){
    this.todoList.update((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
  }

  changeFilter(filterString: FilterType){
    this.filter.set(filterString);
  };
}

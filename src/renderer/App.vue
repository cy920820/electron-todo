<template>
  <div>
    <div class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          autofocus="autofocus"
          autocomplete="off"
          placeholder="What needs to be done?"
          class="new-todo"
          v-model.trim="newTodoTitle"
          @keyup.enter="addNewTodo"
        >
      </header>
      <section class="main">
        <input id="toggle-all" type="checkbox" class="toggle-all" v-model="allDone">
        <label for="toggle-all" v-show="todoList.length">Mark all as complete</label>
        <ul class="todo-list" v-if="todoList.length">
          <li class="todo" :class="{completed: todo.completed, editing: editedTodo === todo}" v-for="(todo, index) in filterTodoList" :key="index">
            <div class="view">
              <input type="checkbox" class="toggle" v-model="todo.completed">
              <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
              <button class="destroy" @click="delTodo(todo)"></button>
            </div>
            <input type="text" class="edit" v-todo-focus="todo === editedTodo"  v-model.trim="todo.title" @blur="cancleEditTodo(todo)" @keyup.enter="doneEditTodo(todo)">
          </li>
        </ul>
      </section>
      <footer class="footer" v-if="todoList.length" v-cloak>
        <span class="todo-count">
          <strong>{{remaining}}</strong> {{remaining | pluralize}} remaining
        </span>
        <ul class="filters">
          <li>
            <a href="#/all" :class="{selected: visibility === 'all'}" >All</a>
          </li>
          <li>
            <a href="#/active" :class="{selected: visibility === 'active'}">Active</a>
          </li>
          <li>
            <a href="#/completed" :class="{selected: visibility === 'completed'}" >Completed</a>
          </li>
        </ul>
        <button class="clear-completed" v-if="todoList.length > remaining" @click="deleteCompleted">Clear completed</button>
      </footer>
    </div>
    <footer class="info">
      <p>Double-click to edit a todo</p>
      <p>The style UI refers to TodoMVC</p>
      <p>Created By <a href="javascript:void(0)">@Cui Yang</a></p>
      <p>Technical support: <a href="javascript:void(0)">Electron</a>, <a href="javascript:void(0)">Vue</a></p>
    </footer>
  </div>
</template>

<script>
import './app.styl'
import { getLocal, setLocal } from './helper/utils.js'

let filters = {
  all (todos) {
    return todos
  },

  active (todos) {
    return todos.filter((todo) => {
      return !todo.completed
    })
  },

  completed (todos) {
    return todos.filter((todo) => {
      return todo.completed
    })
  }
}

export default {
  name: 'todoapp',
  data () {
    return {
      newTodoTitle: '',
      todoList: [],
      ids: [],
      lastId: 0,
      visibility: 'all',
      editedTodo: null
    }
  },

  filters: {
    pluralize (remaining) {
      return remaining > 1 ? 'items' : 'item'
    }
  },

  computed: {
    filterTodoList () {
      return filters[this.visibility](this.todoList)
    },

    // active todo的数量
    remaining () {
      return filters.active(this.todoList).length
    },

    // 全选
    allDone: {
      get () {
        return this.remaining === 0
      },

      set (val) {
        this.todoList.forEach(item => {
          item.completed = val
        })
      }
    }
  },

  methods: {
    addNewTodo () {
      let title = this.newTodoTitle
      if (!title) return
      let todoList = this.todoList
      let ids = this.ids
      let id
      if (ids.length) {
        id = Math.max.apply(null, ids) + 1
      } else {
        id = this.lastId
      }
      let newTodo = {
        title,
        completed: false,
        id
      }
      todoList.push(newTodo)
      setLocal('todoList', todoList)
      this.newTodoTitle = ''
    },

    delTodo (todo) {
      this.todoList.splice(this.todoList.indexOf(todo), 1)
    },

    onHashChange () {
      var visibility = window.location.hash.replace(/#\/?/, '')
      if (filters[visibility]) {
        this.visibility = visibility
      } else {
        window.location.hash = ''
        this.visibility = 'all'
      }
    },

    // 删除已完成todo
    deleteCompleted () {
      this.todoList = filters.active(this.todoList)
    },

    editTodo (todo) {
      this.beforeEditCache = todo.title
      this.editedTodo = todo
    },

    cancleEditTodo (todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },

    doneEditTodo (todo) {
      if (!this.editedTodo) return
      this.editedTodo = null
      if (!todo.title) {
        this.delTodo(todo)
      }
    }
  },

  // 自定义指令主要目的是操作元素
  directives: {
    'todo-focus' (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  },

  watch: {
    todoList: {
      handler (val) {
        // 处理id
        if (val.length) {
          val.forEach(item => {
            this.ids.push(item.id)
          })
        } else {
          this.ids = []
          this.lastId = 0
        }

        setLocal('todoList', this.todoList)
      },

      deep: true // 监听对象内部值的变化
    }
  },

  created () {
    // 初始化数据
    let local = getLocal('todoList')

    this.selectedTab = window.location.hash

    if (local && local.length) {
      this.todoList = local
    }
  },

  beforeMount () {
    // handle routing
    window.addEventListener('hashchange', this.onHashChange)
    this.onHashChange()
  },

  beforeDestroy () {
    window.removeEventListener('hashchange', this.onHashChange)
  }
}
</script>

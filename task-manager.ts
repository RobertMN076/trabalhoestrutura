

class HashTable<T> {
  private storage: { [key: string]: T } = {};

  public set(key: string, value: T): void {
    this.storage[key] = value;
  }

  public get(key: string): T | undefined {
    return this.storage.hasOwnProperty(key) ? this.storage[key] : undefined;
  }

  public delete(key: string): boolean {
    if (this.storage.hasOwnProperty(key)) {
      delete this.storage[key];
      return true;
    }
    return false;
  }


  public getAllValues(): T[] {
    const values: T[] = [];
    // Itera sobre as chaves do objeto de forma segura
    for (const key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        values.push(this.storage[key]);
      }
    }
    return values;
  }

  public clear(): void {
      this.storage = {};
  }

  public loadData(data: [string, T][]): void {
    this.clear();
    for (const [key, value] of data) {
        const taskValue = value as any;
        if (taskValue.dateTime) {
            this.set(key, { ...taskValue, dateTime: new Date(taskValue.dateTime) });
        } else {
            this.set(key, value);
        }
    }
  }


  public toArray(): [string, T][] {
    const entries: [string, T][] = [];
     // Itera sobre as chaves do objeto de forma segura
    for (const key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        entries.push([key, this.storage[key]]);
      }
    }
    return entries;
  }
}


interface Task {
  id: string;
  description: string;
  dateTime: Date;
}


class TaskManager {
  private tasks: HashTable<Task>;
  private storageKey: string;

  constructor(storageKey: string = 'myTasksWithHashTable') {
    this.storageKey = storageKey;
    this.tasks = new HashTable<Task>();
    this.loadFromLocalStorage();
  }


  public addTask(description: string, dateTime: Date): Task {
    const id = `task_${Date.now()}`;
    const newTask: Task = { id, description, dateTime };
    this.tasks.set(id, newTask);
    this.saveToLocalStorage();
    return newTask;
  }


  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }


  public listAllTasks(): Task[] {
    return this.tasks.getAllValues().sort(
      (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
    );
  }


  public deleteTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }


  private saveToLocalStorage(): void {
    try {

      const dataToStore = this.tasks.toArray();
      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Erro ao salvar tarefas no localStorage:", error);
    }
  }


  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsedData: [string, Task][] = JSON.parse(data);

        this.tasks.loadData(parsedData);
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas do localStorage:", error);
      this.tasks = new HashTable<Task>();
    }
  }
}



const taskManager = new TaskManager();
console.log("TaskManager pronto para uso.");
console.log("Tarefas carregadas do localStorage (se existirem).");


const initialTasks = taskManager.listAllTasks();
if (initialTasks.length > 0) {
    console.log("\n--- Tarefas já existentes ---");
    initialTasks.forEach(task => {
        console.log(`- ${task.description} em ${task.dateTime.toLocaleDateString()}`);
    });
} else {
    console.log("\nNenhuma tarefa encontrada. Adicionando novas...");

    taskManager.addTask("Implementar a funcionalidade de login", new Date("2025-07-29T09:00:00"));
    taskManager.addTask("Revisar o código do colega", new Date("2025-07-29T14:00:00"));
}

const taskParaDeletar = taskManager.addTask("Tarefa temporária para deletar", new Date());


console.log("\n--- Lista de Todas as Tarefas (ordenadas) ---");
const allTasks = taskManager.listAllTasks();
allTasks.forEach(task => {
  console.log(`ID: ${task.id} | Descrição: ${task.description} | Horário: ${task.dateTime.toLocaleString()}`);
});


console.log(`\n--- Buscando a tarefa com ID: ${taskParaDeletar.id} ---`);
const foundTask = taskManager.getTask(taskParaDeletar.id);
console.log(foundTask ? `Tarefa encontrada: ${foundTask.description}` : "Tarefa não encontrada.");


console.log(`\n--- Excluindo a tarefa com ID: ${taskParaDeletar.id} ---`);
const isDeleted = taskManager.deleteTask(taskParaDeletar.id);
console.log(isDeleted ? "Tarefa excluída com sucesso!" : "Falha ao excluir tarefa.");


console.log("\n--- Lista Final de Tarefas ---");
const finalTasks = taskManager.listAllTasks();
finalTasks.forEach(task => {
  console.log(`- ${task.description}`);
});

console.log("\nExperimente recarregar a página. As tarefas persistirão no localStorage!");

export {}


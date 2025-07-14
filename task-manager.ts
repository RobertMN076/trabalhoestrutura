// =============== 1. Implementação da HashTable (VERSÃO CORRIGIDA) ===============
// Esta versão é compatível com ambientes JavaScript mais antigos
// e não causa o erro de compilação.

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

  /**
   * Retorna todos os valores armazenados na HashTable.
   * (Reescrito para não usar Object.values)
   */
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

  /**
   * Retorna os dados como um array de pares [chave, valor].
   * (Reescrito para não usar Object.entries)
   */
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

// =============== 2. Interface da Tarefa ===============
interface Task {
  id: string;
  description: string;
  dateTime: Date;
}

// =============== 3. Classe Gerenciadora de Tarefas ===============
// Esta classe agora usa nossa implementação de HashTable.
class TaskManager {
  private tasks: HashTable<Task>;
  private storageKey: string;

  constructor(storageKey: string = 'myTasksWithHashTable') {
    this.storageKey = storageKey;
    this.tasks = new HashTable<Task>();
    this.loadFromLocalStorage();
  }

  // Adiciona uma nova tarefa
  public addTask(description: string, dateTime: Date): Task {
    const id = `task_${Date.now()}`;
    const newTask: Task = { id, description, dateTime };
    this.tasks.set(id, newTask);
    this.saveToLocalStorage();
    return newTask;
  }

  // Busca uma tarefa pelo ID
  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  // Retorna todas as tarefas, ordenadas por data
  public listAllTasks(): Task[] {
    return this.tasks.getAllValues().sort(
      (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
    );
  }

  // Exclui uma tarefa pelo ID
  public deleteTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  // Salva a HashTable no localStorage
  private saveToLocalStorage(): void {
    try {
      // Usamos o método toArray() para converter os dados para um formato serializável
      const dataToStore = this.tasks.toArray();
      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Erro ao salvar tarefas no localStorage:", error);
    }
  }

  // Carrega as tarefas do localStorage para a HashTable
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsedData: [string, Task][] = JSON.parse(data);
        // Usamos o método loadData() para popular a HashTable
        this.tasks.loadData(parsedData);
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas do localStorage:", error);
      this.tasks = new HashTable<Task>();
    }
  }
}


// =============== 4. Exemplo de Uso ===============

// --- INÍCIO DA EXECUÇÃO ---

// 1. Inicializa o gerenciador de tarefas
// Ele tentará carregar tarefas de execuções anteriores do localStorage
const taskManager = new TaskManager();
console.log("TaskManager pronto para uso.");
console.log("Tarefas carregadas do localStorage (se existirem).");

// Para fins de demonstração, vamos imprimir o que foi carregado
const initialTasks = taskManager.listAllTasks();
if (initialTasks.length > 0) {
    console.log("\n--- Tarefas já existentes ---");
    initialTasks.forEach(task => {
        console.log(`- ${task.description} em ${task.dateTime.toLocaleDateString()}`);
    });
} else {
    console.log("\nNenhuma tarefa encontrada. Adicionando novas...");
    // 2. Adicionando novas tarefas (só se não houver nenhuma)
    taskManager.addTask("Implementar a funcionalidade de login", new Date("2025-07-29T09:00:00"));
    taskManager.addTask("Revisar o código do colega", new Date("2025-07-29T14:00:00"));
}

const taskParaDeletar = taskManager.addTask("Tarefa temporária para deletar", new Date());

// 3. Listando todas as tarefas
console.log("\n--- Lista de Todas as Tarefas (ordenadas) ---");
const allTasks = taskManager.listAllTasks();
allTasks.forEach(task => {
  console.log(`ID: ${task.id} | Descrição: ${task.description} | Horário: ${task.dateTime.toLocaleString()}`);
});

// 4. Buscando uma tarefa específica
console.log(`\n--- Buscando a tarefa com ID: ${taskParaDeletar.id} ---`);
const foundTask = taskManager.getTask(taskParaDeletar.id);
console.log(foundTask ? `Tarefa encontrada: ${foundTask.description}` : "Tarefa não encontrada.");

// 5. Excluindo a tarefa temporária
console.log(`\n--- Excluindo a tarefa com ID: ${taskParaDeletar.id} ---`);
const isDeleted = taskManager.deleteTask(taskParaDeletar.id);
console.log(isDeleted ? "Tarefa excluída com sucesso!" : "Falha ao excluir tarefa.");

// 6. Listando tarefas após a exclusão
console.log("\n--- Lista Final de Tarefas ---");
const finalTasks = taskManager.listAllTasks();
finalTasks.forEach(task => {
  console.log(`- ${task.description}`);
});

console.log("\nExperimente recarregar a página. As tarefas persistirão no localStorage!");

export {}

// --- FIM DA EXECUÇÃO ---

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


// O coração do nosso sistema é uma HashTable. 
// Ela funciona como um arquivo onde cada pasta tem uma etiqueta única (uma "chave"). 
// Isso torna a busca e o acesso aos dados extremamente rápidos.
var HashTable = (function () {
    function HashTable() {
        this.storage = {};
    }
    HashTable.prototype.set = function (key, value) {
        this.storage[key] = value;
    };
    HashTable.prototype.get = function (key) {
        return this.storage.hasOwnProperty(key) ? this.storage[key] : undefined;
    };
    HashTable.prototype.delete = function (key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
            return true;
        }
        return false;
    };

    HashTable.prototype.getAllValues = function () {
        var values = [];

        for (var key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                values.push(this.storage[key]);
            }
        }
        return values;
    };
    HashTable.prototype.clear = function () {
        this.storage = {};
    };
    HashTable.prototype.loadData = function (data) {
        this.clear();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var _a = data_1[_i], key = _a[0], value = _a[1];
            var taskValue = value;
            if (taskValue.dateTime) {
                this.set(key, __assign(__assign({}, taskValue), { dateTime: new Date(taskValue.dateTime) }));
            }
            else {
                this.set(key, value);
            }
        }
    };


    HashTable.prototype.toArray = function () {
        var entries = [];

        for (var key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                entries.push([key, this.storage[key]]);
            }
        }
        return entries;
    };
    return HashTable;
}());


// O TaskManager é a classe que utiliza nossa HashTable para executar as ações principais: adicionar, remover e listar tarefas.
var TaskManager =  (function () {
    function TaskManager(storageKey) {
        if (storageKey === void 0) { storageKey = 'myTasksWithHashTable'; }
        this.storageKey = storageKey;
        this.tasks = new HashTable();
        this.loadFromLocalStorage();
    }

    TaskManager.prototype.addTask = function (description, dateTime) {
        var id = "task_".concat(Date.now());
        var newTask = { id: id, description: description, dateTime: dateTime };
        this.tasks.set(id, newTask);
        this.saveToLocalStorage();
        return newTask;
    };
 
    TaskManager.prototype.getTask = function (id) {
        return this.tasks.get(id);
    };

    TaskManager.prototype.listAllTasks = function () {
        return this.tasks.getAllValues().sort(function (a, b) { return a.dateTime.getTime() - b.dateTime.getTime(); });
    };

    TaskManager.prototype.deleteTask = function (id) {
        var deleted = this.tasks.delete(id);
        if (deleted) {
            this.saveToLocalStorage();
        }
        return deleted;
    };

    // Para que as tarefas não desapareçam quando o usuário fecha ou recarrega a página, nós as salvamos diretamente no navegador usando o localStorage.
    TaskManager.prototype.saveToLocalStorage = function () {
        try {

            var dataToStore = this.tasks.toArray();
            localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
        }
        catch (error) {
            console.error("Erro ao salvar tarefas no localStorage:", error);
        }
    };

    TaskManager.prototype.loadFromLocalStorage = function () {
        try {
            var data = localStorage.getItem(this.storageKey);
            if (data) {
                var parsedData = JSON.parse(data);

                this.tasks.loadData(parsedData);
            }
        }
        catch (error) {
            console.error("Erro ao carregar tarefas do localStorage:", error);
            this.tasks = new HashTable();
        }
    };
    return TaskManager;
}());

var taskManager = new TaskManager();
console.log("TaskManager pronto para uso.");
console.log("Tarefas carregadas do localStorage (se existirem).");

var initialTasks = taskManager.listAllTasks();
if (initialTasks.length > 0) {
    console.log("\n--- Tarefas já existentes ---");
    initialTasks.forEach(function (task) {
        console.log("- ".concat(task.description, " em ").concat(task.dateTime.toLocaleDateString()));
    });
}
else {
    console.log("\nNenhuma tarefa encontrada. Adicionando novas...");

}
var taskParaDeletar = taskManager.addTask("Tarefa temporária para deletar", new Date());

console.log("\n--- Lista de Todas as Tarefas (ordenadas) ---");
var allTasks = taskManager.listAllTasks();
allTasks.forEach(function (task) {
    console.log("ID: ".concat(task.id, " | Descri\u00E7\u00E3o: ").concat(task.description, " | Hor\u00E1rio: ").concat(task.dateTime.toLocaleString()));
});

console.log("\n--- Buscando a tarefa com ID: ".concat(taskParaDeletar.id, " ---"));
var foundTask = taskManager.getTask(taskParaDeletar.id);
console.log(foundTask ? "Tarefa encontrada: ".concat(foundTask.description) : "Tarefa não encontrada.");

console.log("\n--- Excluindo a tarefa com ID: ".concat(taskParaDeletar.id, " ---"));
var isDeleted = taskManager.deleteTask(taskParaDeletar.id);
console.log(isDeleted ? "Tarefa excluída com sucesso!" : "Falha ao excluir tarefa.");

console.log("\n--- Lista Final de Tarefas ---");
var finalTasks = taskManager.listAllTasks();
finalTasks.forEach(function (task) {
    console.log("- ".concat(task.description));
});
console.log("\nExperimente recarregar a página. As tarefas persistirão no localStorage!");


document.addEventListener('DOMContentLoaded', function () {

    const taskManager = new TaskManager();

    const taskForm = document.getElementById('task-form');
    const descriptionInput = document.getElementById('description');
    const datetimeInput = document.getElementById('datetime');
    const taskListUl = document.getElementById('task-list');



    // Finalmente, precisa mostrar as tarefas na tela e permitir que o usuário interaja com elas. Fazemos isso manipulando o HTML diretamente com JavaScript.
    function renderTasks() {

        taskListUl.innerHTML = '';

        const tasks = taskManager.listAllTasks();

        if (tasks.length === 0) {
            taskListUl.innerHTML = '<li class="head size">Nenhuma tarefa cadastrada.</li>';
            return;
        }

        tasks.forEach(function (task) {
            const li = document.createElement('li');
            li.textContent = `${task.description} - ${task.dateTime.toLocaleString('pt-BR')}`;


            li.appendChild(document.createElement('br'));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.setAttribute('data-task-id', task.id); 
            deleteButton.className = 'delete-button'; 

            li.appendChild(deleteButton);
            taskListUl.appendChild(li);
        });
    }

    // Evento para adicionar uma nova tarefa
    taskForm.addEventListener('submit', function (event) {
        event.preventDefault(); 

        const description = descriptionInput.value;
        const dateTime = new Date(datetimeInput.value);

        if (description && !isNaN(dateTime.getTime())) {
            taskManager.addTask(description, dateTime);
            renderTasks(); 
            taskForm.reset(); 
        }
    });

    
    taskListUl.addEventListener('click', function (event) {
        if (event.target && event.target.nodeName === 'BUTTON') {
            const taskId = event.target.getAttribute('data-task-id');
            taskManager.deleteTask(taskId);
            renderTasks(); 
        }
    });

    
    renderTasks();
});

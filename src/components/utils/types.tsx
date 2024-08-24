type board = {
  id: string;
  name: string;
  editedAt: Date;
  createdAt: Date;
  columns: columns;
  description: string;
  totalTasks: number;
};

type columns = {
  [key: string]: column;
};

type column = {
  id: string;
  tasks: task[];
  name: string;
  color: string;
  collpased: boolean;
};

type task = {
  id: string;
  state: string;
  name: string;
  editedAt: Date;
  createdAt: Date;
  description: string;
};

export type { board, task, columns, column };

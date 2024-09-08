import { columns, task } from "components/utils/types";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import TaskDetailsModal from "./TaskDetailsModal";
import NewTaskModal from "./NewTaskModal";
import { Plus } from "lucide-react";

type kanBanProps = {
  cols: columns;
};

export default function ListView({ cols }: kanBanProps) {
  const [newTaskSelectedCol, setNewTaskSelectedCol] = useState<string | null>(
    null,
  );
  const [selectedTask, setSelectedTask] = useState<task | null>(null);
  const taskModalRef = useRef<HTMLDialogElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  function openNewTaskModal(colId: string) {
    if (modalRef.current) {
      setNewTaskSelectedCol(colId);
      modalRef.current.showModal();
    }
  }
  function openTaskDetailsModal(task: task) {
    if (taskModalRef.current) {
      setSelectedTask(task);
      taskModalRef.current.showModal();
    }
  }

  function activeTaskDetailsViaKeyPress(
    event: React.KeyboardEvent,
    task: task,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.target === event.currentTarget) {
        openTaskDetailsModal(task);
      }
    }
  }

  return (
    <div
      className={`max-w-[100vw] flex-1 overflow-x-auto px-5 pb-5 pr-10 pt-1 outline-none`}
    >
      <div className="mb-1">
        <button
          tabIndex={-1}
          onClick={() => openNewTaskModal("todo")}
          className="flex select-none items-center justify-center gap-2 rounded bg-background px-3 py-1.5 text-sm font-medium text-foreground outline-none focus-visible:ring"
        >
          <Plus strokeWidth={1.7} size={15} className="stroke-foreground/70" />
          Add Task
        </button>
      </div>
      <div className="relative after:z-10 after:h-full after:w-full after:text-center after:text-sm after:font-medium after:text-foreground after:content-[attr(data-info)]">
        {Object.entries(cols).map(([, value]) => {
          return (
            <div>
              {value.tasks.map((task) => {
                return (
                  <div
                    tabIndex={0}
                    onClick={() => openTaskDetailsModal(task)}
                    onKeyUp={(event) =>
                      activeTaskDetailsViaKeyPress(event, task)
                    }
                    className={`flex cursor-pointer items-center justify-between gap-2 border-b-2 border-foreground/15 bg-background px-3 py-2 outline-none ring-inset focus-visible:ring`}
                  >
                    <div className="">
                      <p className="line-clamp-1 text-sm font-medium">
                        {task.name}
                      </p>
                      <p className="line-clamp-1 max-w-xl break-all text-xs text-foreground/70">
                        {task.description}
                      </p>
                    </div>
                    <div
                      className={`flex ${value.color} items-center gap-2 rounded px-2 py-0.5 text-sm uppercase tracking-wide text-whiteStroke`}
                    >
                      <p className={`rounded font-semibold`}>{task.state}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {createPortal(
        <TaskDetailsModal ref={taskModalRef} taskDetails={selectedTask} />,
        document.body,
      )}
      {createPortal(
        <NewTaskModal colName={newTaskSelectedCol} ref={modalRef} />,
        document.body,
      )}
    </div>
  );
}

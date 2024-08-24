import { produce } from "immer";
import { forwardRef, useState } from "react";
import { FilePenLine, Trash2 } from "lucide-react";

import { ActiveBoardContext, PlanningContext } from "App";
import { task } from "components/utils/types";
import { formatRelativeDate } from "components/utils/utils";
import useAppContext from "customHooks/useContext";
import { toast } from "sonner";

type taskDetailsProps = {
  taskDetails: task | null;
};
const TaskDetailsModal = forwardRef<HTMLDialogElement, taskDetailsProps>(
  ({ taskDetails }, ref) => {
    const { activeBoard } = useAppContext(ActiveBoardContext);
    const [editActive, setEditState] = useState(false);
    const { boards, setBoards } = useAppContext(PlanningContext);
    function closeModal() {
      if (ref && "current" in ref && ref.current) {
        setEditState(false);
        ref.current.close();
      }
    }

    function deleteTask(taskId: string) {
      const newState = produce(boards, (draft) => {
        const board = draft.find((board) => board.id === activeBoard);
        if (!board || !taskDetails) return;
        const filteredTasks = board.columns[taskDetails.state].tasks.filter(
          (task) => task.id !== taskId,
        );
        board.columns[taskDetails.state].tasks = filteredTasks;
        board.totalTasks -= 1;
        board.editedAt = new Date();
      });
      setBoards(newState);
      closeModal();
      toast.success("Task deleted successfully!");
      localStorage.setItem("boards", JSON.stringify(newState));
    }

    function editTaks(event: React.FormEvent, taskId: string | undefined) {
      event.preventDefault();
      if (!taskId) return;
      const target = event.target as HTMLFormElement;
      const nameInput = target.elements.namedItem(
        "editTaskName",
      ) as HTMLInputElement;
      const descriptionInput = target.elements.namedItem(
        "editTaskDescription",
      ) as HTMLTextAreaElement;
      if (!nameInput || !descriptionInput) return;
      const taskName = nameInput.value;
      const taskDescription = descriptionInput.value;
      if (taskName === "" || taskName.length < 4) {
        nameInput.focus();
        return;
      }
      const newState = produce(boards, (draft) => {
        draft.forEach((board) => {
          if (board.id === activeBoard) {
            Object.values(board.columns).forEach((col) => {
              if (col.name === taskDetails?.state) {
                col.tasks.forEach((task) => {
                  if (task.id === taskId) {
                    task.name = taskName;
                    task.description = taskDescription;
                  }
                });
              }
            });
          }
        });
      });
      closeModal();
      setBoards(newState);
      localStorage.setItem("boards", JSON.stringify(newState));
      toast.success("Task updated successfully");
    }

    return (
      <dialog
        ref={ref}
        className="outline-none backdrop:bg-blackStroke/75"
        onClose={closeModal}
      >
        <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[750px]">
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold">
              {editActive ? "Editing task" : "Task Details"}
            </p>
          </div>
          <div className="mt-5"></div>
          {taskDetails !== null && !editActive ? (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="mb-2 flex gap-1.5">
                  <button
                    className="select-none rounded bg-foreground/10 p-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                    onClick={() => setEditState(!editActive)}
                  >
                    <FilePenLine
                      size={18.5}
                      strokeWidth={1.7}
                      className="stroke-foreground"
                    />
                  </button>
                  <button
                    onClick={() => deleteTask(taskDetails.id)}
                    className="select-none rounded bg-error/10 p-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Trash2
                      size={18.5}
                      strokeWidth={1.7}
                      className="stroke-error"
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded text-sm font-medium underline decoration-dotted underline-offset-2">
                  {taskDetails.state === "InProgress" ? (
                    <div>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></span>
                      </span>
                    </div>
                  ) : null}
                  <p className="capitalize">{taskDetails.state}</p>
                </div>
                <p className="text-xl font-semibold">{taskDetails.name}</p>
                <p className="text-sm text-foreground/80">
                  created {formatRelativeDate(new Date(taskDetails.createdAt))}
                </p>
              </div>
              <p className="text text-foreground/80">
                {taskDetails.description}
              </p>
              <br />
            </div>
          ) : null}

          {editActive ? (
            <form
              onSubmit={(e) => editTaks(e, taskDetails?.id)}
              className="mt-4 space-y-3"
            >
              <div className="space-y-1">
                <label htmlFor="editboardName">Task name</label>
                <input
                  type="text"
                  id="editTaskName"
                  maxLength={50}
                  name="taskName"
                  defaultValue={taskDetails?.name}
                  placeholder="Plot world domination... or buy milk"
                  className="w-full rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 focus-visible:ring"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="editboardDescription">
                  Description
                  <span className="text-neutral-500"> (Optional)</span>
                </label>
                <textarea
                  maxLength={200}
                  id="editTaskDescription"
                  name="taskDescription"
                  defaultValue={taskDetails?.description}
                  placeholder="Describe your task (be specific, be bold!)"
                  className="h-[100px] w-full resize-none rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 focus-visible:ring"
                ></textarea>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditState(false)}
                  className="select-none rounded px-2 py-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="select-none rounded bg-primary px-3 py-1 text-whiteStroke outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <button
              autoFocus
              onClick={closeModal}
              className="ml-auto flex select-none items-center justify-center gap-1 rounded bg-primary px-3 py-1 text-white outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
            >
              Ok
            </button>
          )}
        </div>
      </dialog>
    );
  },
);

export default TaskDetailsModal;

import { toast } from "sonner";
import { forwardRef } from "react";

import { task } from "components/utils/types";
import useAppContext from "customHooks/useContext";
import { ActiveBoardContext, PlanningContext } from "App";
import { current, produce } from "immer";

type newTaskModalProps = {
  colName: string | null;
};
const NewTaskModal = forwardRef<HTMLDialogElement, newTaskModalProps>(
  ({ colName }, ref) => {
    const { boards, setBoards } = useAppContext(PlanningContext);
    const { activeBoard } = useAppContext(ActiveBoardContext);
    function closeModal() {
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    }

    function createNewTask(event: React.FormEvent) {
      event.preventDefault();
      if (!colName) return;
      const target = event.target as HTMLFormElement;
      const nameInput = target.elements.namedItem(
        "taskName",
      ) as HTMLInputElement;
      const descriptionInput = target.elements.namedItem(
        "taskDescription",
      ) as HTMLTextAreaElement;
      if (!nameInput || !descriptionInput) return;
      const taskName = nameInput.value;
      const taskDescription = descriptionInput.value;
      if (taskName === "" || taskName.length < 4) {
        nameInput.focus();
        return;
      }

      const newTask: task = {
        state: colName,
        name: taskName,
        editedAt: new Date(),
        createdAt: new Date(),
        id: crypto.randomUUID(),
        description: taskDescription,
      };

      const newState = produce(boards, (draft) => {
        draft.find((board) => {
          if (board.id === activeBoard) {
            board.totalTasks += 1;
            console.log(current(board.columns), colName);
            board.columns[colName].tasks.push(newTask);
          }
        });
      });

      setBoards(newState);
      localStorage.setItem("boards", JSON.stringify(newState));
      target.reset();
      toast.success("Success!", {
        description: "Task Created successfully.",
      });
      closeModal();
    }

    return (
      <dialog
        ref={ref}
        className="outline-none backdrop:bg-blackStroke/75"
        onClose={closeModal}
      >
        <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[550px]">
          <p className="text-xl font-semibold">New Task</p>

          <form onSubmit={createNewTask} className="mt-4 space-y-3">
            <div className="space-y-1">
              <label htmlFor="taskName">Task name</label>
              <input
                type="text"
                id="taskName"
                maxLength={50}
                name="taskName"
                placeholder="Plot world domination... or buy milk"
                className="w-full rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 placeholder:text-foreground/40 focus-visible:ring"
              />
              <p className="mt-1.5 block text-sm text-foreground/60">
                Creating in&nbsp;
                <span className="font-medium capitalize underline decoration-dotted underline-offset-2">{`${colName}`}</span>
              </p>
            </div>
            <div className="space-y-1">
              <label htmlFor="taskDescription">
                Description
                <span className="text-neutral-500"> (Optional)</span>
              </label>
              <textarea
                maxLength={200}
                id="taskDescription"
                name="taskDescription"
                placeholder="Describe your task (be specific, be bold!)"
                className="h-[100px] w-full resize-none rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 placeholder:text-foreground/40 focus-visible:ring"
              ></textarea>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="select-none rounded px-2 py-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="select-none rounded bg-primary px-2 py-1 text-whiteStroke outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </dialog>
    );
  },
);

export default NewTaskModal;

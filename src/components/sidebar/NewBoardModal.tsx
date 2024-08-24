import { toast } from "sonner";
import { forwardRef } from "react";
import useAppContext from "customHooks/useContext";

import { board, column } from "components/utils/types";
import { ActiveBoardContext, PlanningContext } from "App";

type boardNames = "todo" | "inprogress" | "done";
const NewBoardModal = forwardRef<HTMLDialogElement, unknown>((_props, ref) => {
  const { boards, setBoards } = useAppContext(PlanningContext);
  const { setActiveBoard } = useAppContext(ActiveBoardContext);
  function closeModal() {
    if (ref && "current" in ref && ref.current) {
      ref.current.close();
    }
  }

  function generateCol(name: boardNames): column {
    const colors = {
      todo: "bg-gray-600",
      inprogress: "bg-green-600",
      done: "bg-red-600",
    };
    return {
      name,
      tasks: [],
      collpased: false,
      color: colors[name],
      id: crypto.randomUUID(),
    };
  }

  function createNewBoard(event: React.FormEvent) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const nameInput = target.elements.namedItem(
      "boardName",
    ) as HTMLInputElement;
    const descriptionInput = target.elements.namedItem(
      "boardDescription",
    ) as HTMLTextAreaElement;
    if (!nameInput || !descriptionInput) return;
    const boardName = nameInput.value.trim();
    const boardDescription = descriptionInput.value.trim();
    if (boardName === "" || boardName.length < 4) {
      nameInput.focus();
      return;
    }
    const newBoard: board = {
      columns: {
        todo: generateCol("todo"),
        inprogress: generateCol("inprogress"),
        done: generateCol("done"),
      },
      totalTasks: 0,
      name: boardName,
      editedAt: new Date(),
      createdAt: new Date(),
      id: crypto.randomUUID(),
      description: boardDescription,
    };

    console.log(newBoard);
    localStorage.setItem("boards", JSON.stringify([...boards, newBoard]));
    setBoards((prev) => [...prev, newBoard]);
    localStorage.setItem("lastSelectedBoard", JSON.stringify(newBoard.id));
    setActiveBoard(newBoard.id);
    target.reset();
    toast.success("Board Created Successfully");
    toast.info("Switched to new board");
    closeModal();
  }

  return (
    <dialog
      ref={ref}
      onClose={closeModal}
      className="outline-none backdrop:bg-blackStroke/75"
    >
      <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[550px]">
        <p className="text-xl font-semibold">Create New Board</p>

        <form onSubmit={createNewBoard} className="mt-4 space-y-3">
          <div className="space-y-1">
            <label htmlFor="boardName">Board name</label>
            <input
              type="text"
              id="boardName"
              maxLength={50}
              name="boardName"
              placeholder="Title your master plan"
              className="w-full rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 placeholder:text-foreground/40 focus-visible:ring"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="boardDescription">
              Description
              <span className="text-neutral-500"> (Optional)</span>
            </label>
            <textarea
              maxLength={200}
              id="boardDescription"
              name="boardDescription"
              placeholder="Board mission: What's the grand plan?"
              className="h-[100px] w-full resize-none rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 placeholder:text-foreground/40 focus-visible:ring"
            ></textarea>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="select-none rounded px-2 py-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
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
});

export default NewBoardModal;

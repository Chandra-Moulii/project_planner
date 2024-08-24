import { toast } from "sonner";
import { forwardRef, useState } from "react";

import { column } from "components/utils/types";
import useAppContext from "customHooks/useContext";
import { ActiveBoardContext, PlanningContext } from "App";
import { current, produce } from "immer";

const colors = [
  "bg-red-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-orange-600",
  "bg-gray-600",
];
const NewColModal = forwardRef<HTMLDialogElement, unknown>((_props, ref) => {
  const [selectedColor, setSelectedColor] = useState("");
  const { boards, setBoards } = useAppContext(PlanningContext);
  const { activeBoard } = useAppContext(ActiveBoardContext);
  function closeModal() {
    if (ref && "current" in ref && ref.current) {
      setSelectedColor("");
      ref.current.close();
    }
  }

  function createNewCol(event: React.FormEvent) {
    event.preventDefault();
    let colExists = false;
    const target = event.target as HTMLFormElement;
    const nameInput = target.elements.namedItem("colName") as HTMLInputElement;
    const colName = nameInput.value.trim();
    if (colName === "" || colName.length < 4) {
      nameInput.focus();
      return;
    }

    boards.forEach((board) => {
      if (board.id === activeBoard) {
        if (Object.keys(board.columns).includes(colName.toLowerCase())) {
          colExists = true;
          toast.error(`${colName.toLowerCase()} column already Exist`, {
            description: "Please choose a different name!",
          });
          return;
        }
      }
    });

    if (colExists) {
      closeModal();
      target.reset();
      return;
    }

    const newCol: column = {
      id: crypto.randomUUID(),
      name: colName.toLowerCase(),
      tasks: [],
      color: selectedColor,
      collpased: false,
    };
    if (selectedColor !== "") {
      newCol.color = selectedColor;
    } else {
      newCol.color = colors[Math.floor(Math.random() * colors.length)];
    }
    const newState = produce(boards, (draft) => {
      draft.forEach((board) => {
        if (board.id === activeBoard) {
          board.columns[colName.toLowerCase()] = newCol;
        }
      });
      console.log(current(draft));
    });

    setBoards(newState);
    closeModal();
    target.reset();
    setSelectedColor("");
    toast.success("New Column created successfully");
    localStorage.setItem("boards", JSON.stringify(newState));
  }

  return (
    <dialog
      ref={ref}
      className="outline-none backdrop:bg-blackStroke/75"
      onClose={closeModal}
    >
      <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[550px]">
        <p className="text-xl font-semibold">New Column</p>

        <form onSubmit={createNewCol} className="mt-4 space-y-3">
          <div className="space-y-2">
            <div className="space-y-1">
              <label htmlFor="colName">Column name</label>
              <input
                type="text"
                id="colName"
                maxLength={50}
                name="taskName"
                placeholder="Cancelled, Blocked, etc..."
                className="w-full rounded border-2 border-foreground/40 bg-background px-2 py-1.5 lowercase outline-none transition-colors duration-500 placeholder:text-foreground/40 focus-visible:ring"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/60">
                - Column name should be more than 4 characters
              </p>
              <p className="text-sm font-medium text-foreground/60">
                - Duplicate columns not allowed
              </p>
            </div>
            <div className="space-y-2">
              <p>Select a color</p>

              <div className="mb-4 flex space-x-2">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-6 w-6 ${color} relative grid place-items-center rounded-full outline-none ring-foreground ring-offset-1 ring-offset-background transition-all after:h-3 after:w-3 after:scale-0 after:rounded-full after:bg-whiteStroke focus-visible:ring-2 ${selectedColor === color ? "after:absolute after:z-10 after:scale-100 after:opacity-100" : "after:opacity-0"}`}
                    onClick={() => setSelectedColor(color)}
                  ></button>
                ))}
              </div>
            </div>
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
});

export default NewColModal;

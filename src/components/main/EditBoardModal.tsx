import { toast } from "sonner";
import { forwardRef, useEffect, useState } from "react";

import { ActiveBoardContext, PlanningContext } from "App";
import { board } from "components/utils/types";
import useAppContext from "customHooks/useContext";
import { produce } from "immer";

type editBoardModalProps = {
  boardInfo: board;
};

const EditBoardModal = forwardRef<HTMLDialogElement, editBoardModalProps>(
  ({ boardInfo }, ref) => {
    const { boards, setBoards } = useAppContext(PlanningContext);
    const { activeBoard } = useAppContext(ActiveBoardContext);
    const [initialFormValues, setIntitalFormValues] = useState({
      name: boardInfo.name,
      description: boardInfo.description,
    });
    function closeModal() {
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    }

    function editBoard(event: React.FormEvent) {
      event.preventDefault();
      const target = event.target as HTMLFormElement;
      const nameInput = target.elements.namedItem(
        "boardName",
      ) as HTMLInputElement;
      const descriptionInput = target.elements.namedItem(
        "boardDescription",
      ) as HTMLTextAreaElement;
      if (!nameInput || !descriptionInput) return;
      const boardName = nameInput.value;
      const boardDescription = descriptionInput.value;
      if (boardName === "" || boardName.length < 4) {
        nameInput.focus();
        return;
      }
      const newState = produce(boards, (draft) => {
        draft.forEach((board) => {
          if (board.id === activeBoard) {
            board.name = boardName;
            board.editedAt = new Date();
            board.description = boardDescription;
          }
        });
      });

      setBoards(newState);
      localStorage.setItem("boards", JSON.stringify(newState));
      target.reset();
      toast.success("Success!", {
        description: "All Changes saved",
      });
      closeModal();
    }

    useEffect(() => {
      setIntitalFormValues({
        name: boardInfo.name,
        description: boardInfo.description,
      });
    }, [activeBoard, boardInfo.description, boardInfo.name]);
    return (
      <dialog
        ref={ref}
        className="outline-none backdrop:bg-black/65"
        onClose={closeModal}
      >
        <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[550px]">
          <p className="text-xl font-semibold">Edit Board</p>

          <form onSubmit={editBoard} className="mt-4 space-y-3">
            <div className="space-y-1">
              <label htmlFor="editboardName">Board name</label>
              <input
                type="text"
                id="editboardName"
                maxLength={50}
                name="boardName"
                value={initialFormValues.name}
                onChange={(e) =>
                  setIntitalFormValues((prev) => {
                    return { ...prev, name: e.target.value };
                  })
                }
                placeholder="Title your master plan"
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
                id="editboardDescription"
                name="boardDescription"
                value={initialFormValues.description}
                onChange={(e) =>
                  setIntitalFormValues((prev) => {
                    return { ...prev, description: e.target.value };
                  })
                }
                placeholder="Board mission: What's the grand plan?"
                className="h-[100px] w-full resize-none rounded border-2 border-foreground/40 bg-background px-2 py-1.5 outline-none transition-colors duration-500 focus-visible:ring"
              ></textarea>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
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
        </div>
      </dialog>
    );
  },
);

export default EditBoardModal;

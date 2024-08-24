import { toast } from "sonner";
import { forwardRef, useState } from "react";

import { board } from "components/utils/types";
import useAppContext from "customHooks/useContext";
import { ActiveBoardContext, PlanningContext } from "App";
import { produce } from "immer";

type deleteBoardModalProps = {
  boardInfo: board;
};

const DeleteBoardModal = forwardRef<HTMLDialogElement, deleteBoardModalProps>(
  ({ boardInfo }, ref) => {
    const { boards, setBoards } = useAppContext(PlanningContext);
    const [selectedBoard, setSelectedBoard] = useState({
      id: "None",
      value: "None",
    });
    const { setActiveBoard } = useAppContext(ActiveBoardContext);
    function closeModal() {
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
        setSelectedBoard({
          id: "None",
          value: "None",
        });
      }
    }

    function deleteBoard(boardId: string) {
      if (selectedBoard.id !== "None") {
        let toBeDeletedBoard: board;
        let toBeDeletedBoardIndex: number;
        const newState = produce(boards, (draft) => {
          draft.filter((board, index) => {
            if (board.id !== boardId) {
              return board;
            }
            toBeDeletedBoardIndex = index;
            toBeDeletedBoard = board;
          });
          if (toBeDeletedBoardIndex === -1) return;
          draft.splice(toBeDeletedBoardIndex, 1);
          draft.forEach((board) => {
            if (board.id === selectedBoard.id) {
              Object.values(board.columns).map((col) => {
                board.totalTasks += [
                  ...toBeDeletedBoard.columns[col.name].tasks,
                ].length;
                col.tasks = [
                  ...col.tasks,
                  ...toBeDeletedBoard.columns[col.name].tasks,
                ];
              });
            }
          });
        });
        setBoards(newState);
        localStorage.setItem("boards", JSON.stringify(newState));
        toast.success("Board Deleted Successfully", {
          description: `All tasks moved to board '${selectedBoard.value}'`,
        });
        setActiveBoard("");
        return;
      }
      const filteredBoards = boards.filter((board) => board.id !== boardId);
      setBoards(filteredBoards);
      localStorage.setItem("boards", JSON.stringify(filteredBoards));
      toast.success("Board Deleted Successfully");
      setActiveBoard("");
      console.log("sajdm");
      localStorage.setItem("lastSelectedBoard", "");
    }

    return (
      <dialog
        ref={ref}
        onClose={closeModal}
        className="outline-none backdrop:bg-black/65"
      >
        <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[550px]">
          <p className="text-xl font-semibold">Delete Board</p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="line-clamp-1">
                Are you sure you want to delete the following board?
              </p>
              <p className="line-clamp-1 font-semibold text-primary">
                {boardInfo.name}
              </p>
            </div>
            <div className="p-2">
              <p>You'll loose</p>
              <ul>
                <li>
                  - All tasks in this board ({boardInfo.totalTasks} total)
                </li>
              </ul>
            </div>
          </div>
          <div></div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="flex select-none items-center justify-center gap-1 rounded px-2 py-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteBoard(boardInfo.id)}
              className="flex select-none items-center justify-center gap-1 rounded bg-error px-2 py-1 text-white outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>
    );
  },
);

export default DeleteBoardModal;

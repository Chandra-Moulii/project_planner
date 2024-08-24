import { ActiveBoardContext, PlanningContext } from "App";
import useAppContext from "customHooks/useContext";
import { produce } from "immer";
import { FilePenLine, Trash2 } from "lucide-react";
import { forwardRef, useState } from "react";
import { toast } from "sonner";

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
const ManageColsModal = forwardRef<HTMLDialogElement, unknown>(
  (_props, ref) => {
    const { boards, setBoards } = useAppContext(PlanningContext);
    const { activeBoard } = useAppContext(ActiveBoardContext);
    const [selectedColor, setSelectedColor] = useState("");
    const [editActive, setEditActive] = useState(false);
    const [editId, setEditId] = useState<{
      id: string;
      prevName: string;
    } | null>(null);
    const activeBoardInfo = boards.find((board) => board.id === activeBoard);
    function closeModal() {
      if (ref && "current" in ref && ref.current) {
        setEditActive(false);
        ref.current.close();
      }
    }

    if (!activeBoardInfo) return;

    function deleteCol(colId: string, colName: string) {
      const newState = produce(boards, (draft) => {
        draft.forEach((board) => {
          if (board.id === activeBoard) {
            Object.values(board.columns).forEach((col) => {
              if (col.id === colId && col.name === colName) {
                delete board.columns[colName];
              }
            });
          }
        });
      });
      setBoards(newState);
      closeModal();
      toast.success("Column deleted successfully");
      localStorage.setItem("boards", JSON.stringify(newState));
    }

    function saveColChanges(event: React.FormEvent) {
      event.preventDefault();
      if (!editId?.id) return;
      let colExists = false;
      const target = event.target as HTMLFormElement;
      const nameInput = target.elements.namedItem(
        "editColName",
      ) as HTMLInputElement;

      if (
        selectedColor === "" &&
        editId.prevName === nameInput.value.toLowerCase()
      ) {
        console.log("nothing changed");
        setEditActive(false);
        return;
      }
      if (
        selectedColor !== "" &&
        editId.prevName === nameInput.value.toLowerCase()
      ) {
        const newState = produce(boards, (draft) => {
          draft.forEach((board) => {
            if (board.id === activeBoard) {
              Object.values(board.columns).forEach((col) => {
                if (col.id == editId.id) {
                  col.color = selectedColor;
                }
              });
            }
          });
        });
        setBoards(newState);
        setEditActive(false);
        localStorage.setItem("boards", JSON.stringify(newState));
        return;
      }

      if (!nameInput || nameInput.value.length < 4) {
        return nameInput.focus();
      }

      boards.forEach((board) => {
        if (board.id === activeBoard) {
          if (
            Object.keys(board.columns).includes(nameInput.value.toLowerCase())
          ) {
            colExists = true;
            toast.error(
              `${nameInput.value.toLowerCase()} column already Exist`,
              {
                description: "Please choose a different name!",
              },
            );
            return;
          }
        }
      });

      if (colExists) {
        closeModal();
        target.reset();
        return;
      }
      const newState = produce(boards, (draft) => {
        draft.forEach((board) => {
          if (board.id === activeBoard) {
            Object.values(board.columns).forEach((col) => {
              if (col.id == editId.id) {
                board.columns[nameInput.value] = board.columns[col.name];
                delete board.columns[col.name];
                col.name = nameInput.value;
                col.color = selectedColor !== "" ? selectedColor : col.color;
              }
            });
          }
        });
      });
      console.log(newState);
      setBoards(newState);
      setEditActive(false);
      localStorage.setItem("boards", JSON.stringify(newState));
    }
    return (
      <dialog
        ref={ref}
        onClose={closeModal}
        className="outline-none backdrop:bg-blackStroke/75"
      >
        <div className="fixed left-1/2 top-10 w-3/4 -translate-x-1/2 overflow-hidden rounded bg-background px-5 py-4 text-foreground md:w-[550px]">
          <p className="text-xl font-semibold">Manage {activeBoardInfo.name}</p>

          <div className="mt-5 space-y-2">
            {Object.values(activeBoardInfo.columns).map((col) => {
              return (
                <div key={col.id}>
                  {editActive && editId?.id === col.id ? (
                    <form
                      onSubmit={saveColChanges}
                      className="my-3 space-y-3 rounded-md bg-foreground/10 p-3"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="editColName"
                          name="editColName"
                          defaultValue={col.name}
                          placeholder="col name"
                          className="w-full rounded border-2 border-foreground/40 bg-background px-2 py-0.5 lowercase outline-none transition-colors duration-500 placeholder:text-foreground/40 focus-visible:ring"
                        />
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <button
                            type="submit"
                            className="select-none rounded bg-primary px-2 py-1 text-whiteStroke outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditActive(false)}
                            className="select-none rounded bg-error/20 px-3 py-1 text-error outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                          >
                            Cancel
                          </button>
                        </div>
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
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2 font-medium capitalize">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`grid h-4 w-4 place-items-center rounded-full ${col.color}`}
                        >
                          <div className="h-2 w-2 rounded-lg bg-white"></div>
                        </div>
                        <span>{`${col.name} `}</span>
                      </div>
                      {["todo", "inprogress", "done"].includes(col.name) ? (
                        <span className="text-sm font-medium text-foreground/50">
                          Can't modify !
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditActive(true);
                              setEditId({
                                id: col.id,
                                prevName: col.name,
                              });
                            }}
                            className="select-none rounded bg-foreground/10 p-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <FilePenLine
                              size={18.5}
                              strokeWidth={1.7}
                              className="stroke-foreground"
                            />
                          </button>
                          <button
                            onClick={() => deleteCol(col.id, col.name)}
                            className="select-none rounded bg-error/10 p-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <Trash2
                              size={18.5}
                              strokeWidth={1.7}
                              className="stroke-error"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <br />
          <button
            autoFocus
            onClick={closeModal}
            className="ml-auto flex select-none items-center justify-center gap-1 rounded bg-primary px-3 py-1 text-white outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
          >
            Ok
          </button>
        </div>
      </dialog>
    );
  },
);

export default ManageColsModal;

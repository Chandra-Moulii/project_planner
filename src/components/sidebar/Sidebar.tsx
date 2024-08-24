import { produce } from "immer";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Moon, Plus, Sun } from "lucide-react";

import NewBoardModal from "./NewBoardModal";
import useAppContext from "customHooks/useContext";
import { ActiveBoardContext, PlanningContext, ThemeContext } from "App";
import { board } from "components/utils/types";
import { formatRelativeDate } from "components/utils/utils";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

type state = {
  sidebarActive: boolean;
  setSidebarActiveState: React.Dispatch<React.SetStateAction<boolean>>;
};
type sidebarProps = {
  state: state;
};

export default function Sidebar({ state }: sidebarProps) {
  const [searchValue, setSearchValue] = useState("");
  const { boards, setBoards } = useAppContext(PlanningContext);
  const { theme, setTheme } = useAppContext(ThemeContext);
  const { sidebarActive, setSidebarActiveState } = state;
  const modalRef = useRef<HTMLDialogElement>(null);
  const { activeBoard, setActiveBoard } = useAppContext(ActiveBoardContext);

  function openNewBoardModal() {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  }

  function setActive(boardId: string) {
    if (boardId !== "" || boardId !== null) {
      setActiveBoard(boardId);
      localStorage.setItem("lastSelectedBoard", JSON.stringify(boardId));
    }
  }

  function activeBoardViaKeyPress(event: React.KeyboardEvent, boardId: string) {
    if (event.key === "Enter" || event.key === " ") {
      setActiveBoard(boardId);
      event.preventDefault();
      localStorage.setItem("lastSelectedBoard", JSON.stringify(boardId));
    }
  }

  function searchFilter(boards: board[]) {
    const filteredBoards = boards.filter((board) => {
      if (board.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return board;
      }
    });
    return filteredBoards;
  }

  function toggleTheme() {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }

  function handleDragEnd(results: DropResult) {
    if (results.destination !== null && results.destination !== undefined) {
      const newState = produce(boards, (draft) => {
        const removedItem = draft.splice(results.source.index, 1);
        if (results.destination) {
          draft.splice(results.destination.index, 0, removedItem[0]);
        }
      });
      setBoards(newState);
      localStorage.setItem("boards", JSON.stringify(newState));
    }
  }

  return (
    <div
      className={`bottom-0 top-0 h-screen shrink-0 grow-0 basis-[260px] border-r-2 border-foreground/10 ${sidebarActive ? "relative" : "absolute right-full"}`}
    >
      <div className={`p-1 ${sidebarActive ? "visible" : "hidden"}`}>
        <div className="flex items-center justify-between px-2 py-1">
          <a
            href="/"
            className="rounded px-1 text-primary outline-none ring-offset-background hover:underline focus-visible:ring"
          >
            <span className="font-serif text-xl font-semibold italic">
              Ppr.
            </span>
          </a>
          <button
            onClick={toggleTheme}
            data-tooltip-place="left"
            data-tooltip-id="_plannerTooltip"
            data-tooltip-content="Toggle theme"
            className="rounded bg-foreground/10 p-1 outline-none focus-visible:ring"
          >
            {theme === "dark" ? (
              <Sun size={18} strokeWidth={1.5} />
            ) : (
              <Moon
                size={20}
                strokeWidth={1.5}
                className="fill-foreground/50 stroke-none"
              />
            )}
          </button>
        </div>
        <hr className="my-2 border-foreground/25" />
        <div className="mt-4 px-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Boards ({boards.length})</span>

            <button
              data-tooltip-place="left"
              onClick={openNewBoardModal}
              data-tooltip-id="_plannerTooltip"
              data-tooltip-content="New board"
              className="flex select-none items-center justify-center gap-1 rounded bg-foreground/10 p-1 outline-none focus-visible:ring"
            >
              <Plus strokeWidth={1.7} size={17} />
            </button>
          </div>
          <div className="my-3">
            <input
              type="search"
              maxLength={50}
              placeholder="Search boards"
              onChange={(e) => setSearchValue(e.target.value)}
              className="duration-400 w-full rounded border-2 border-foreground/50 bg-background px-2 py-1.5 text-sm outline-none placeholder:text-foreground/40 focus-visible:border-foreground/70"
            />
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="Sidebar">
              {(provided, snapshot) => {
                return (
                  <div
                    className={`space-y-1 ${snapshot.isDraggingOver ? "rounded outline-dashed outline-2 outline-offset-4 outline-foreground/50" : ""}`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {boards.length === 0 && searchValue === "" ? (
                      <span className="text-sm text-foreground/60">
                        No boards yet create some
                      </span>
                    ) : null}
                    {searchFilter(boards).length === 0 && searchValue !== "" ? (
                      <span className="text-sm text-foreground/60">
                        No boards found!
                      </span>
                    ) : null}
                    {searchFilter(boards).map((board, index) => {
                      return (
                        <Draggable
                          draggableId={board.id}
                          index={index}
                          key={board.id}
                        >
                          {(provided, snapshot) => {
                            return (
                              <div
                                tabIndex={0}
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                onClick={() => setActive(board.id)}
                                onKeyUp={(event) =>
                                  activeBoardViaKeyPress(event, board.id)
                                }
                                className={`grid cursor-pointer select-none gap-0.5 rounded px-2 py-1.5 font-medium outline-none hover:bg-foreground/10 focus-visible:ring ${snapshot.isDragging ? "bg-background" : ""} ${activeBoard === board.id ? "bg-primary text-whiteStroke shadow-sm hover:bg-primary" : ""}`}
                              >
                                <p className="line-clamp-1 text-sm">
                                  {board.name}
                                </p>
                                <span className="text-xs font-normal">
                                  Edited{" "}
                                  {formatRelativeDate(new Date(board.editedAt))}
                                </span>
                              </div>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </DragDropContext>
          {createPortal(<NewBoardModal ref={modalRef} />, document.body)}
        </div>
      </div>

      {/* Affix for toggling sidebar */}
      <button
        data-tooltip-place="left"
        data-tooltip-id="_plannerTooltip"
        onClick={() => {
          localStorage.setItem("sidebarState", JSON.stringify(!sidebarActive));
          setSidebarActiveState(!sidebarActive);
        }}
        data-tooltip-content={`${sidebarActive ? "Close it!" : "Open Sidebar"}`}
        className={`absolute bottom-6 z-20 rounded bg-primary shadow outline-none transition-transform focus-visible:ring ${sidebarActive ? "right-3" : "left-[calc(100%+1rem)]"}`}
      >
        <ChevronLeft
          size={30}
          strokeWidth={1.5}
          className={`${sidebarActive ? "rotate-0" : "rotate-180 group-hover:translate-x-0.5"} stroke-whiteStroke transition-transform delay-100`}
        />
      </button>
    </div>
  );
}

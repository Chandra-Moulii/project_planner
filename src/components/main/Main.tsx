import { useRef, useState } from "react";
import { produce } from "immer";
import { createPortal } from "react-dom";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import {
  FilePenLine,
  KanbanIcon,
  ListFilter,
  MousePointerClick,
  Trash2,
} from "lucide-react";

import Kanban from "./Kanban";
import { task } from "components/utils/types";
import EditBoardModal from "./EditBoardModal";
import DeleteBoardModal from "./DeleteBoardModal";
import useAppContext from "customHooks/useContext";
import { ActiveBoardContext, PlanningContext } from "App";
import ListView from "./List";

export default function Main() {
  const [activeType, setActiveType] = useState<0 | 1>(0);
  const { boards, setBoards } = useAppContext(PlanningContext);
  const { activeBoard } = useAppContext(ActiveBoardContext);
  const deleteModalRef = useRef<HTMLDialogElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);

  const activeBoardInfo = boards.find((board) => board.id === activeBoard);

  if (activeBoard === "" || activeBoard === null) {
    return (
      <div className="grid h-screen flex-1 place-items-center px-5 py-3">
        <div>
          <p className="mb-1">
            <MousePointerClick
              size={40}
              strokeWidth={1}
              className="mx-auto fill-primary/50 stroke-primary"
            />
          </p>
          <span className="text-foreground/60">No board selected !!!</span>
        </div>
      </div>
    );
  }

  function openDeleteBoardModal() {
    if (deleteModalRef.current) {
      deleteModalRef.current.showModal();
    }
  }

  function openEditBoardModal() {
    if (editModalRef.current) {
      editModalRef.current.showModal();
    }
  }

  function handleDragEnd(results: DropResult) {
    const { destination, source } = results;
    if (destination === null || destination === undefined) return;

    if (source.droppableId === destination.droppableId) {
      if (source.index === destination.index) return;
    }

    const newState = produce(boards, (draft) => {
      let removedTask: task;
      draft.forEach((board) => {
        if (board.id === activeBoard) {
          Object.values(board.columns).forEach((col) => {
            if (col.id === source.droppableId) {
              [removedTask] = col.tasks.splice(source.index, 1);
            }
          });
          if (removedTask !== null) {
            Object.values(board.columns).forEach((col) => {
              if (col.id === destination.droppableId) {
                removedTask.state = col.name;
                col.tasks.splice(destination.index, 0, removedTask);
              }
            });
            board.editedAt = new Date();
          }
        }
      });
    });
    setBoards(newState);
    localStorage.setItem("boards", JSON.stringify(newState));
  }

  if (!activeBoardInfo) return;
  return (
    <div className="relative isolate flex max-w-[100vw] flex-1 shrink-0 flex-col overflow-x-auto bg-[url('https://images.unsplash.com/photo-1719743581496-b49b52756d18?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-fixed bg-center dark:bg-[url(https://images.unsplash.com/photo-1493673272479-a20888bcee10?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)]">
      <div className="absolute inset-0 -z-10 bg-foreground/15 dark:bg-black/10"></div>
      <div className="space-y-1.5 px-5 py-3">
        <div className="flex items-center gap-4">
          <h1 className="line-clamp-1 max-w-[500px] text-xl font-semibold">
            {activeBoardInfo.name}
          </h1>
          <div className="flex gap-1.5">
            <button
              data-tooltip-place="bottom"
              data-tooltip-id="_plannerTooltip"
              onClick={openEditBoardModal}
              data-tooltip-content="Edit Board"
              className="select-none rounded bg-foreground/10 p-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
            >
              <FilePenLine
                size={18.5}
                strokeWidth={1.7}
                className="stroke-foreground"
              />
            </button>
            <button
              data-tooltip-place="bottom"
              data-tooltip-id="_plannerTooltip"
              onClick={openDeleteBoardModal}
              data-tooltip-content="Delete Board"
              className="select-none rounded bg-error/10 p-1 outline-none focus-visible:ring active:translate-x-0.5 active:translate-y-0.5"
            >
              <Trash2 size={18.5} strokeWidth={1.7} className="stroke-error" />
            </button>
          </div>
        </div>
        <p className="line-clamp-2 text-sm">
          {activeBoardInfo.description || "(No description)"}
        </p>
      </div>
      <div className="flex px-5 text-sm">
        <button
          data-tooltip-place="right"
          data-tooltip-id="_plannerTooltip"
          data-tooltip-content="Kanban View"
          onClick={() => setActiveType(0)}
          className={`flex select-none items-center gap-2 rounded-l ${activeType === 0 ? "scale-105 bg-primary text-white transition-all" : "bg-background"} px-2 py-1 outline-none focus-visible:ring`}
        >
          <KanbanIcon size={20} strokeWidth={1.7} />
          {/* Kanban */}
        </button>
        <button
          data-tooltip-place="right"
          data-tooltip-id="_plannerTooltip"
          data-tooltip-content="List View"
          onClick={() => setActiveType(1)}
          className={`flex select-none items-center gap-2 rounded-r ${activeType === 1 ? "scale-105 bg-primary text-white transition-all" : "bg-background"} px-2 py-1 outline-none focus-visible:ring`}
        >
          <ListFilter size={20} strokeWidth={1.7} />
          {/* List */}
        </button>
      </div>
      <div className="mt-3 max-w-[100vw] flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          {activeType === 0 ? (
            <Kanban cols={activeBoardInfo.columns} />
          ) : (
            <ListView cols={activeBoardInfo.columns} />
          )}
        </DragDropContext>
      </div>
      {createPortal(
        <DeleteBoardModal ref={deleteModalRef} boardInfo={activeBoardInfo} />,
        document.body,
      )}
      {createPortal(
        <EditBoardModal ref={editModalRef} boardInfo={activeBoardInfo} />,
        document.body,
      )}
    </div>
  );
}

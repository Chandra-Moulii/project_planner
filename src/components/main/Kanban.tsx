import { columns, task } from "components/utils/types";
import { ChevronsLeft, GripVertical, Plus, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import NewTaskModal from "./NewTaskModal";
import { Draggable, Droppable } from "react-beautiful-dnd";
import TaskDetailsModal from "./TaskDetailsModal";
import { produce } from "immer";
import useAppContext from "customHooks/useContext";
import { ActiveBoardContext, PlanningContext } from "App";
import NewColModal from "./NewColModal";
import ManageColsModal from "./ManageColsModal";

type kanBanProps = {
  cols: columns;
};

export default function Kanban({ cols }: kanBanProps) {
  const [newTaskSelectedCol, setNewTaskSelectedCol] = useState<string | null>(
    null,
  );

  const [selectedTask, setSelectedTask] = useState<task | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const manageColsRef = useRef<HTMLDialogElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const taskModalRef = useRef<HTMLDialogElement>(null);
  const colModalRef = useRef<HTMLDialogElement>(null);
  const { boards, setBoards } = useAppContext(PlanningContext);
  const { activeBoard } = useAppContext(ActiveBoardContext);
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
  function openNewColModal() {
    if (colModalRef.current) {
      colModalRef.current.showModal();
    }
  }

  function openManageColsModal() {
    if (manageColsRef.current) {
      manageColsRef.current.showModal();
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

  function collpaseCol(colId: string) {
    const newState = produce(boards, (draft) => {
      draft.forEach((board) => {
        if (board.id === activeBoard) {
          Object.values(board.columns).forEach((col) => {
            if (col.id === colId) {
              col.collpased = !col.collpased;
            }
          });
        }
      });
    });
    setBoards(newState);
  }

  let offset = 0;
  let start = false;
  function handleMouseDown(e: React.MouseEvent) {
    offset = e.clientX;
    if (scrollBarRef.current && e.target === e.currentTarget) {
      start = true;
      scrollBarRef.current.style.cursor = "grab";
      document.getSelection()?.empty();
      scrollBarRef.current.style.userSelect = "none";
    }
  }

  function handleMouseUp() {
    start = false;
    offset = 0;
    if (scrollBarRef.current) {
      scrollBarRef.current.style.cursor = "default";
      scrollBarRef.current.style.userSelect = "auto";
    }
  }

  // TODO: Throttle below fn
  function handleMouseMove(e: React.MouseEvent) {
    if (!start) return;
    e.preventDefault();
    const scrollSpeed = 1;
    if (scrollBarRef.current) {
      const target = scrollBarRef.current as HTMLDivElement;
      target.scrollBy((offset - e.clientX) * scrollSpeed, 0);
    }
    offset = e.clientX;
  }

  return (
    <div
      ref={scrollBarRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`flex h-full max-w-[100vw] flex-1 gap-3 overflow-hidden overflow-x-auto px-5 pb-5 pr-10 pt-1 outline-none`}
    >
      {Object.entries(cols).map(([key, value]) => {
        return (
          <div
            key={value.id}
            className={`flex shrink-0 grow-0 basis-[300px] flex-col self-start rounded bg-background shadow-md transition-transform`}
          >
            <div
              className={`flex items-center justify-between gap-3 border-b-2 ${value.collpased ? "rounded" : ""} border-foreground/5 px-3 py-2`}
            >
              <div className="flex gap-3">
                <div
                  className={`flex ${value.color} items-center gap-2 rounded px-2 text-sm uppercase tracking-wide text-whiteStroke`}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-whiteStroke"></div>
                  <p className={`rounded font-semibold`}>{key}</p>
                </div>
                <span>{value.tasks.length}</span>
              </div>
              <div className="flex gap-1">
                <button
                  disabled
                  data-tooltip-place="bottom"
                  data-tooltip-id="_plannerTooltip"
                  onClick={() => collpaseCol(value.id)}
                  data-tooltip-content={`${value.collpased ? "Expand" : "Collpase"}`}
                  className="flex select-none items-center gap-1 rounded p-1 text-foreground/50 outline-none hover:bg-foreground/10 focus-visible:ring"
                >
                  <ChevronsLeft
                    size={18}
                    strokeWidth={1.7}
                    className={`${value.collpased ? "rotate-180" : ""} stroke-foreground/70 transition-transform`}
                  />
                </button>
                <button
                  data-tooltip-place="bottom"
                  data-tooltip-id="_plannerTooltip"
                  data-tooltip-content="New Task"
                  onClick={() => openNewTaskModal(value.name)}
                  className={`flex select-none items-center gap-1 rounded p-1 text-foreground/50 outline-none hover:bg-foreground/10 focus-visible:ring ${value.collpased ? "hidden" : ""}`}
                >
                  <Plus
                    size={15}
                    strokeWidth={1.7}
                    className="stroke-foreground/70"
                  />
                </button>
              </div>
            </div>
            <div className={`p-2 ${value.collpased ? "hidden" : ""}`}>
              <Droppable droppableId={value.id}>
                {(provided, snapshot) => {
                  return (
                    <div
                      className={`relative grid max-h-[450px] min-h-[10px] overflow-y-auto ${snapshot.isDraggingOver ? "rounded outline-dashed outline-2 outline-foreground/50" : ""}`}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {value.tasks.map((task, index) => {
                        return (
                          <Draggable
                            key={task.id}
                            index={index}
                            draggableId={task.id}
                          >
                            {(provided, snapshot) => {
                              return (
                                <div
                                  tabIndex={0}
                                  onClick={() => openTaskDetailsModal(task)}
                                  onKeyUp={(event) =>
                                    activeTaskDetailsViaKeyPress(event, task)
                                  }
                                  className={`flex cursor-pointer items-center gap-2 border-b-2 border-foreground/15 p-2 outline-none ring-inset focus-visible:ring ${snapshot.isDragging ? "mb-2 bg-background" : "bg-foreground/5"}`}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab rounded py-1 outline-none focus-visible:ring-2"
                                  >
                                    <GripVertical
                                      size={17}
                                      className="stroke-foreground/30"
                                    />
                                  </div>
                                  <div>
                                    <p className="line-clamp-1 text-sm font-medium">
                                      {task.name}
                                    </p>
                                    <p className="line-clamp-1 break-all text-xs text-foreground/70">
                                      {task.description}
                                    </p>
                                  </div>
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
              <div>
                <button
                  tabIndex={-1}
                  onClick={() => openNewTaskModal(value.name)}
                  className="mt-2 flex select-none items-center gap-1 rounded p-1 text-sm font-medium text-foreground/50 outline-none"
                >
                  <Plus
                    strokeWidth={1.7}
                    size={15}
                    className="stroke-foreground/70"
                  />
                  Add Task
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {createPortal(
        <NewTaskModal colName={newTaskSelectedCol} ref={modalRef} />,
        document.body,
      )}
      {createPortal(
        <TaskDetailsModal ref={taskModalRef} taskDetails={selectedTask} />,
        document.body,
      )}
      {createPortal(<NewColModal ref={colModalRef} />, document.body)}
      {createPortal(<ManageColsModal ref={manageColsRef} />, document.body)}
      <div className="grid shrink-0 gap-1.5 self-start">
        <button
          onClick={openNewColModal}
          className="flex select-none items-center justify-center gap-2 rounded bg-background px-3 py-2 text-sm font-medium text-foreground outline-none focus-visible:ring"
        >
          <Plus strokeWidth={1.7} size={15} />
          <span>Add Board</span>
        </button>
        <button
          onClick={openManageColsModal}
          className="flex select-none items-center justify-center gap-2 rounded bg-background px-3 py-2 text-sm font-medium text-foreground outline-none focus-visible:ring"
        >
          <Settings strokeWidth={1.7} size={15} />
          <span>Manage Col's</span>
        </button>
      </div>
    </div>
  );
}

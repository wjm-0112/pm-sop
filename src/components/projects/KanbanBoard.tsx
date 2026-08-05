'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { Card, Badge } from '@/components/ui';
import { TASK_STATUS, TASK_STATUS_ORDER, PRIORITY_COLOR } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Task, TaskStatus } from '@/lib/types';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

function Column({ status, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status}` });
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-slate-100 p-3 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{TASK_STATUS[status]}</span>
        <Badge className="bg-white text-slate-500">{tasks.length}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 ${isOver ? 'rounded-md bg-primary-50 ring-2 ring-primary/30' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <KanbanCard key={t.id} task={t} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="rounded border border-dashed border-border py-6 text-center text-xs text-slate-400">
            拖拽任务到此
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-border bg-surface p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{task.title}</span>
        <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLOR[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.assignee && <div className="text-xs text-slate-400">{task.assignee}</div>}
      {task.dueDate && (
        <div className="mt-1 text-[11px] text-slate-400">截止 {formatDate(task.dueDate)}</div>
      )}
    </div>
  );
}

export function KanbanBoard({
  tasks,
  onReorder,
}: {
  tasks: Task[];
  onReorder: (updates: { id: string; status: TaskStatus; sortOrder: number }[]) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byStatus = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === e.active.id) ?? null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // 目标列（从 over 的 id 推断：可能是 column id 或卡片 id）
    let targetStatus: TaskStatus = task.status;
    if (overId.startsWith('col-')) {
      targetStatus = overId.replace('col-', '') as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    // 重新计算该列的顺序
    const columnTasks = tasks
      .filter((t) => t.status === targetStatus && t.id !== activeId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const overIndex = overId.startsWith('col-')
      ? columnTasks.length
      : columnTasks.findIndex((t) => t.id === overId);

    const movedTask = { ...task, status: targetStatus };
    const newColumn =
      overIndex < 0
        ? [...columnTasks, movedTask]
        : [...columnTasks.slice(0, overIndex), movedTask, ...columnTasks.slice(overIndex)];

    const updates: { id: string; status: TaskStatus; sortOrder: number }[] = [];
    newColumn.forEach((t, i) => {
      updates.push({ id: t.id, status: targetStatus, sortOrder: i });
    });
    // 如果跨列，原列也需要重新排序
    if (task.status !== targetStatus) {
      const oldColumn = tasks
        .filter((t) => t.status === task.status && t.id !== activeId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      oldColumn.forEach((t, i) => {
        updates.push({ id: t.id, status: task.status, sortOrder: i });
      });
    }
    onReorder(updates);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUS_ORDER.map((status) => (
          <Column key={status} status={status} tasks={byStatus(status)} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="rounded-lg border border-primary bg-surface p-3 shadow-lg">
            <span className="text-sm font-medium text-slate-800">{activeTask.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

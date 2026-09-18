'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { ProjectCard } from '@/components/custom/project-card'

export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'

export type Project = {
  id: string
  title: string
  status: string
  dueDate: string | null
  client: { id: string; name: string }
}

export const COLUMNS: { status: Status; label: string }[] = [
  { status: 'NOT_STARTED', label: 'Not Started' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'DONE', label: 'Done' },
]

export const emptyColumns: Record<Status, Project[]> = {
  NOT_STARTED: [],
  IN_PROGRESS: [],
  REVIEW: [],
  DONE: [],
}

// closestCorners compares every droppable's corners - including every
// individual sortable card, not just the 4 column containers - so with
// unevenly-sized columns (e.g. one column packed with cards next to a
// short/empty one) it can resolve a drop to the wrong adjacent column even
// when the pointer is comfortably inside the intended one. Checking which
// droppable the pointer is literally inside of first (falling back to
// closestCenter only when the pointer is outside every droppable, e.g.
// dragging fast) is dnd-kit's own recommended fix for this class of bug in
// multi-container boards.
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) {
    return pointerCollisions
  }
  return closestCenter(args)
}

function findContainer(
  id: string,
  columns: Record<Status, Project[]>
): Status | undefined {
  if (id in columns) return id as Status
  return (Object.keys(columns) as Status[]).find((status) =>
    columns[status].some((project) => project.id === id)
  )
}

function Column({
  status,
  label,
  projects,
  disabled,
}: {
  status: Status
  label: string
  projects: Project[]
  disabled: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      data-testid="kanban-column"
      data-status={status}
      className="flex w-72 shrink-0 flex-col rounded-lg bg-gray-100 p-3 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-slate-700 dark:text-gray-400">
          {projects.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[120px] flex-1 space-y-2 rounded-md p-1 transition-colors ${
          isOver ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
        }`}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400 dark:border-slate-700 dark:text-gray-500">
              No projects
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} disabled={disabled} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export function KanbanBoard({
  columns,
  disabled,
  onDragEnd,
}: {
  columns: Record<Status, Project[]>
  disabled: boolean
  onDragEnd: (sourceStatus: Status, destStatus: Status, projectId: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const sourceStatus = findContainer(activeId, columns)
    const destStatus = findContainer(String(over.id), columns)

    if (!sourceStatus || !destStatus || sourceStatus === destStatus) return

    onDragEnd(sourceStatus, destStatus, activeId)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            projects={columns[column.status]}
            disabled={disabled}
          />
        ))}
      </div>
    </DndContext>
  )
}

export interface Task {
  id: number
  title: string
  description: string | null
  isDone: boolean
  createdAt: string
}

export interface TaskInput {
  title: string
  description: string | null
  isDone: boolean
}

export class ApiError extends Error {
  violations: Record<string, string>

  constructor(message: string, violations: Record<string, string> = {}) {
    super(message)
    this.violations = violations
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    const violations: Record<string, string> = {}
    for (const violation of data.violations ?? []) {
      violations[violation.propertyPath] = violation.message
    }
    throw new ApiError(data.detail ?? data.title ?? 'Ismeretlen hiba történt.', violations)
  }

  return data as T
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks')
}

export function createTask(input: TaskInput): Promise<Task> {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTask(id: number, input: Partial<TaskInput>): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(input),
  })
}

export function deleteTask(id: number): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' })
}

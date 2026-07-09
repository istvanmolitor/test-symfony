<script setup lang="ts">
import type { Task } from '@/api/tasks'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ApiError, deleteTask, listTasks, updateTask } from '@/api/tasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Toaster from '@/components/ui/sonner/Sonner.vue'
import TaskFormDialog from '@/components/TaskFormDialog.vue'
import TaskTable from '@/components/TaskTable.vue'

const tasks = ref<Task[]>([])
const loading = ref(true)
const dialogOpen = ref(false)
const editingTask = ref<Task | null>(null)

async function loadTasks() {
  loading.value = true
  try {
    tasks.value = await listTasks()
  }
  catch {
    toast.error('Nem sikerült betölteni a feladatokat.')
  }
  finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingTask.value = null
  dialogOpen.value = true
}

function openEditDialog(task: Task) {
  editingTask.value = task
  dialogOpen.value = true
}

function onSaved(task: Task) {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index === -1) {
    tasks.value.unshift(task)
  }
  else {
    tasks.value[index] = task
  }
  toast.success(editingTask.value ? 'Feladat módosítva.' : 'Feladat létrehozva.')
}

async function onToggle(task: Task, isDone: boolean) {
  const previous = task.isDone
  task.isDone = isDone
  try {
    await updateTask(task.id, { isDone })
  }
  catch (error) {
    task.isDone = previous
    toast.error(error instanceof ApiError ? error.message : 'Nem sikerült frissíteni a feladatot.')
  }
}

async function onRemove(task: Task) {
  try {
    await deleteTask(task.id)
    tasks.value = tasks.value.filter(t => t.id !== task.id)
    toast.success('Feladat törölve.')
  }
  catch {
    toast.error('Nem sikerült törölni a feladatot.')
  }
}

onMounted(loadTasks)
</script>

<template>
  <Toaster position="top-right" />

  <main class="mx-auto max-w-4xl p-6">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Feladatok</CardTitle>
        <Button @click="openCreateDialog">
          Új feladat
        </Button>
      </CardHeader>
      <CardContent>
        <p v-if="loading" class="text-muted-foreground">
          Betöltés…
        </p>
        <TaskTable
          v-else
          :tasks="tasks"
          @edit="openEditDialog"
          @toggle="onToggle"
          @remove="onRemove"
        />
      </CardContent>
    </Card>
  </main>

  <TaskFormDialog v-model:open="dialogOpen" :task="editingTask" @saved="onSaved" />
</template>

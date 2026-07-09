<script setup lang="ts">
import type { Task } from '@/api/tasks'
import { PencilIcon, Trash2Icon } from '@lucide/vue'
import { ref } from 'vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  toggle: [task: Task, isDone: boolean]
  remove: [task: Task]
}>()

const pendingDelete = ref<Task | null>(null)

function confirmDelete() {
  if (pendingDelete.value) {
    emit('remove', pendingDelete.value)
    pendingDelete.value = null
  }
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-10" />
        <TableHead>Cím</TableHead>
        <TableHead>Leírás</TableHead>
        <TableHead>Létrehozva</TableHead>
        <TableHead class="text-right">
          Műveletek
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="tasks.length === 0">
        <TableCell colspan="5" class="text-center text-muted-foreground">
          Nincs még feladat.
        </TableCell>
      </TableRow>
      <TableRow v-for="task in tasks" :key="task.id">
        <TableCell>
          <Checkbox
            :model-value="task.isDone"
            @update:model-value="(value) => emit('toggle', task, value === true)"
          />
        </TableCell>
        <TableCell :class="{ 'text-muted-foreground line-through': task.isDone }">
          {{ task.title }}
        </TableCell>
        <TableCell class="max-w-xs truncate text-muted-foreground">
          {{ task.description }}
        </TableCell>
        <TableCell class="text-muted-foreground">
          {{ new Date(task.createdAt).toLocaleString('hu-HU') }}
        </TableCell>
        <TableCell class="flex justify-end gap-2">
          <Badge v-if="task.isDone" variant="secondary">
            Kész
          </Badge>
          <Button variant="ghost" size="icon-sm" aria-label="Szerkesztés" @click="emit('edit', task)">
            <PencilIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Törlés" @click="pendingDelete = task">
            <Trash2Icon />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>

  <AlertDialog :open="pendingDelete !== null" @update:open="(value) => { if (!value) pendingDelete = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Feladat törlése</AlertDialogTitle>
        <AlertDialogDescription>
          Biztosan törlöd a(z) „{{ pendingDelete?.title }}” feladatot? Ez a művelet nem vonható vissza.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Mégse</AlertDialogCancel>
        <Button variant="destructive" @click="confirmDelete">
          Törlés
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

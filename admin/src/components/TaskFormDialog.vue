<script setup lang="ts">
import type { Task, TaskInput } from '@/api/tasks'
import { computed, reactive, ref, watch } from 'vue'
import { ApiError, createTask, updateTask } from '@/api/tasks'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  task: Task | null
}>()

const emit = defineEmits<{
  saved: [task: Task]
}>()

const isEditing = computed(() => props.task !== null)

const form = reactive({
  title: '',
  description: '',
  isDone: false,
})

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

watch(
  () => [open.value, props.task] as const,
  ([isOpen, task]) => {
    if (!isOpen)
      return

    form.title = task?.title ?? ''
    form.description = task?.description ?? ''
    form.isDone = task?.isDone ?? false
    errors.title = ''
    errors.description = ''
  },
  { immediate: true },
)

async function submit() {
  errors.title = ''
  errors.description = ''
  submitting.value = true

  const payload: TaskInput = {
    title: form.title,
    description: form.description.trim() === '' ? null : form.description,
    isDone: form.isDone,
  }

  try {
    const saved = props.task
      ? await updateTask(props.task.id, payload)
      : await createTask(payload)

    emit('saved', saved)
    open.value = false
  }
  catch (error) {
    if (error instanceof ApiError) {
      Object.assign(errors, error.violations)
    }
    throw error
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Feladat szerkesztése' : 'Új feladat' }}</DialogTitle>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="submit">
        <div class="grid gap-1.5">
          <Label for="task-title">Cím</Label>
          <Input id="task-title" v-model="form.title" :aria-invalid="!!errors.title" />
          <p v-if="errors.title" class="text-sm text-destructive">
            {{ errors.title }}
          </p>
        </div>

        <div class="grid gap-1.5">
          <Label for="task-description">Leírás</Label>
          <Textarea id="task-description" v-model="form.description" />
          <p v-if="errors.description" class="text-sm text-destructive">
            {{ errors.description }}
          </p>
        </div>

        <Label class="flex items-center gap-2">
          <Checkbox
            :model-value="form.isDone"
            @update:model-value="(value) => (form.isDone = value === true)"
          />
          Kész
        </Label>

        <DialogFooter>
          <Button type="submit" :disabled="submitting">
            Mentés
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

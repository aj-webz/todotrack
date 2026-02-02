  "use client"
  import { useForm } from "react-hook-form"
  import { z } from "zod"
  import { format } from "date-fns"
  import { CalendarIcon } from "lucide-react"
  import { Button } from "@/lib/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Textarea } from "@/components/ui/textarea"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Calendar } from "@/components/ui/calendar"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import { CreateTodoSchema } from "@repo/shared"
  import { useTodoStore } from "@/store/todo/todo.store"
  import TodoList from "./TodoList"

  type CreateTodoFormValues = z.infer<typeof CreateTodoSchema>

  export function TodoForm() {
    const addTodo = useTodoStore((s) => s.addTodo)
    const todos = useTodoStore((s) => s.todos)
    const clearError = useTodoStore((s) => s.clearError)
    const storeError = useTodoStore((s) => s.error)

    const {
      register,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors },
    } = useForm<CreateTodoFormValues>({
      defaultValues: {
        title: "",
        description: "",
        endDate: null,
      },
    })

    const endDate = watch("endDate")

    function onSubmit(values: CreateTodoFormValues) {
      clearError()

      addTodo({
        title: values.title,
        description: values.description,
        endDate: values.endDate ?? null,
      })

      reset()
    }

    return (
      <section className="flex p-15 w-full justify-evenly">
      <Card className="w-full max-w-xl bg-white">
        <CardHeader>
          <CardTitle>Create Todo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-900">
                Title
              </label>
              <Input
                placeholder="Build Kanban board"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-900">
                Description
              </label>
              <Textarea
                rows={4}
                placeholder="Describe the task in detail..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

          
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-900">
                End Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(endDate, "PPP")
                      : "Pick an end date (optional)"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ?? undefined}
                    onSelect={(date) =>
                      setValue("endDate", date ?? null, {
                        shouldDirty: true,
                      })
                    }
                    autoFocus
                  />
                </PopoverContent>
              </Popover>

              {errors.endDate && (
                <p className="text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
            {storeError && (
              <p className="text-sm font-medium text-red-600">
                {storeError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearError()
                  reset()
                }}
              >
                Reset
              </Button>

              <Button type="submit">
                Create Todo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <TodoList todos={todos} />
      </section>
    )
  }

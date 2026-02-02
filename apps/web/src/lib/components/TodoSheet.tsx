"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import type { SubmitHandler } from "react-hook-form";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useCreateTodo } from "@/queries/todo.queries";
import { CreateTodoSchema } from "@repo/shared";


type FormValues = z.infer<typeof CreateTodoSchema>;

export function CreateTodoSheet() {
  const createTodo = useCreateTodo();
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateTodoSchema),
    defaultValues: {
      title: "",
      description: "",
      endDate: null,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    createTodo.mutate(
      {
        title: values.title,
        description: values.description,
        endDate: values.endDate,
      },
      {
        onSuccess: () => {
          form.reset();
          setTimeout(() => setOpen(false), 0);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Todo
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full flex flex-col justify-between p-6 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-3xl">Create Todo</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* Title */}
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              placeholder="Assign the task"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              placeholder="Describe the task..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label>End Date</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("endDate")
                    ? format(form.watch("endDate")!, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("endDate") ?? undefined}
                  onSelect={(date) =>
                    form.setValue("endDate", date ?? null, {
                      shouldDirty: true,
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <SheetFooter className="mt-auto gap-2">
            <Button type="submit" disabled={createTodo.isPending}>
              {createTodo.isPending ? "Creating..." : "Create"}
            </Button>

            <SheetClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

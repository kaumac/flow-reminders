"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { format } from "date-fns"
import { ChevronDownIcon, PlusCircle } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useCreateReminder } from "@/hooks/use-reminders"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduled_date: z.date().optional(),
  scheduled_time: z.string().optional(),
})

export function ReminderDrawer() {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createReminder, isPending } = useCreateReminder()

  const form = useForm({
    defaultValues: {
      title: "",
      description: "" as string | undefined,
      scheduled_date: undefined as Date | undefined,
      scheduled_time: "10:30" as string | undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        let scheduled_time_iso: string | undefined

        if (value.scheduled_date) {
          const date = new Date(value.scheduled_date)
          if (value.scheduled_time) {
            const [hours, minutes] = value.scheduled_time.split(":")
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          }
          scheduled_time_iso = date.toISOString()
        }

        await createReminder({
          title: value.title,
          description: value.description,
          scheduled_time: scheduled_time_iso,
        })
        setOpen(false)
        form.reset()
      } catch (error) {
        console.error("Failed to create reminder", error)
      }
    },
    validators: {
      onChange: formSchema,
    },
    validatorAdapter: zodValidator(),
  })

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="lg">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Reminder
        </Button>
      </DrawerTrigger>
      {/* Overriding default bottom-sheet styles to create a proper right-side drawer */}
      <DrawerContent className="inset-x-auto inset-y-0 right-0 top-0 mt-0 h-full w-[400px] rounded-none border-l">
        <DrawerHeader>
          <DrawerTitle>Create Reminder</DrawerTitle>
          <DrawerDescription>Add a new reminder to your list.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0 flex-1 overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field
              name="title"
              validators={{
                onChange: formSchema.shape.title,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Buy milk"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
            <form.Field
              name="description"
              validators={{
                onChange: formSchema.shape.description,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Details..."
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <FieldGroup className="flex-row">
              <form.Field name="scheduled_date">
                {(field) => (
                  <Field className="flex-1">
                    <FieldLabel htmlFor="date-picker">Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date-picker"
                          className="h-10 w-full justify-between font-normal"
                        >
                          {field.state.value ? (
                            format(field.state.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">Select date</span>
                          )}
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => field.handleChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              </form.Field>

              <form.Field name="scheduled_time">
                {(field) => (
                  <Field className="w-32">
                    <FieldLabel htmlFor="time-picker">Time</FieldLabel>
                    <Input
                      type="time"
                      id="time-picker"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!canSubmit || isPending}
                >
                  {isPending || isSubmitting ? "Creating..." : "Create Reminder"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" size="lg">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

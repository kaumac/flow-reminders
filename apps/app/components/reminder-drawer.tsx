"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateReminder } from "@/hooks/use-reminders"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

export function ReminderDrawer() {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createReminder, isPending } = useCreateReminder()

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await createReminder(value)
        setOpen(false)
        form.reset()
      } catch (error) {
        console.error("Failed to create reminder", error)
      }
    },
    validatorAdapter: zodValidator(),
  })

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
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
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
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
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

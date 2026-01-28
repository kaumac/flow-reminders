"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { format } from "date-fns"
import { fromZonedTime } from "date-fns-tz"
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
import { Separator } from "@/components/ui/separator"

import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PhoneInput } from "@/components/ui/phone-input"
import { TimezonePicker } from "@/components/ui/timezone-picker"
import { useUser } from "@/hooks/use-user"
// @ts-ignore
import { countryCodeEmoji } from "country-code-emoji"
import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  scheduled_date: z.custom<Date>((v) => v instanceof Date, "Date is required"),
  scheduled_time: z.string(),
  timezone: z.string(),
  phone_type: z.enum(["user", "custom"]),
  custom_phone: z.string(),
}).superRefine((data, ctx) => {
  if (data.scheduled_date) {
    try {
      const dateStr = format(data.scheduled_date, "yyyy-MM-dd")
      const time = data.scheduled_time || "10:30"
      const dateTimeStr = `${dateStr}T${time}`
      
      let scheduledTime: Date
      if (data.timezone) {
        scheduledTime = fromZonedTime(dateTimeStr, data.timezone)
      } else {
        scheduledTime = new Date(dateTimeStr)
      }

      if (scheduledTime <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Time must be in the future",
          path: ["scheduled_date"],
        })
      }
    } catch (e) {
      // Ignore date parsing errors
    }
  }


})

type FormValues = z.infer<typeof formSchema>

interface ReminderDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ReminderDrawer({ open: controlledOpen, onOpenChange: setControlledOpen }: ReminderDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const { data: user } = useUser()
  const { mutateAsync: createReminder, isPending } = useCreateReminder()

  const form = useForm({
    // @ts-ignore
    validatorAdapter: zodValidator(),
    validators: {
      onChange: formSchema,
    },
    defaultValues: {
      title: "",
      description: "",
      scheduled_date: undefined as unknown as Date,
      scheduled_time: "10:30",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      phone_type: "user",
      custom_phone: "",
    } as FormValues,
    onSubmit: async ({ value, formApi }: { value: any, formApi: any }) => {

      try {
        let scheduled_time_iso: string | undefined

        if (value.scheduled_date) {
          const dateStr = format(value.scheduled_date, "yyyy-MM-dd")
          const time = value.scheduled_time || "10:30"
          
          // Construct the wall-clock time string (e.g., "2024-01-27T10:30")
          const dateTimeStr = `${dateStr}T${time}`

          if (value.timezone) {
            try {
              // Convert the wall-clock time to a Date object representing that time in the selected timezone
              // This returns a Date object that effectively matches the instant in UTC
              const zonedDate = fromZonedTime(dateTimeStr, value.timezone)
              scheduled_time_iso = zonedDate.toISOString()
            } catch (e) {
              console.error("Error converting timezone", e)
              // Fallback to local time interpretation if timezone conversion fails
              scheduled_time_iso = new Date(dateTimeStr).toISOString()
            }
          } else {
             // If no timezone is selected, assume local time
             scheduled_time_iso = new Date(dateTimeStr).toISOString()
          }
        }



        const phone_to_call = value.phone_type === "user" 
          ? user?.phone_number 
          : value.custom_phone

        // Validation already handled by schema above, but keeping safety check
        if (!phone_to_call) {
          console.error("No phone number selected")
          return
        }

        await createReminder({
          title: value.title,
          description: value.description,
          scheduled_time: scheduled_time_iso,
          phone_to_call: phone_to_call,
        })
        setOpen(false)
        form.reset()
      } catch (error) {
        console.error("Failed to create reminder", error)
      }
    },

  } as any) as any

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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-4 pb-0 flex-1 overflow-y-auto space-y-4">
            <form.Field name="title">
              {(field: any) => (
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
                  <form.Subscribe
                    selector={(state: any) => state.isSubmitted}
                  >
                    {(isSubmitted) => (
                      (field.state.meta.isTouched || isSubmitted) && field.state.meta.errors.length ? (
                        <p className="text-sm font-medium text-destructive">
                          {(field.state.meta.errors as any[]).map((e) => e?.message || e).join(", ")}
                        </p>
                      ) : null
                    )}
                  </form.Subscribe>
                </div>
              )}
            </form.Field>
            <form.Field name="description">
              {(field: any) => (
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
                  <form.Subscribe
                    selector={(state: any) => state.isSubmitted}
                  >
                    {(isSubmitted) => (
                      (field.state.meta.isTouched || isSubmitted) && field.state.meta.errors.length ? (
                        <p className="text-sm font-medium text-destructive">
                          {(field.state.meta.errors as any[]).map((e) => e?.message || e).join(", ")}
                        </p>
                      ) : null
                    )}
                  </form.Subscribe>
                </div>
              )}
            </form.Field>

            <Separator className="my-8" />

            <FieldGroup>
              <form.Field name="scheduled_date">
                {(field: any) => (
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
                          onSelect={(date) => field.handleChange(date as Date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              </form.Field>

              <div className="flex gap-4">
                <form.Field name="scheduled_time">
                  {(field: any) => (
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
                <form.Field name="timezone">
                  {(field: any) => (
                    <Field className="flex-[2]">
                      <FieldLabel htmlFor="timezone-picker">Timezone</FieldLabel>
                      <TimezonePicker
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            </FieldGroup>

            <form.Subscribe
              selector={(state: any) => [state.fieldMeta.scheduled_date?.errors, state.fieldMeta.scheduled_date?.isTouched, state.isSubmitted]}
            >
              {([errors, isTouched, isSubmitted]) => {
                const errorMsg = (errors as any[])?.map((e: any) => e?.message || String(e)).join(", ")
                if (!errorMsg || (!isTouched && !isSubmitted)) return null
                return (
                  <div className="mt-2 text-center">
                    <Badge variant="destructive">{errorMsg}</Badge>
                  </div>
                )
              }}
            </form.Subscribe>

            <Separator className="my-8" />

            <div className="space-y-4">
              <Label className="block mb-4">What number should we call?</Label>
              <form.Field name="phone_type">
                {(field: any) => (
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as "user" | "custom")}
                    className="gap-4"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="user" id="r-user" />
                      <Label htmlFor="r-user" className="flex items-center gap-2 cursor-pointer font-normal">
                        My number
                        {user?.phone_number && (
                          <Badge variant="secondary" className="gap-1">
                            {(() => {
                              try {
                                const parsed = parsePhoneNumber(user.phone_number)
                                if (parsed) {
                                  const country = parsed.country as CountryCode
                                  return (
                                    <>
                                      {country && <span>{countryCodeEmoji(country)}</span>}
                                      <span>{parsed.formatInternational()}</span>
                                    </>
                                  )
                                }
                              } catch (_) {}
                              return user.phone_number
                            })()}
                          </Badge>
                        )}
                      </Label>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="custom" id="r-custom" />
                        <Label htmlFor="r-custom" className="cursor-pointer font-normal">
                          Custom number
                        </Label>
                      </div>
                      
                      {field.state.value === "custom" && (
                        <form.Field 
                          name="custom_phone"
                          validators={{
                            onBlur: ({ value, fieldApi }: any) => {
                              const phoneType = fieldApi.form.getFieldValue("phone_type")
                              if (phoneType === "custom") {
                                if (!value) return "Phone number is required"
                                if (!isValidPhoneNumber(value)) return "Invalid phone number"
                              }
                              return undefined
                            }
                          }}
                        >
                          {(customField: any) => (
                            <div className="pl-7 space-y-2">
                              <PhoneInput
                                placeholder="Enter phone number"
                                value={customField.state.value}
                                onChange={customField.handleChange}
                                onBlur={customField.handleBlur}
                              />
                              <form.Subscribe
                                selector={(state: any) => state.isSubmitted}
                              >
                                {(isSubmitted: any) => (
                                  (customField.state.meta.isTouched || isSubmitted) && customField.state.meta.errors.length ? (
                                    <p className="text-sm font-medium text-destructive">
                                      {(customField.state.meta.errors as any[]).join(", ")}
                                    </p>
                                  ) : null
                                )}
                              </form.Subscribe>
                            </div>
                          )}
                        </form.Field>
                      )}
                    </div>
                  </RadioGroup>
                )}
              </form.Field>
            </div>
          </div>

          <DrawerFooter>
            <form.Subscribe
              selector={(state: any) => [state.canSubmit, state.isSubmitting]}
            >
              {([, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending || isSubmitting ? "Creating..." : "Create Reminder"}
                </Button>
              )}
            </form.Subscribe>
            <DrawerClose asChild>
              <Button variant="outline" size="lg" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

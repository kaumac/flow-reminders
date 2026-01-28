import { Bell, Calendar, Phone } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Reminder } from "@/hooks/use-reminders";
import { ContentPlaceholder } from "./content-placeholder";
import calendarImage from "../public/images/calendar-71.png";

interface RemindersTimelineProps {
	reminders: Reminder[];
	onCreateReminder?: () => void;
}

export function RemindersTimeline({
	reminders,
	onCreateReminder,
}: RemindersTimelineProps) {
	if (!reminders || reminders.length === 0) {
		return (
			<ContentPlaceholder
				placeholderImage={calendarImage}
				title="No upcoming reminders"
				description="You have no upcoming reminders. Create one to get started."
				buttonLabel="Create Reminder"
				buttonOnPress={onCreateReminder}
			/>
		);
	}

	return (
		<div className="mx-auto max-w-(--breakpoint-sm) px-6 py-12 md:py-20">
			<div className="relative ml-3">
				{/* Timeline line */}
				<div className="absolute inset-y-0 left-0 border-l-2" />

				{reminders.map((reminder) => (
					<div key={reminder.id} className="relative pb-12 pl-10 last:pb-0">
						{/* Timeline Icon */}
						<div className="absolute left-px flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-background border">
							<Bell className="h-5 w-5 text-muted-foreground" />
						</div>

						{/* Content */}
						<div className="space-y-3">
							<div className="flex items-center gap-2.5">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
									<Calendar className="h-5 w-5 text-muted-foreground" />
								</div>
								<span className="font-medium text-base">
									{reminder.scheduled_time
										? format(new Date(reminder.scheduled_time), "PPP p")
										: "Not scheduled"}
								</span>
							</div>

							<div>
								<h3 className="font-semibold text-xl tracking-[-0.01em]">
									{reminder.title}
								</h3>
								{reminder.scheduled_time && (
									<div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
										<span>
											{format(
												new Date(reminder.scheduled_time),
												"eeee, MMMM do",
											)}
										</span>
									</div>
								)}
							</div>

							{reminder.description && (
								<p className="text-pretty text-muted-foreground text-sm sm:text-base">
									{reminder.description}
								</p>
							)}

							<div className="flex flex-wrap gap-2">
								<Badge
									className="rounded-full flex items-center gap-1"
									variant="secondary"
								>
									<Phone className="h-3 w-3" />
									{reminder.phone_to_call}
								</Badge>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

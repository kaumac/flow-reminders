import { Bell, Calendar, Phone, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Reminder } from "@/hooks/use-reminders";
import { ContentPlaceholder } from "./content-placeholder";
import calendarImage from "../public/images/calendar-71.png";

interface RemindersTimelineProps {
	reminders: Reminder[];
	isLoading?: boolean;
	onCreateReminder?: () => void;
}

export function RemindersTimeline({
	reminders,
	isLoading,
	onCreateReminder,
}: RemindersTimelineProps) {
	if (isLoading) {
		return (
			<div className="px-2 md:px-4 lg:px-6 xl:px-8 py-6 md:py-8 lg:py-12 xl:py-16">
				<div className="relative ml-3">
					{/* Timeline line */}
					<div className="absolute inset-y-0 left-0 border-l-2" />

					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="relative pb-12 pl-10 last:pb-0">
							{/* Timeline Icon */}
							<div className="absolute left-px flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-background border">
								<Skeleton className="h-5 w-5 rounded-full" />
							</div>

							{/* Content */}
							<div className="space-y-4">
								<Skeleton className="h-8 w-1/3 min-w-[200px]" />
								
								<div className="space-y-2">
									<Skeleton className="h-4 w-full max-w-md" />
									<Skeleton className="h-4 w-3/4 max-w-sm" />
								</div>

								<div className="flex flex-wrap gap-2">
									<Skeleton className="h-6 w-32 rounded-full" />
									<Skeleton className="h-6 w-24 rounded-full" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!reminders || reminders.length === 0) {
		return (
			<ContentPlaceholder
				placeholderImage={calendarImage}
				title="No upcoming reminders"
				description="You have no upcoming reminders. Create one to get started."
				buttonLabel="Create Reminder"
				buttonOnPress={onCreateReminder}
				buttonIcon={PlusCircle}
			/>
		);
	}

	return (
		<div className="px-2 md:px-4 lg:px-6 xl:px-8 py-6 md:py-8 lg:py-12 xl:py-16">
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

							<div>
								<h3 className="font-semibold text-xl tracking-[-0.01em]">
									{reminder.title}
								</h3>
							</div>

							{reminder.description && (
								<p className="text-pretty text-muted-foreground text-sm sm:text-base">
									{reminder.description}
								</p>
							)}

							<div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1 w-fit">
                  <Calendar className="h-3.5 w-3.5 -mt-0.5" />
                  {reminder.scheduled_time
										? format(new Date(reminder.scheduled_time), "PPP p")
										: "Not scheduled"}
                </Badge>
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

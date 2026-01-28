import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Reminder } from "@/hooks/use-reminders";
import { ContentPlaceholder } from "./content-placeholder";
import calendarImage from "../public/images/calendar-71.png";
import { ReminderCard } from "./reminder-card";

interface RemindersTimelineProps {
	reminders: Reminder[];
	isLoading?: boolean;
	onCreateReminder?: () => void;
    onEdit?: (reminder: Reminder) => void;
}

export function RemindersTimeline({
	reminders,
	isLoading,
	onCreateReminder,
    onEdit,
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
                    <ReminderCard 
                        key={reminder.id} 
                        reminder={reminder} 
                        onEdit={onEdit || (() => {})} 
                        showTimelineIcon 
                    />
				))}
			</div>
		</div>
	);
}

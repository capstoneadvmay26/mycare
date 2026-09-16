const { DateTime } = require("luxon");

function generateScheduledOccurrences(medication, startDate, endDate, timezone = "UTC") {
    // as_needed medications don't have automatic schedules
    if (medication.frequency === "as_needed") {
        return [];
    }

    // Make sure the date range is valid
    if (startDate > endDate) {
        throw new Error("Start date cannot be after end date.");
    }

    const expectedScheduleTime = {
        once_daily: 1,
        twice_daily: 2,
        three_times_daily: 3,
        weekly: 1
    };

    const expectedCount =
        expectedScheduleTime[medication.frequency];

    if (!expectedCount) {
        throw new Error(
            `Unsupported medication frequency: ${medication.frequency}`
        );
    }

    if (medication.scheduleTime.length !== expectedCount) {
        throw new Error(
            `${medication.frequency} requires exactly ${expectedCount} schedule time(s).`
        );
    }

    const daysToAddByFrequency = {
        once_daily: 1,
        twice_daily: 1,
        three_times_daily: 1,
        weekly: 7
    };

    const daysToAdd =
        daysToAddByFrequency[medication.frequency];

    const occurrences = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        for (const time of medication.scheduleTime) {
            const [hours, minutes] = time.split(":");

            const scheduledDateTime = DateTime.fromObject(
                {
                    year: currentDate.getUTCFullYear(),
                    month: currentDate.getUTCMonth() + 1,
                    day: currentDate.getUTCDate(),
                    hour: Number(hours),
                    minute: Number(minutes),
                    second: 0,
                    millisecond: 0,
                }, {zone: timezone}
            );
            
            const scheduledDate = scheduledDateTime.toJSDate();

            if (scheduledDate >= startDate && scheduledDate <= endDate) {
                occurrences.push(scheduledDate);
            }
        }

        // Keep date iteration in UTC as well.
        currentDate.setUTCDate(
            currentDate.getUTCDate() + daysToAdd
        );
    }

    return occurrences;
}

module.exports = generateScheduledOccurrences;

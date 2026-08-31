function generateScheduledOccurrences(medication, startDate, endDate) {
    // as_needed medications don't have automatic schedules
    if (medication.frequency === "as_needed") {
        return [];
    }

    // Make sure the date range is valid
    if (startDate > endDate) {
        throw new Error("Start date cannot be after end date.");
    }

    // How many schedule times should each frequency have?
    const expectedScheduleTime = {
        once_daily: 1,
        twice_daily: 2,
        three_times_daily: 3,
        weekly: 1
    };

    const expectedCount = expectedScheduleTime[medication.frequency];

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

    // How many days should we move forward after each occurrence date?
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
            const scheduledDate = new Date(currentDate);

            const [hours, minutes] = time.split(":");

            scheduledDate.setHours(hours, minutes, 0, 0);

            occurrences.push(scheduledDate);
        }

        currentDate.setDate(
            currentDate.getDate() + daysToAdd
        );
    }

    return occurrences;
}

module.exports = generateScheduledOccurrences;

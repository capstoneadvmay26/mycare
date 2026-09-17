const { DateTime } = require("luxon");

function generateScheduledOccurrences(
    medication,
    startDate,
    endDate,
    timezone = "UTC"
) {
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
        weekly: 1,
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
        weekly: 7,
    };

    const daysToAdd =
        daysToAddByFrequency[medication.frequency];

    const occurrences = [];

    /*
     * startDate and endDate represent calendar dates.
     *
     * We use their UTC date components to determine the intended
     * calendar dates, then create the scheduled time in the
     * user's timezone.
     */
    let currentDate = DateTime.fromObject(
        {
            year: startDate.getUTCFullYear(),
            month: startDate.getUTCMonth() + 1,
            day: startDate.getUTCDate(),
        },
        {
            zone: timezone,
        }
    );

    const endCalendarDate = DateTime.fromObject(
        {
            year: endDate.getUTCFullYear(),
            month: endDate.getUTCMonth() + 1,
            day: endDate.getUTCDate(),
        },
        {
            zone: timezone,
        }
    );

    while (
        currentDate.startOf("day").toMillis() <=
        endCalendarDate.startOf("day").toMillis()
    ) {
        for (const time of medication.scheduleTime) {
            const [hours, minutes] = time.split(":");

            const scheduledDateTime = currentDate.set({
                hour: Number(hours),
                minute: Number(minutes),
                second: 0,
                millisecond: 0,
            });

            if (!scheduledDateTime.isValid) {
                throw new Error(
                    `Invalid scheduled time: ${time}`
                );
            }

            /*
             * Do not compare the resulting UTC instant against
             * startDate/endDate here.
             *
             * The calendar-date loop already determines whether
             * this occurrence belongs to the requested date range.
             */
            occurrences.push(
                scheduledDateTime.toJSDate()
            );
        }

        currentDate = currentDate.plus({
            days: daysToAdd,
        });
    }

    return occurrences;
}

module.exports = generateScheduledOccurrences;
const generateScheduledOccurrences = require("../src/utils/medicationLogGenerator");

describe("generateScheduledOccurrences", () => {
    const medication = (frequency, scheduleTime) => ({
        frequency,
        scheduleTime,
    });

    describe("UTC+0 scheduling contract", () => {
        it("should interpret scheduleTime as UTC", () => {
            const result = generateScheduledOccurrences(
                medication("once_daily", ["08:00"]),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-20T23:59:59.999Z")
            );

            expect(result).toHaveLength(1);
            expect(result[0].toISOString())
                .toBe("2026-08-20T08:00:00.000Z");
        });

        it("should not apply the server timezone offset", () => {
            const result = generateScheduledOccurrences(
                medication("once_daily", ["08:00"]),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-20T23:59:59.999Z")
            );

            expect(result[0].getUTCHours()).toBe(8);
            expect(result[0].getUTCMinutes()).toBe(0);
        });
    });

    describe("frequency scheduling", () => {
        it("should generate two UTC occurrences for twice daily", () => {
            const result = generateScheduledOccurrences(
                medication("twice_daily", ["08:00", "20:00"]),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-20T23:59:59.999Z")
            );

            expect(result.map(date => date.toISOString()))
                .toEqual([
                    "2026-08-20T08:00:00.000Z",
                    "2026-08-20T20:00:00.000Z",
                ]);
        });

        it("should generate three UTC occurrences for three times daily", () => {
            const result = generateScheduledOccurrences(
                medication(
                    "three_times_daily",
                    ["08:00", "20:00", "22:00"]
                ),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-20T23:59:59.999Z")
            );

            expect(result.map(date => date.toISOString()))
                .toEqual([
                    "2026-08-20T08:00:00.000Z",
                    "2026-08-20T20:00:00.000Z",
                    "2026-08-20T22:00:00.000Z",
                ]);
        });

        it("should generate weekly occurrences every seven days", () => {
            const result = generateScheduledOccurrences(
                medication("weekly", ["09:30"]),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-09-10T23:59:59.999Z")
            );

            expect(result.map(date => date.toISOString()))
                .toEqual([
                    "2026-08-20T09:30:00.000Z",
                    "2026-08-27T09:30:00.000Z",
                    "2026-09-03T09:30:00.000Z",
                    "2026-09-10T09:30:00.000Z",
                ]);
        });
    });

    describe("date boundaries", () => {
        it("should include occurrences on the start and end dates", () => {
            const result = generateScheduledOccurrences(
                medication("once_daily", ["08:00"]),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-22T23:59:59.999Z")
            );

            expect(result.map(date => date.toISOString()))
                .toEqual([
                    "2026-08-20T08:00:00.000Z",
                    "2026-08-21T08:00:00.000Z",
                    "2026-08-22T08:00:00.000Z",
                ]);
        });

        it("should return no occurrences when the scheduled time is outside the range", () => {
            const result = generateScheduledOccurrences(
                medication("once_daily", ["08:00"]),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-20T07:59:59.999Z")
            );

            expect(result).toEqual([]);
        });
    });

    describe("special cases and validation", () => {
        it("should return an empty array for as-needed medication", () => {
            const result = generateScheduledOccurrences(
                medication("as_needed", []),
                new Date("2026-08-20T00:00:00.000Z"),
                new Date("2026-08-20T23:59:59.999Z")
            );

            expect(result).toEqual([]);
        });

        it("should throw when the frequency is unsupported", () => {
            expect(() =>
                generateScheduledOccurrences(
                    medication("monthly", ["08:00"]),
                    new Date("2026-08-20T00:00:00.000Z"),
                    new Date("2026-08-20T23:59:59.999Z")
                )
            ).toThrow(
                "Unsupported medication frequency: monthly"
            );
        });

        it("should throw when the schedule time count is invalid", () => {
            expect(() =>
                generateScheduledOccurrences(
                    medication("twice_daily", ["08:00"]),
                    new Date("2026-08-20T00:00:00.000Z"),
                    new Date("2026-08-20T23:59:59.999Z")
                )
            ).toThrow(
                "twice_daily requires exactly 2 schedule time(s)."
            );
        });

        it("should throw when the start date is after the end date", () => {
            expect(() =>
                generateScheduledOccurrences(
                    medication("once_daily", ["08:00"]),
                    new Date("2026-08-21T00:00:00.000Z"),
                    new Date("2026-08-20T23:59:59.999Z")
                )
            ).toThrow("Start date cannot be after end date.");
        });
    });
});

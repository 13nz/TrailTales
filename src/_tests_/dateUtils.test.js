import {
    createTripDate,
    createPickerTime,
    parseStoredTime,
    formatDatabaseDate,
    formatDatabaseTime,
} from '../utils/dateUtils'

describe('date utilities', () => {
    test('creates a local date from a trip date', () => {
        const date =
            createTripDate(
                '2026-08-17'
            )

        expect(
            date.getFullYear()
        ).toBe(2026)

        expect(
            date.getMonth()
        ).toBe(7)

        expect(
            date.getDate()
        ).toBe(17)
    })

    test('creates a picker time without changing the hour', () => {
        const time =
            createPickerTime({
                hour: 14,
                minute: 30,
            })

        expect(
            time.getHours()
        ).toBe(14)

        expect(
            time.getMinutes()
        ).toBe(30)
    })

    test('parses a stored time', () => {
        expect(
            parseStoredTime(
                '14:30'
            )
        ).toEqual({
            hour: 14,
            minute: 30,
        })
    })

    test('uses a safe default time when none is provided', () => {
        expect(
            parseStoredTime(
                null
            )
        ).toEqual({
            hour: 8,
            minute: 0,
        })
    })

    test('formats a date for storage', () => {
        const date =
            new Date(
                2026,
                7,
                17,
                12,
                0,
                0
            )

        expect(
            formatDatabaseDate(
                date
            )
        ).toBe(
            '2026-08-17'
        )
    })

    test('formats a time for storage', () => {
        expect(
            formatDatabaseTime({
                hour: 14,
                minute: 30,
            })
        ).toBe(
            '14:30'
        )
    })
})
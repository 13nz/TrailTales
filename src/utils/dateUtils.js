export function createTripDate(
    dateString
) {
    if (!dateString) {
        return new Date()
    }

    const [
        year,
        month,
        day,
    ] =
        dateString
            .split('-')
            .map(Number)

    return new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
    )
}

export function createPickerTime(
    time
) {
    return new Date(
        2000,
        0,
        1,
        time.hour,
        time.minute,
        0,
        0
    )
}

export function parseStoredTime(
    timeString
) {
    if (!timeString) {
        return {
            hour: 8,
            minute: 0,
        }
    }

    const [
        hour,
        minute,
    ] =
        timeString
            .slice(0, 5)
            .split(':')
            .map(Number)

    if (
        !Number.isFinite(
            hour
        ) ||
        !Number.isFinite(
            minute
        )
    ) {
        return {
            hour: 8,
            minute: 0,
        }
    }

    return {
        hour,
        minute,
    }
}

export function formatDatabaseDate(
    date
) {
    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        )

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        )

    return `${year}-${month}-${day}`
}

export function formatDatabaseTime(
    time
) {
    return `${String(
        time.hour
    ).padStart(
        2,
        '0'
    )}:${String(
        time.minute
    ).padStart(
        2,
        '0'
    )}`
}

export function formatDisplayDate(
    date
) {
    return date.toLocaleDateString(
        'en-US',
        {
            weekday:
                'short',
            month:
                'short',
            day:
                'numeric',
            year:
                'numeric',
        }
    )
}

export function formatDisplayTime(
    time
) {
    return createPickerTime(
        time
    ).toLocaleTimeString(
        'en-US',
        {
            hour:
                'numeric',
            minute:
                '2-digit',
        }
    )
}
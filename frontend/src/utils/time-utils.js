const longDateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};

export function toLocalDateTimeString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
}

export function addMinutesToLocalDateTime(date, time, minutesToAdd) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    localDate.setMinutes(
        localDate.getMinutes() + Number(minutesToAdd)
    );
    return toLocalDateTimeString(localDate);
}

export function formatDisplayTime(dateTime) {
    return new Date(dateTime).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    });
}

export function formatDisplayDate(dateTime) {
    return new Date(dateTime).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

export function formatDisplayLongDate(dateTime) {
    return new Date(dateTime).toLocaleDateString([], longDateOptions);
}

export function formatDisplayLongDateOnly(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString([], longDateOptions);
}

export function toDateKey(dateTime) {
    const date = new Date(dateTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getDateKeyFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function formatDayHeading(date) {
    return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}

export function formatDurationSeconds(value) {
    const totalSeconds = Number(value);

    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return null;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
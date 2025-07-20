const { parse, format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');

function normalizeDate(input) {
    if (!input) return null;
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
        const date = parse(input, 'd.M.yyyy', new Date());
        return format(date, 'yyyy-MM-dd');
    }
    const date = new Date(input);
    if (isNaN(date)) {
        throw new Error(`Ungültiges Datum: ${input}`);
    }
    return format(date, 'yyyy-MM-dd');
}

function normalizeDateTime(dateInput, timeInput) {
    if (!dateInput && !timeInput) return null;
    if (dateInput && dateInput.includes('T') && !timeInput) {
        const date = new Date(dateInput);
        if (isNaN(date)) throw new Error(`Ungültiges Datum/Zeit: ${dateInput}`);
        return date.toISOString();
    }
    const datePart = normalizeDate(dateInput || new Date());
    const timePart = (timeInput || '00:00').slice(0, 5);
    const dtLocal = new Date(`${datePart}T${timePart}`);
    if (isNaN(dtLocal)) throw new Error(`Ungültiges Datum/Zeit: ${dateInput} ${timeInput}`);
    return dtLocal.toISOString();
}

function generateEvents(task) {
    const events = [];
    let current = new Date(task.dueDate);
    const end = new Date(task.endDate || task.dueDate);
    const time = (task.createdAt || new Date().toISOString()).split('T')[1].slice(0, 5);
    while (current <= end) {
        events.push({
            id: uuidv4(),
            taskId: task.id,
            date: `${current.toISOString().split('T')[0]}T${time}Z`,
            assignedTo: task.assignedTo,
            state: 'created',
            points: task.points || 0
        });
        if (task.repetition === 'weekly') {
            current.setDate(current.getDate() + 7);
        } else if (task.repetition === 'monthly') {
            current.setMonth(current.getMonth() + 1);
        } else if (task.repetition === 'yearly') {
            current.setFullYear(current.getFullYear() + 1);
        } else {
            break;
        }
    }
    return events;
}

function applyTaskData(task, data) {
    const { name, assignedTo, dueDate, points, repetition, endDate } = data;
    if (name !== undefined) task.name = name;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = normalizeDate(dueDate);
    if (points !== undefined) task.points = Number(points) || 0;
    if (repetition !== undefined) task.repetition = repetition;
    if (endDate !== undefined) task.endDate = normalizeDate(endDate);
}

module.exports = { normalizeDate, normalizeDateTime, generateEvents, applyTaskData };

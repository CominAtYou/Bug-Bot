const inProgressReports: string[] = [];

export function add(id: string) {
    inProgressReports.push(id);
}

export function remove(id: string) {
    inProgressReports.splice(inProgressReports.indexOf(id), 1);
}

export function includes(id: string) {
    return inProgressReports.includes(id);
}

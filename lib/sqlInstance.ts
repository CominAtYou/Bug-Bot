import * as mysql from "mysql";
import { promisify } from "util";
import { MYSQL_CREDENTIALS } from "./secrets.json";

const connection = mysql.createConnection(MYSQL_CREDENTIALS);

export function init() {
    console.log("\x1b[33m[CONNECTING]", "\x1b[0mConnecting to database...");
    connection.connect(err => {
        if (err) throw err;
        console.log("\x1b[32m[CONNECTED]", "\x1b[0mConnected to database!");
    });
}

export const query: (query: string, values?: any[]) => Promise<mysql.QueryFunction> = promisify(connection.query).bind(connection);

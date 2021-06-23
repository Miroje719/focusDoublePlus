import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabase("database.db");

componentDidMount() {
    db.transaction(tx => {
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS buildings (\
                id INTEGER PRIMARY KEY NOT NULL, \
                start_time TEXT NOT NULL, \
                end_time TEXT NOT NULL, \
                finished INTEGER NOT NULL, \
                note TEXT); \
            CREATE TABLE IF NOT EXISTS schedule ( \
                sstart_time TEXT NOT NULL, \
                send_time TEXT NOT NULL,\
                PRIMARY KEY(sstart_time, send_time));"
        );
    });
}
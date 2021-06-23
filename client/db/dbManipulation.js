import * as SQLite from "expo-sqlite"

export const openDatabase = () => {
    const db = SQLite.openDatabase("database.db");
    return db;
}

export const clearDB = () => {
    const db = openDatabase();
    db.transaction(tx => {
        tx.executeSql(
            "DELETE FROM buildings;",
        null,null,(txObj, error) => console.log('Error ', error))
    });
}

export const createDB = () => {
    const db = openDatabase();
    db.transaction(tx => {
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS buildings (\
                id INTEGER PRIMARY KEY AUTOINCREMENT, \
                start_time TEXT NOT NULL, \
                end_time TEXT, \
                finished INTEGER NOT NULL, \
                note TEXT); \
            CREATE TABLE IF NOT EXISTS schedule ( \
                sstart_time TEXT NOT NULL, \
                send_time TEXT NOT NULL,\
                PRIMARY KEY(sstart_time, send_time));",
            null,null,
            (txObj, error) => console.log('Error ', error)
        );
    });
}

export const startBuild = (startDate) => {
    if (startDate === "" || startDate === null) {
        return;
    }
    const db = openDatabase();

    db.transaction(tx => {
        tx.executeSql(
            `INSERT INTO buildings(start_time,end_time,finished,note) VALUES(?,null,?,null);`,
            [startDate,0], 
            null,
            (txObj, error) => console.log('Error ', error)
        );
    });
}

export const readDB = () => {
    const db = openDatabase()
    const data = []

    db.transaction(tx => {
        tx.executeSql(
            "SELECT * FROM buildings;",
            null,
            (txObj, { rows }) => {
                rows._array.forEach((listDataItem, index) => {
                    const tmpobject = {}
                    Object.keys(listDataItem).forEach(subKey => {
                        if (subKey === "id") {
                            tmpobject[subKey] = `${listDataItem[subKey]}`
                        }
                        else {
                            tmpobject[subKey] = listDataItem[subKey]
                        }
                            
                    })

                    data.push(tmpobject)
                })
            }
        );
    });

    return data
}

export const endSuccessfulBuilding = (endDate) => {
    if (endDate === null || endDate === "") {
        return;
    }
    const db = openDatabase();

    db.transaction(tx => {
        tx.executeSql(
            `UPDATE buildings\
            SET end_time = ?,\
                finished = ?\
            WHERE finished = ?;`,
            [endDate,1,0],
            null,
            (txObj, error) => console.log('Error ', error)
        );
    });
    
    // for debugging purpose
    // db.transaction(tx => {
    //     tx.executeSql(
    //         "SELECT * FROM buildings;",
    //         null,
    //         (txObj, { rows }) => {
    //             console.log(rows._array);
    //         }
    //     );
    // });
}
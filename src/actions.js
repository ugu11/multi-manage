export const updateTablesData = newData => {
    return {
        type: "UPDATE_TABLES",
        newData,
    }
}

export const updateUserData = newData => {
    return {
        type: "UPDATE",
        newData,
    }
}
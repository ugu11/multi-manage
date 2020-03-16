export const updateUserData = newData => {
    return {
        type: "UPDATE",
        newData,
    }
}
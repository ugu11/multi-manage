export const validatePhoneField = (phone) => {
    const validChars = "+0123456789"

    for(let i = 0; i < phone.length; i++){
        let isValid = false
        for(let h = 0; h < validChars.length; h++)
            if(phone.charAt(i) === validChars.charAt(h))
                isValid = true
        if(isValid === false)
            return false
    }

    return true
}

export const validateNumberField = (number) => !isNaN(number)
export default   function validatePassword(password="", confirmPassword="") {
    const minLength = 8;
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    // const hasSpecialChars = /[-!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password !== confirmPassword) {
        return {
            validPassword: password,
            message: `Passwords do not match.`,
            is_ok: false
        };
    }
    if (password.length < minLength) {
        return {
            validPassword: password,
            message: `Password must be at least ${minLength} characters long.`,
            is_ok: false
        };
    }
    // if (!hasUpperCase) {
    //     return {
    //         validPassword: password,
    //         message: "Password must contain at least one uppercase letter.",
    //         is_ok: false
    //     };
    // }
    // if (!hasLowerCase) {
    //     return {
    //         validPassword: password,
    //         message: "Password must contain at least one lowercase letter.",
    //         is_ok: false
    //     };
    // }
    if (!hasNumbers) {
        return {
            validPassword: password,
            message: "Password must contain at least one number.",
            is_ok: false
        };
    }
    // if (!hasSpecialChars) {
    //     return {
    //         validPassword: password,
    //         message: "Password must contain at least one special character.",
    //         is_ok: false
    //     };
    // }

    return {validPassword: password, message: "Your password is good",  is_ok: true};
}
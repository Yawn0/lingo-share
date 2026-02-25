export const ERROR_MESSAGE = {
    mail_or_pass_missing: "Email or password missing",
    pass_length: "Password must be at least 6 characters long",
    invalid_mail: "Invalid email",
    user_exists: "User already exists",
    mail_or_pass_invalid: "Invalid email or password",
    error_getting_history: "Error getting history"
}

export type QueryFunction = (text: string, params?: any[]) => Promise<any>

export function isEmail(email: string) {
    const emailRegex = /^(?!\.)(?!.*\.\.)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]*[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
    return emailRegex.test(email);
}

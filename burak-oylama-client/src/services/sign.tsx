import Config from "./config.tsx";

const domain = Config.DOMAIN;
const defaultErrorMessage = Config.DEFAULT_ERROR_MESSAGE;

const SignServices = {
    async sign(userName: string, userPassword: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${domain}/api/sign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ userName, userPassword }),
            });

            if (response.ok) {
                // Success (204 No Content)
                return { success: true };
            } else {
                const errorText = await response.text();
                return { success: false, error: errorText || defaultErrorMessage };
            }
        } catch {
            return { success: false, error: defaultErrorMessage };
        }
    },

    async logout(): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${domain}/api/logout`, {
                method: "POST",
                credentials: "include", // very important for auth cookie/session
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorText = await response.text();
                return { success: false, error: errorText || defaultErrorMessage };
            }
        } catch {
            return { success: false, error: defaultErrorMessage };
        }
    }
};

export default SignServices;

import Config from "./config.tsx";

const domain = Config.DOMAIN;
const defaultErrorMessage = Config.DEFAULT_ERROR_MESSAGE;

const VoteServices = {
    async getPublicVote(voteId: string) {
        try {
            const response = await fetch(`${domain}/api/vote/get/${voteId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 404) {
                const errorText = await response.text();
                return { error: errorText || "Vote not found." };
            }

            if (response.status === 403) {
                const errorText = await response.text();
                return { error: errorText || "This vote has expired." };
            }

            if (!response.ok) {
                return { error: defaultErrorMessage };
            }

            const data = await response.json();
            return { data };

        } catch (error) {
            return { error: error instanceof Error ? error.message : defaultErrorMessage };
        }
    },

    async getUserVotes() {
        try {
            const response = await fetch(`${domain}/api/vote/get-user-votes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.status === 401) {
                return { error: "Unauthorized. Please log in." };
            }

            if (response.status === 404) {
                const errorText = await response.text();
                return { error: errorText || "No votes found for the user." };
            }

            if (!response.ok) {
                return { error: defaultErrorMessage };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            return { error: error instanceof Error ? error.message : defaultErrorMessage };
        }
    },


    async voteForOption(voteId: string, optionId: string, userName: string) {
        try {
            const response = await fetch(`${domain}/api/user-vote/vote/${voteId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ OptionId: optionId, UserName: userName }),
            });

            if (response.status === 404) {
                const errorText = await response.text();
                return { success: false, error: errorText || "Vote or option not found." };
            }

            if (response.status === 400) {
                const errorText = await response.text();
                return { success: false, error: errorText || "Bad request." };
            }

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: errorText || defaultErrorMessage };
            }

            // No content (204) means success
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : defaultErrorMessage };
        }
    },

    async createVote(dto: { name: string; voteOptions: string[]; lastValidDate: string }) {
        try {
            const response = await fetch(`${domain}/api/vote/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // important to send cookies/session for auth
                body: JSON.stringify({
                    name: dto.name,
                    voteOptions: dto.voteOptions,
                    lastValidDate: dto.lastValidDate,
                }),
            });

            if (response.status === 401) {
                return { success: false, error: "Unauthorized. Please log in." };
            }

            if (response.status === 400) {
                const errorText = await response.text();
                return { success: false, error: errorText || "Bad request." };
            }

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: errorText || defaultErrorMessage };
            }

            // NoContent 204 means success
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : defaultErrorMessage };
        }
    }
};

export default VoteServices;

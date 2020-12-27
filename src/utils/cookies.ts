export const setCookie = (name: string, value: string, expires: number = 7 * 24 * 60 * 60 * 1000) => {
    const date = new Date();

    date.setTime(date.getTime() + expires);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

export const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    return parts.length === 2 ? parts[1].split(';')[0] : undefined;
};

export const deleteCookie = (name: string) => {
    const date = new Date();

    // Set it expire in -1 days
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=; expires=${date.toUTCString()}; path=/`;
};

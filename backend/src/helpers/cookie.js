
function cookieFactory({ name }) {
    return Object.freeze({
        set,
        get,
        remove,
    });

    function get() {
        for (const cookie of decodeURIComponent(document.cookie).split(';')) {
            const c = cookie.trimStart();
            if (c.indexOf(name + '=') == 0)
                return c.substring(name.length + 1, c.length);
        }
        return '';
    }

    function set(cvalue, exdays = 999) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + cvalue + ";" + expires + ";path=/";
    }

    function remove() {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}

const tokenCookie = cookieFactory({ name: '@token' });

export {
    tokenCookie,
};
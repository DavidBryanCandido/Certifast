function errorChain(error) {
    const chain = [];
    let current = error;

    while (current && !chain.includes(current)) {
        chain.push(current);
        current = current.cause;
    }

    return chain;
}

function isSupabaseConnectivityError(error) {
    return errorChain(error).some((item) => {
        const name = String(item?.name || "");
        const message = String(item?.message || "");
        const code = String(item?.code || "");

        return (
            name === "AuthRetryableFetchError" ||
            name === "TypeError" ||
            /fetch failed|network|certificate|tls/i.test(message) ||
            /UNABLE_TO_VERIFY|CERT_|TLS/i.test(code)
        );
    });
}

module.exports = { isSupabaseConnectivityError };

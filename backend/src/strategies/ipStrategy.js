function ipStrategy(req) {
    return `ip:${req.ip}`;
}

module.exports = ipStrategy;
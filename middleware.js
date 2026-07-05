const fs = require('fs');
const permissions = JSON.parse(fs.readFileSync('./permissions.json', 'utf8'));

const rbacMiddleware = (resource, action) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Assume set by auth middleware
        if (!userRole) return res.status(401).json({ error: "Unauthorized" });

        const rolePerms = permissions[userRole];
        if (rolePerms && rolePerms[resource] && rolePerms[resource].includes(action)) {
            return next();
        }
        return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    };
};

module.exports = rbacMiddleware;

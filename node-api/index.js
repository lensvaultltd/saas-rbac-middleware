const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const RBAC_ENGINE_URL = "http://rbac-engine:8000/api/v1/evaluate";

// Custom RBAC Middleware
const requirePermission = (requiredAction) => {
    return async (req, res, next) => {
        const user = req.headers['x-user-id']; // Simplified mock auth
        if (!user) {
            return res.status(401).json({ error: "Missing x-user-id header" });
        }

        try {
            const rbacResponse = await axios.post(RBAC_ENGINE_URL, {
                user: user,
                action: requiredAction
            });

            if (rbacResponse.data.allowed) {
                req.rbacReason = rbacResponse.data.reason;
                next(); // Proceed to controller
            } else {
                res.status(403).json({ error: "Forbidden", reason: rbacResponse.data.reason });
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                 res.status(403).json({ error: "Forbidden", reason: error.response.data.detail });
            } else {
                 console.error(error);
                 res.status(500).json({ error: "RBAC Engine Unreachable" });
            }
        }
    };
};

// Protected Routes
app.get('/api/docs', requirePermission('read:docs'), (req, res) => {
    res.json({ message: "Successfully fetched documents", rbac_reason: req.rbacReason });
});

app.post('/api/docs', requirePermission('write:docs'), (req, res) => {
    res.json({ message: "Successfully created document", rbac_reason: req.rbacReason });
});

app.delete('/api/docs', requirePermission('delete:docs'), (req, res) => {
    res.json({ message: "Successfully deleted document", rbac_reason: req.rbacReason });
});

app.listen(8080, () => {
    console.log("Protected SaaS API running on port 8080");
});

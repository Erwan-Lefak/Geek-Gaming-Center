"use strict";
/**
 * Main Entry Point - Geek Gaming Center Backend
 * Express server with PostgreSQL & Redis
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const availability_routes_1 = __importDefault(require("./routes/availability.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 9000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use('/api/booking', booking_routes_1.default);
app.use('/api/availability', availability_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
const server = (0, http_1.createServer)(app);
server.listen(PORT, () => {
    console.log(`🚀 Geek Gaming Center Backend running on port ${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=index.js.map
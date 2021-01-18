"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = express_1.default();
const port = 3000;
const baseUrl = "http://0.0.0.0:8080";
app.get("/reservations", (req, res, next) => {
    const { date, resourceId } = req.query;
    const currentDate = new Date(date);
    try {
        if (!currentDate || !resourceId) {
            throw new Error("date is incorrect or missing or resourceId param is missing");
        }
        res.locals = {
            date: currentDate,
            resourceId,
        };
    }
    catch (e) {
        // tslint:disable-next-line:no-console
        console.log(e);
    }
    next();
}, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, resourceId } = res.locals;
    const rawSlots = yield axios_1.default.get(`${baseUrl}/timetables?date=${date
        .toISOString()
        .slice(0, 10)}&resourceId=${resourceId}`);
    const openingSlots = rawSlots.data;
    const { open, timetables } = openingSlots;
    if (!open) {
        return res.json({
            available: false,
        });
    }
    const isInOpenSlot = timetables.some((time) => date >= new Date(time.opening + "Z") &&
        date <= new Date(time.closing + "Z"));
    if (!isInOpenSlot) {
        return res.json({
            available: false,
        });
    }
    const rawReservations = yield axios_1.default.get(`${baseUrl}/reservations?date=${date
        .toISOString()
        .slice(0, 10)}&resourceId=${resourceId}`);
    const { reservations } = rawReservations.data;
    const isInReservation = reservations.some((resa) => date >= new Date(resa.reservationStart + "Z") &&
        date <= new Date(resa.reservationEnd + "Z"));
    return res.json({
        available: isInReservation ? false : true,
    });
}));
// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map
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
    try {
        if (!date || !resourceId) {
            throw new Error("date param or resourceId param is missing");
        }
        res.locals = {
            date,
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
    const rawSlots = yield axios_1.default.get(`${baseUrl}/timetables?date=${date}&resourceId=${resourceId}`);
    const openingSlots = rawSlots.data;
    const { open, timetables } = openingSlots;
    let totalOpened = 0;
    for (const time of timetables) {
        totalOpened +=
            new Date(time.closing).getHours() - new Date(time.opening).getHours();
    }
    if (!open) {
        return res.json({
            available: false,
        });
    }
    const rawReservations = yield axios_1.default.get(`${baseUrl}/reservations?date=${date}&resourceId=${resourceId}`);
    const reservations = rawReservations.data;
    let totalReserved = 0;
    for (const reservation of reservations.reservations) {
        totalReserved +=
            new Date(reservation.reservationEnd).getHours() -
                new Date(reservation.reservationStart).getHours();
    }
    return res.json({
        available: totalReserved < totalOpened,
    });
}));
// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map
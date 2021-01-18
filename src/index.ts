import express from "express";
import axios from "axios";

const app = express();
const port: number = 3000;
const baseUrl: string = "http://0.0.0.0:8080";

app.get(
  "/reservations",
  (req, res, next) => {
    const { date, resourceId } = req.query;
    try {
      if (!date || !resourceId) {
        throw new Error("date param or resourceId param is missing");
      }
      res.locals = {
        date,
        resourceId,
      };
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.log(e);
    }
    next();
  },
  async (req, res) => {
    const { date, resourceId } = res.locals;
    const rawSlots = await axios.get(
      `${baseUrl}/timetables?date=${date}&resourceId=${resourceId}`
    );
    const openingSlots = rawSlots.data;
    const { open, timetables } = openingSlots;

    if (!open) {
      return res.json({
        available: false,
      });
    }

    let totalOpened = 0;
    for (const time of timetables) {
      totalOpened +=
        new Date(time.closing).getHours() - new Date(time.opening).getHours();
    }

    const rawReservations = await axios.get(
      `${baseUrl}/reservations?date=${date}&resourceId=${resourceId}`
    );
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
  }
);

// start the Express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});

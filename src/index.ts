import express from "express";
import axios from "axios";

const app = express();
const port: number = 3000;
const baseUrl: string = "http://0.0.0.0:8080";

app.get(
  "/reservations",
  (req, res, next) => {
    const { date, resourceId } = req.query;
    const currentDate = new Date(date as string);
    try {
      if (!currentDate || !resourceId) {
        throw new Error(
          "date is incorrect or missing or resourceId param is missing"
        );
      }
      res.locals = {
        date: currentDate,
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
      `${baseUrl}/timetables?date=${date
        .toISOString()
        .slice(0, 10)}&resourceId=${resourceId}`
    );
    const openingSlots = rawSlots.data;
    const { open, timetables } = openingSlots;

    if (!open) {
      return res.json({
        available: false,
      });
    }

    const isInOpenSlot: boolean = (timetables as any[]).some(
      (time) =>
        date >= new Date(time.opening + "Z") &&
        date <= new Date(time.closing + "Z")
    );

    if (!isInOpenSlot) {
      return res.json({
        available: false,
      });
    }

    const rawReservations = await axios.get(
      `${baseUrl}/reservations?date=${date
        .toISOString()
        .slice(0, 10)}&resourceId=${resourceId}`
    );
    const { reservations } = rawReservations.data;
    const isInReservation = (reservations as any[]).some(
      (resa) =>
        date >= new Date(resa.reservationStart + "Z") &&
        date <= new Date(resa.reservationEnd + "Z")
    );
    return res.json({
      available: isInReservation ? false : true,
    });
  }
);

// start the Express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});

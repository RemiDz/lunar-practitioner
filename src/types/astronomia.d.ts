/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'astronomia/moonposition' {
  interface Coord {
    lon: number;
    lat: number;
    range: number;
  }

  const moonposition: {
    position(jde: number): Coord;
    parallax(distance: number): number;
    node(jde: number): number;
    perigee(jde: number): Coord;
    trueNode(jde: number): number;
  };

  export default moonposition;
}

declare module 'astronomia/julian' {
  class Calendar {
    year: number;
    month: number;
    day: number;
    constructor(year?: number | Date, month?: number, day?: number);
    fromDate(date: Date): this;
    toDate(): Date;
    toJD(): number;
    toJDE(): number;
    fromJD(jd: number): this;
    fromJDE(jde: number): this;
  }

  class CalendarGregorian extends Calendar {}
  class CalendarJulian extends Calendar {}

  function DateToJD(date: Date): number;
  function JDToDate(jd: number): Date;
  function DateToJDE(date: Date): number;
  function JDEToDate(jde: number): Date;
  function CalendarGregorianToJD(y: number, m: number, d: number): number;

  const julian: {
    Calendar: typeof Calendar;
    CalendarGregorian: typeof CalendarGregorian;
    CalendarJulian: typeof CalendarJulian;
    DateToJD: typeof DateToJD;
    JDToDate: typeof JDToDate;
    DateToJDE: typeof DateToJDE;
    JDEToDate: typeof JDEToDate;
    CalendarGregorianToJD: typeof CalendarGregorianToJD;
  };

  export default julian;
}

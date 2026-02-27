import { NextResponse } from "next/server";
import { WeatherDay } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LAT = 37.8087;
const LON = -122.4098;
const NOAA_STATION = "9414290";

function toDateIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toNoaaDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function fToShort(v: number | null) {
  return v === null ? null : Math.round(v);
}

async function fetchForecast() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}&longitude=${LON}` +
    `&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max,wind_direction_10m_dominant` +
    `&temperature_unit=fahrenheit&wind_speed_unit=kn` +
    `&timezone=America%2FLos_Angeles&forecast_days=7`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Forecast fetch failed.");
  return res.json();
}

async function fetchTides() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 6);
  const url =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
    `?product=predictions&application=wildcard&datum=MLLW&station=${NOAA_STATION}` +
    `&time_zone=lst_ldt&units=english&interval=hilo&format=json` +
    `&begin_date=${toNoaaDate(start)}&end_date=${toNoaaDate(end)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Tide fetch failed.");
  return res.json();
}

export async function GET() {
  try {
    const [forecast, tides] = await Promise.all([fetchForecast(), fetchTides()]);
    const out: WeatherDay[] = [];
    const tideByDate = new Map<string, { high?: string; low?: string }>();

    const tideRows = Array.isArray(tides?.predictions) ? tides.predictions : [];
    for (const t of tideRows) {
      const iso = typeof t?.t === "string" ? t.t.slice(0, 10) : null;
      const type = t?.type;
      const time = typeof t?.t === "string" ? t.t.slice(11, 16) : null;
      if (!iso || !time) continue;
      const existing = tideByDate.get(iso) ?? {};
      if (type === "H" && !existing.high) existing.high = time;
      if (type === "L" && !existing.low) existing.low = time;
      tideByDate.set(iso, existing);
    }

    const daily = forecast?.daily ?? {};
    const dates: string[] = daily.time ?? [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const tide = tideByDate.get(date) ?? {};
      out.push({
        date,
        sunrise: typeof daily.sunrise?.[i] === "string" ? daily.sunrise[i].slice(11, 16) : null,
        sunset: typeof daily.sunset?.[i] === "string" ? daily.sunset[i].slice(11, 16) : null,
        tempHighF: fToShort(daily.temperature_2m_max?.[i] ?? null),
        tempLowF: fToShort(daily.temperature_2m_min?.[i] ?? null),
        windMaxKts: fToShort(daily.wind_speed_10m_max?.[i] ?? null),
        windDirDeg: fToShort(daily.wind_direction_10m_dominant?.[i] ?? null),
        highTide: tide.high ?? null,
        lowTide: tide.low ?? null
      });
    }

    return NextResponse.json({
      location: { name: "Pier 39 area, San Francisco", lat: LAT, lon: LON, tideStation: NOAA_STATION },
      days: out,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "WEATHER_FETCH_FAILED",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

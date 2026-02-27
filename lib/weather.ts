export interface WeatherDay {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  tempHighF: number | null;
  tempLowF: number | null;
  windMaxKts: number | null;
  windDirDeg: number | null;
  highTide: string | null;
  lowTide: string | null;
}

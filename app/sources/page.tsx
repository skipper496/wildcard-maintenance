export default function SourcesPage() {
  return (
    <main className="shell">
      <div className="panel">
        <h1>Sources and Method</h1>
        <p>
          The dashboard weather snapshot is assembled from sources nearest practical to Pier 39
          (37.8087, -122.4098).
        </p>
        <h2>Forecast Inputs</h2>
        <ul>
          <li>
            Open-Meteo daily forecast API for temperature highs/lows, sunrise/sunset, and wind
            forecast.
          </li>
          <li>
            NOAA CO-OPS station 9414290 (San Francisco) for daily high/low tide prediction times.
          </li>
        </ul>
        <h2>Links</h2>
        <p>
          Open-Meteo:{" "}
          <a href="https://api.open-meteo.com/v1/forecast" target="_blank" rel="noreferrer">
            https://api.open-meteo.com/v1/forecast
          </a>
        </p>
        <p>
          NOAA CO-OPS Data API:{" "}
          <a
            href="https://api.tidesandcurrents.noaa.gov/api/prod/"
            target="_blank"
            rel="noreferrer"
          >
            https://api.tidesandcurrents.noaa.gov/api/prod/
          </a>
        </p>
        <h2>Manual and Spec References</h2>
        <p>
          YGM20F owner manual PDF source and Yanmar support links are preloaded in the Manuals tab.
        </p>
        <p>
          J/105 specs are seeded from{" "}
          <a href="https://jboats.com/j105-tech-specs" target="_blank" rel="noreferrer">
            https://jboats.com/j105-tech-specs
          </a>{" "}
          and the J/105 information PDF at{" "}
          <a
            href="https://j105.org/wp-content/uploads/2016/01/j105info.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://j105.org/wp-content/uploads/2016/01/j105info.pdf
          </a>
          .
        </p>
      </div>
    </main>
  );
}

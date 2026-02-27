import { AppState } from "./types";

export const defaultState: AppState = {
  maintenanceLogs: [
    {
      id: "log-oil-coolant-2222",
      date: "2026-02-27",
      engineHours: 2222,
      system: "Engine",
      task: "Changed oil and coolant",
      notes: "Recorded by owner."
    },
    {
      id: "log-fuel-filter-2026-02-26",
      date: "2026-02-26",
      engineHours: null,
      system: "Fuel System",
      task: "Sealed fuel tank and changed filters",
      notes: "Completed yesterday."
    }
  ],
  serviceIntervals: [
    {
      id: "svc-engine-oil",
      system: "Engine",
      task: "Engine oil and filter",
      dueEveryDays: 180,
      dueEveryHours: 100,
      lastDoneDate: "2026-02-27",
      lastDoneHours: 2222
    },
    {
      id: "svc-coolant",
      system: "Engine",
      task: "Coolant replacement",
      dueEveryDays: 730,
      dueEveryHours: null,
      lastDoneDate: "2026-02-27",
      lastDoneHours: 2222
    },
    {
      id: "svc-fuel-filters",
      system: "Fuel System",
      task: "Primary/secondary fuel filters",
      dueEveryDays: 365,
      dueEveryHours: 250,
      lastDoneDate: "2026-02-26",
      lastDoneHours: null
    },
    {
      id: "svc-raw-water-impeller",
      system: "Cooling",
      task: "Raw water pump impeller",
      dueEveryDays: 365,
      dueEveryHours: null,
      lastDoneDate: null,
      lastDoneHours: null
    }
  ],
  todos: [
    {
      id: "todo-engine-belt",
      category: "Engine",
      title: "Inspect alternator belt tension",
      notes: "",
      dueDate: null,
      done: false
    },
    {
      id: "todo-sailing-rig-check",
      category: "Sailing",
      title: "Check standing rig tension before first regatta",
      notes: "",
      dueDate: null,
      done: false
    },
    {
      id: "todo-electronics-nmea",
      category: "Electronics",
      title: "Verify NMEA network drop cable at mast base",
      notes: "",
      dueDate: null,
      done: false
    },
    {
      id: "todo-hull-seacock",
      category: "Hull and Fittings",
      title: "Exercise and lubricate all seacocks",
      notes: "",
      dueDate: null,
      done: false
    }
  ],
  manuals: [
    {
      id: "man-operation",
      title: "Yanmar Operation Manual",
      type: "Owner's manual",
      viewerUrl: "/manuals/yanmar-operation-manual.pdf",
      sourceUrl: "https://j109.org/docs/Yanmar_3GM30F3.pdf",
      tags: ["yanmar", "operation", "manual"],
      source: "Hosted local copy"
    },
    {
      id: "man-service",
      title: "Yanmar Workshop Service Manual",
      type: "Service manual",
      viewerUrl: "/manuals/yanmar-workshop-manual.pdf",
      sourceUrl:
        "https://nhmr.nl/wp-content/uploads/2022/03/YANMAR-WORKSHOP-MANUAL-1GM10-2GM30-3GM30-3HM35.pdf",
      tags: ["yanmar", "service", "workshop"],
      source: "Hosted local copy"
    },
    {
      id: "man-parts",
      title: "Yanmar Parts Catalog (2GM20)",
      type: "Parts catalog",
      viewerUrl: "/manuals/yanmar-parts-catalog.pdf",
      sourceUrl: "https://j30.us/files/Yanmar-2GM20-Parts-List.pdf",
      tags: ["yanmar", "parts", "catalog"],
      source: "Hosted local copy"
    }
  ],
  specs: [
    {
      id: "spec-loa",
      section: "Dimensions",
      key: "LOA",
      value: "34.48 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-lwl",
      section: "Dimensions",
      key: "LWL",
      value: "29.75 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-beam",
      section: "Dimensions",
      key: "Beam",
      value: "11.00 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-draft",
      section: "Dimensions",
      key: "Draft",
      value: "6.5 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-disp",
      section: "Weight",
      key: "Displacement",
      value: "7,760 lb",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-ballast",
      section: "Weight",
      key: "Ballast",
      value: "3,440 lb",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-i",
      section: "Rigging",
      key: "I",
      value: "40.60 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-j",
      section: "Rigging",
      key: "J",
      value: "13.10 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-p",
      section: "Rigging",
      key: "P",
      value: "39.00 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-e",
      section: "Rigging",
      key: "E",
      value: "13.00 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-main",
      section: "Sail Plan",
      key: "Mainsail area",
      value: "262 sq ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-jib",
      section: "Sail Plan",
      key: "100% Foretriangle",
      value: "266 sq ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-isp",
      section: "Rigging",
      key: "ISP",
      value: "44.38 ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-spi",
      section: "Sail Plan",
      key: "Spinnaker area",
      value: "955 sq ft",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-phrf",
      section: "Performance",
      key: "PHRF",
      value: "90",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-sa-disp",
      section: "Performance",
      key: "SA/Disp",
      value: "21.20",
      source: "J/Boats Tech Specs"
    },
    {
      id: "spec-disp-l",
      section: "Performance",
      key: "Disp/L",
      value: "131",
      source: "J/Boats Tech Specs"
    }
  ],
  regattas: [],
  boatWeights: []
};

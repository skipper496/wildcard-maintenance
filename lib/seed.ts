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
      id: "man-yanmar-marine-support",
      title: "Yanmar Marine Support",
      type: "Official support",
      url: "https://www.yanmar.com/marine/support/",
      tags: ["yanmar", "support", "parts", "dealer"],
      source: "Yanmar Marine"
    },
    {
      id: "man-yanmar-operation-manuals",
      title: "Yanmar Marine Operation Manuals",
      type: "Official manuals portal",
      url: "https://www.yanmar.com/marine/support/operation_manuals/",
      tags: ["yanmar", "operation manual", "engine"],
      source: "Yanmar Marine"
    },
    {
      id: "man-yanmar-dealer-locator",
      title: "Yanmar Dealer Locator",
      type: "Official dealer network",
      url: "https://www.yanmar.com/marine/support/dealer_locator/",
      tags: ["yanmar", "dealer", "service manual request"],
      source: "Yanmar Marine"
    },
    {
      id: "man-j105-class-rules",
      title: "J/105 Class Rules and Documents",
      type: "Class documentation",
      url: "https://j105.org",
      tags: ["j105", "class", "rules", "rigging"],
      source: "J/105 Class Association"
    }
  ],
  specs: [
    {
      id: "spec-loa",
      section: "Dimensions",
      key: "LOA",
      value: "34.50 ft (10.52 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-lwl",
      section: "Dimensions",
      key: "LWL",
      value: "29.50 ft (8.99 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-beam",
      section: "Dimensions",
      key: "Beam",
      value: "11.00 ft (3.35 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-draft",
      section: "Dimensions",
      key: "Draft",
      value: "6.50 ft (1.98 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-disp",
      section: "Weight",
      key: "Displacement",
      value: "7,750 lb (3,515 kg)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-ballast",
      section: "Weight",
      key: "Ballast",
      value: "3,400 lb (1,542 kg)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-i",
      section: "Rigging",
      key: "I",
      value: "44.50 ft (13.56 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-j",
      section: "Rigging",
      key: "J",
      value: "13.20 ft (4.02 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-p",
      section: "Rigging",
      key: "P",
      value: "39.50 ft (12.04 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-e",
      section: "Rigging",
      key: "E",
      value: "13.50 ft (4.11 m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-main",
      section: "Sail Plan",
      key: "Mainsail area",
      value: "282 sq ft (26.2 sq m)",
      source: "J/Boats J/105"
    },
    {
      id: "spec-jib",
      section: "Sail Plan",
      key: "100% Foretriangle",
      value: "293 sq ft (27.2 sq m)",
      source: "J/Boats J/105"
    }
  ],
  regattas: []
};

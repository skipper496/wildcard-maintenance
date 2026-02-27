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
      id: "man-ygm20f-owner",
      title: "Yanmar YGM20F Owner's Manual (GM Series)",
      type: "Owner's manual",
      viewerUrl:
        "https://www.yanmar.no/wp-content/uploads/2019/10/0AGMS-G00100_1GM10_2GM20_3GM30_Operation_Manual.pdf",
      sourceUrl:
        "https://www.yanmar.no/wp-content/uploads/2019/10/0AGMS-G00100_1GM10_2GM20_3GM30_Operation_Manual.pdf",
      tags: ["yanmar", "ygm20f", "owner", "operation"],
      source: "Yanmar official document mirror"
    },
    {
      id: "man-ygm20f-service",
      title: "Yanmar GM Service Manual (includes 2GM20 family)",
      type: "Service manual",
      viewerUrl: "https://www.yumpu.com/da/embed/view/sPPNEAH7ak1Gke7p",
      sourceUrl: "https://www.yumpu.com/en/document/view/32590325/yanmar-gm-series-service-manual",
      tags: ["yanmar", "ygm20f", "service", "workshop"],
      source: "Yumpu document archive"
    },
    {
      id: "man-yanmar-marine-support",
      title: "Yanmar Marine Support",
      type: "Official support",
      viewerUrl: "https://www.yanmar.com/marine/support/",
      sourceUrl: "https://www.yanmar.com/marine/support/",
      tags: ["yanmar", "support", "parts", "dealer"],
      source: "Yanmar Marine"
    },
    {
      id: "man-yanmar-operation-manuals",
      title: "Yanmar Marine Operation Manuals",
      type: "Official manuals portal",
      viewerUrl: "https://www.yanmar.com/marine/support/operation_manuals/",
      sourceUrl: "https://www.yanmar.com/marine/support/operation_manuals/",
      tags: ["yanmar", "operation manual", "engine"],
      source: "Yanmar Marine"
    },
    {
      id: "man-yanmar-dealer-locator",
      title: "Yanmar Dealer Locator",
      type: "Official dealer network",
      viewerUrl: "https://www.yanmar.com/marine/support/dealer_locator/",
      sourceUrl: "https://www.yanmar.com/marine/support/dealer_locator/",
      tags: ["yanmar", "dealer", "service manual request"],
      source: "Yanmar Marine"
    },
    {
      id: "man-j105-class-rules",
      title: "J/105 Class Rules and Documents",
      type: "Class documentation",
      viewerUrl: "https://j105.org",
      sourceUrl: "https://j105.org",
      tags: ["j105", "class", "rules", "rigging"],
      source: "J/105 Class Association"
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

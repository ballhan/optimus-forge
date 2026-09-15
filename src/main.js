import { createViewer } from "./viewer.js";
import { createOptimus } from "./models/optimus.js";

createViewer({
  build: createOptimus,
  framing: {
    robotTarget: 2.9,
    vehicleDrop: 1.35,
    desktop: [5.5, 5.2, 13.3],
    mobile: [5.1, 4.8, 11.8],
    inspectRobot: { target: [0, 4.65, 0], position: [2.7, 5.35, 6.1] },
    inspectVehicle: { target: [0, 1.25, 1], position: [4, 3, 7.2] },
  },
  copy: {
    ready: "Ready to roll out.",
    complete: "More than meets the eye.",
    stages: [
      "Releasing armor locks.",
      "Folding the assemblies.",
      "Compressing the chassis.",
      "Locking vehicle form.",
    ],
  },
});

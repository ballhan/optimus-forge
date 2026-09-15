import { createViewer } from "./viewer.js";
import { createBumblebee } from "./models/bumblebee.js";

createViewer({
  build: createBumblebee,
  framing: {
    robotTarget: 2.45,
    vehicleDrop: 1.15,
    desktop: [4.9, 4.5, 11.6],
    mobile: [4.5, 4.1, 10.4],
    inspectRobot: { target: [0, 4.15, 0], position: [2.3, 4.7, 5.3] },
    inspectVehicle: { target: [0, 1, 0.7], position: [3.6, 2.6, 6.3] },
  },
  copy: {
    ready: "Standing by.",
    complete: "Second to none.",
    stages: [
      "Releasing panel locks.",
      "Folding the limbs inward.",
      "Compressing the chassis.",
      "Locking vehicle form.",
    ],
  },
});

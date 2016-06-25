# three-vive-controller

Use the Vive's controller in ThreeJS webVR applications.
# Installation

`npm install --save three-vive-controller`

# Usage

Set up a ThreeJS scene using the THREE.VRControls addon, then create controllers using the ids 0 and 1.

```
var ViveController = require('three-vive-controller')(THREE, "/")
var controls = new THREE.VRControls(camera)
var controller = new ViveController(0, controls)
scene.add(controller)

// Listen to events on the controller.Events emitter
controller.Events.on(controller.Events.TriggerClicked, () => {
  console.log("Trigger Clicked")
})
controller.Events.on(controller.Events.TriggerUnclicked, () => {
  console.log("Trigger Unclicked")
})
```

# Available events
```
TriggerClicked -> ()
TriggerUnclicked -> ()
PadTouched -> ()
PadUntouched -> ()
PadDragged -> (dx, dy) // Normalized touch deltas
```

# Available properties
```
// Current touch positions, normalized from -1 to 1.  Is null if the pad is not currently being touched.
controller.padX
controller.padY
// Boolean if the pad is currently being touched
controller.padTouched
```

See demo for a full example, which can be run with `npm start`

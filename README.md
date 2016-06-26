# three-vive-controller

Use the Vive's controller in ThreeJS webVR applications.  It will render a nice model for it, and give it an event based API.

Try the [demo](https://msfeldstein.github.io/three-vive-controller/demo/) in a webVR enabled browser

### Installation

`npm install --save three-vive-controller`

### Usage

Set up a ThreeJS scene using the THREE.VRControls addon, then create controllers using the ids 0 and 1.

```
var ViveController = require('three-vive-controller')(THREE)
var controls = new THREE.VRControls(camera)
var controller = new ViveController(0, controls)
scene.add(controller)

// Listen to events on the controller emitter
controller.on(controller.TriggerClicked, () => {
  console.log("Trigger Clicked")
})

controller.on(controller.TriggerUnclicked, () => {
  console.log("Trigger Unclicked")
})
```

### Available events
```
TriggerClicked -> ()
TriggerUnclicked -> ()
MenuPressed -> ()
MenuUnpressed -> ()
PadTouched -> ()
PadUntouched -> ()
PadPressed -> ()
PadUnpressed -> ()
PadDragged -> (dx, dy) // Normalized touch deltas
Connected -> () // Called when the controller first becomes available
```

### Available properties
```
// Current touch positions, normalized from -1 to 1.  Is null if the pad is not currently being touched.
controller.padX
controller.padY
// Boolean if the pad is currently being touched
controller.padTouched
// Boolean if the trigger is currently pressed
controller.triggerClicked
// Is there a vive controller available for this controller. Disconnection doesn't seem to work yet, so if it turns off, it still shows as connected.
controller.connected
// How far the trigger is pulled from 0-1
controller.triggerLevel
```

See demo for a full example, which can be run with `npm start`

var EventEmitter = require('eventemitter3');
var extend = require('./util/extend')
module.exports = function(THREE, packageRoot) {
    packageRoot = packageRoot || "/node_modules/three-vive-controller/"

    var OBJLoader = require('three-obj-loader')
    OBJLoader(THREE)

    THREE.ViveController = function(controllerId, vrControls) {

        THREE.Object3D.call(this);
        extend(this, new EventEmitter)

        this.PadTouched = "PadTouched"
        this.PadUntouched = "PadUntouched"
        this.PadPressed = "PadPressed"
        this.PadUnpressed = "PadUnpressed"
        this.TriggerClicked = "TriggerClicked"
        this.TriggerUnclicked = "TriggerUnclicked"
        this.MenuClicked = "MenuClicked"
        this.MenuUnclicked = "MenuUnclicked"
        this.Gripped = "Gripped"
        this.Ungripped = "Ungripped"
        this.PadDragged = "PadDragged"
        this.MenuPressed = "MenuPressed"
        this.MenuUnpressed = "MenuUnpressed"
        this.Connected = "Connected"
        this.Disconnected = "Disconnected"

        this.matrixAutoUpdate = false;
        this.standingMatrix = vrControls.getStandingMatrix()

        this.padTouched = false
        this.connected = false
        this.tracked = false
        this.lastPosePosition = [0, 0, 0]
        this.lastPoseOrientation = [0, 0, 0, 1]

        var c = this;

        var lastPadPosition = {
            x: 0,
            y: 0
        }

        var vivePath = packageRoot + 'assets/vr_controller_vive_1_5.obj'
        var loader = new THREE.OBJLoader()
        loader.load(vivePath, function(object) {
            var loader = new THREE.TextureLoader()
            model = object.children[0]
            model.material.map = loader.load(packageRoot + 'assets/onepointfive_texture.png')
            model.material.specularMap = loader.load(packageRoot + 'assets/onepointfive_spec.png')
            this.add(object)
        }.bind(this))

        var bindButton = function (eventOnKey, eventOffKey, button, type) {
          var propertyName = eventOnKey[0].toLowerCase() + eventOnKey.substring(1)
          var wasActive = this[propertyName]
          this[propertyName] = button[type]
          if (!wasActive && button[type]) {
            this.emit(eventOnKey)
          } else if (wasActive && !button[type]) {
            this.emit(eventOffKey)
          }
        }.bind(this)

        function update() {
            requestAnimationFrame(update);

            var gamepad = navigator.getGamepads()[controllerId];
            if (gamepad !== undefined && gamepad.pose !== null) {
                c.visible = true;

                var padButton = gamepad.buttons[0]
                var triggerButton = gamepad.buttons[1]
                var gripButton = gamepad.buttons[2]
                var menuButton = gamepad.buttons[3]

                if (!c.connected) c.emit(c.Connected)

                var pose = gamepad.pose;

                if(pose.position != null && pose.orientation != null) {
                    c.tracked = true
                    c.lastPosePosition = pose.position
                    c.lastPoseOrientation = pose.orientation
                }
                else {
                    c.tracked = false
                }

                c.position.fromArray(lastPosePosition)
                c.quaternion.fromArray(lastPoseOrientation)
                c.matrix.compose(c.position, c.quaternion, c.scale)
                c.matrix.multiplyMatrices(c.standingMatrix, c.matrix)
                c.matrixWorldNeedsUpdate = true


                bindButton(c.PadTouched, c.PadUntouched, padButton, "touched")
                bindButton(c.PadPressed, c.PadUnpressed, padButton, "pressed")
                bindButton(c.MenuPressed, c.MenuUnpressed, menuButton, "pressed")
                bindButton(c.Gripped, c.Ungripped, gripButton, "pressed")

                var wasTriggerClicked = c.triggerClicked
                c.triggerClicked = triggerButton.value == 1
                if (!wasTriggerClicked && c.triggerClicked) {
                    c.emit(c.TriggerClicked)
                }
                if (wasTriggerClicked && !c.triggerClicked) {
                    c.emit(c.TriggerUnclicked)
                }
                c.triggerLevel = triggerButton.value

                c.padX = gamepad.axes[0]
                c.padY = gamepad.axes[1]

                if (c.padTouched && c.listeners(c.PadDragged) && lastPadPosition.x != null) {
                    var dx = c.padX - lastPadPosition.x
                    var dy = c.padY - lastPadPosition.y
                    c.emit(c.PadDragged, dx, dy)
                }

                if (c.padTouched) {
                    lastPadPosition.x = c.padX
                    lastPadPosition.y = c.padY
                } else {
                    lastPadPosition.x = null
                    lastPadPosition.y = null
                }


            } else {
                c.visible = false;
            }
            c.connected = !!gamepad

        }

        update();

    };

    THREE.ViveController.prototype = Object.create(THREE.Object3D.prototype);
    THREE.ViveController.prototype.constructor = THREE.ViveController;
    return THREE.ViveController;
}

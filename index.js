var EventEmitter = require('eventemitter3');
var extend = require('./util/extend')
module.exports = function(THREE, packageRoot) {
    packageRoot = packageRoot || "/node_modules/three-vive-controller/"

    var OBJLoader = require('three-obj-loader')
    OBJLoader(THREE)

    THREE.ViveController = function(controllerId, vrControls, startUpdating) {

        if (startUpdating === undefined) {
            startUpdating = true;
        }

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
            model.material.color = new THREE.Color(1, 1, 1)
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

        this.update = function() {
            var gamepad = navigator.getGamepads()[controllerId];
            console.log(gamepad)
            if (gamepad && gamepad.pose) {
                this.visible = true;

                var padButton = gamepad.buttons[0]
                var triggerButton = gamepad.buttons[1]
                var gripButton = gamepad.buttons[2]
                var menuButton = gamepad.buttons[3]

                if (!this.connected) this.emit(this.Connected)

                var pose = gamepad.pose;

                if(pose.position && pose.orientation) {
                    this.tracked = true
                    this.lastPosePosition = pose.position
                    this.lastPoseOrientation = pose.orientation
                }
                else {
                    this.tracked = false
                }

                this.position.fromArray(this.lastPosePosition)
                this.quaternion.fromArray(this.lastPoseOrientation)
                this.matrix.compose(this.position, this.quaternion, this.scale)
                this.matrix.multiplyMatrices(this.standingMatrix, this.matrix)
                this.matrixWorldNeedsUpdate = true


                bindButton(this.PadTouched, this.PadUntouched, padButton, "touched")
                bindButton(this.PadPressed, this.PadUnpressed, padButton, "pressed")
                bindButton(this.MenuPressed, this.MenuUnpressed, menuButton, "pressed")
                bindButton(this.Gripped, this.Ungripped, gripButton, "pressed")

                var wasTriggerClicked = this.triggerClicked
                this.triggerClicked = triggerButton.value == 1
                if (!wasTriggerClicked && this.triggerClicked) {
                    this.emit(this.TriggerClicked)
                }
                if (wasTriggerClicked && !this.triggerClicked) {
                    this.emit(this.TriggerUnclicked)
                }
                this.triggerLevel = triggerButton.value

                this.padX = gamepad.axes[0]
                this.padY = gamepad.axes[1]

                if (this.padTouched && this.listeners(this.PadDragged) && lastPadPosition.x != null) {
                    var dx = this.padX - lastPadPosition.x
                    var dy = this.padY - lastPadPosition.y
                    this.emit(this.PadDragged, dx, dy)
                }

                if (this.padTouched) {
                    lastPadPosition.x = this.padX
                    lastPadPosition.y = this.padY
                } else {
                    lastPadPosition.x = null
                    lastPadPosition.y = null
                }


            } else {
                this.visible = false;
            }
            this.connected = !!gamepad

        }

        this.startUpdating = function() {
            this.update();
            requestAnimationFrame(this.startUpdating);
        }.bind(this)

        if (startUpdating) {
            this.startUpdating();
        }

    };

    THREE.ViveController.prototype = Object.create(THREE.Object3D.prototype);
    THREE.ViveController.prototype.constructor = THREE.ViveController;
    return THREE.ViveController;
}

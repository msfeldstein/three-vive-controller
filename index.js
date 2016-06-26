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

        function update() {
            requestAnimationFrame(update);

            var gamepad = navigator.getGamepads()[controllerId];
            if (gamepad !== undefined && gamepad.pose !== null) {
                var padButton = gamepad.buttons[0]
                var triggerButton = gamepad.buttons[1]
                var gripButton = gamepad.buttons[2]
                var menuButton = gamepad.buttons[3]

                if (!c.connected) c.emit(c.Connected)

                var pose = gamepad.pose;
                c.position.fromArray(pose.position);
                c.quaternion.fromArray(pose.orientation);
                c.matrix.compose(c.position, c.quaternion, c.scale);
                c.matrix.multiplyMatrices(c.standingMatrix, c.matrix);
                c.matrixWorldNeedsUpdate = true;

                c.visible = true;
                var wasTouched = c.padTouched
                var wasPadPressed = c.padPressed
                c.padTouched = padButton.touched
                c.padPressed = padButton.pressed
                if (c.padTouched && !wasTouched) {
                    c.emit(c.PadTouched)
                }
                if (!c.padTouched && wasTouched) {
                    c.emit(c.PadUntouched)
                }
                if (c.padPressed && !wasPadPressed) {
                  c.emit(c.PadPressed)
                }
                if (!c.padPressed && wasPadPressed) {
                  c.emit(c.PadUnpressed)
                }

                var wasMenuPressed = c.menuPressed
                c.menuPressed = menuButton.pressed
                if (c.menuPressed && !wasMenuPressed) { c.emit(c.MenuPressed) }
                if (!c.menuPressed && wasMenuPressed) { c.emit(c.MenuUnpressed) }

                var wasTriggerClicked = c.triggerClicked
                c.triggerClicked = triggerButton.value == 1
                if (!wasTriggerClicked && c.triggerClicked) {
                    c.emit(c.TriggerClicked)
                }
                if (wasTriggerClicked && !c.triggerClicked) {
                    c.emit(c.TriggerUnclicked)
                }

                var wasGripped = c.gripped
                c.gripped = gripButton.pressed
                if (!wasGripped && c.gripped) {
                  c.emit(c.Gripped)
                }
                if (wasGripped && !c.gripped) {
                  c.emit(c.Ungripped)
                }

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
                c.triggerLevel = gamepad.buttons[1].value



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

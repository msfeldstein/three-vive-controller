var EventEmitter = require('eventemitter3');

module.exports = function(THREE) {
    var OBJLoader = require('three-obj-loader')(THREE)
    THREE.ViveController = function ( id ) {

    THREE.Object3D.call( this );

    var Events = new EventEmitter()
    Events.PadTouched = "PadTouched"
    Events.PadUntouched = "PadUntouched"
    Events.TriggerClicked = "TriggerClicked"
    Events.TriggerUnclicked = "TriggerUnclicked"
    Events.MenuClicked = "MenuClicked"
    Events.MenuUnclicked = "MenuUnclicked"
    Events.Gripped = "Gripped"
    Events.Ungripped = "Ungripped"
    Events.PadDragged = "PadDragged"
    this.Events = Events

    this.matrixAutoUpdate = false;
    this.standingMatrix = new THREE.Matrix4();

    this.onPadTouched = new EventEmitter()
    this.onPadUntouched = new EventEmitter()
    this.onTriggerClicked = new EventEmitter()
    this.onTriggerUnclicked = new EventEmitter()

    this.padTouched = false
    var scope = this;

    var lastPadPosition = {
      x: 0,
      y: 0
    }

    function update() {

      requestAnimationFrame( update );

      var gamepad = navigator.getGamepads()[ id ];

      if ( gamepad !== undefined && gamepad.pose !== null ) {

        var pose = gamepad.pose;

        scope.position.fromArray( pose.position );
        scope.quaternion.fromArray( pose.orientation );
        scope.matrix.compose( scope.position, scope.quaternion, scope.scale );
        scope.matrix.multiplyMatrices( scope.standingMatrix, scope.matrix );
        scope.matrixWorldNeedsUpdate = true;

        scope.visible = true;
        var wasTouched = scope.padTouched
        scope.padTouched = gamepad.buttons[0].touched
        if (scope.padTouched && !wasTouched) {
          scope.Events.emit(Events.PadTouched)
        }

        if (!scope.padTouched && wasTouched) {
          Events.emit(Events.PadUntouched)
        }

        var wasTriggerClicked = scope.triggerClicked
        scope.triggerClicked = gamepad.buttons[1].value == 1
        if (!wasTriggerClicked && scope.triggerClicked) {
          Events.emit(Events.TriggerClicked)
        }
        if (wasTriggerClicked && !scope.triggerClicked) {
          Events.emit(Events.TriggerUnclicked)
        }

        var wasMenuClicked = scope.menuClicked
        scope.menuClicked = gamepad.buttons[2].pressed
        if (!wasMenuClicked && scope.menuClicked) {
          Events.emit(Events.MenuClicked)
        }

        scope.padX = gamepad.axes[0]
        scope.padY = gamepad.axes[1]

        if (scope.padTouched && Events.listeners(Events.PadDragged) && lastPadPosition.x != null) {
          var dx = scope.padX - lastPadPosition.x
          var dy = scope.padY - lastPadPosition.y
          Events.emit(Events.PadDragged, dx, dy)
        }

        if (scope.padTouched) {
          lastPadPosition.x = scope.padX
          lastPadPosition.y = scope.padY
        } else {
          lastPadPosition.x = null
          lastPadPosition.y = null
        }
        scope.triggerLevel = gamepad.buttons[1].value



      } else {

        scope.visible = false;

      }

    }

    update();

  };

  THREE.ViveController.prototype = Object.create( THREE.Object3D.prototype );
  THREE.ViveController.prototype.constructor = THREE.ViveController;
  return THREE.ViveController;
}

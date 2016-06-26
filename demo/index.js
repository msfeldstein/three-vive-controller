var THREE = require('three')
var VRControls = require('./VRControls')(THREE)
var ViveController = require('..')(THREE, "/")
var camera, scene, renderer;
var effect, controls;
var room;

scene = new THREE.Scene()
camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1, 10000)
camera.position.z = 0
scene.add(new THREE.Mesh(
  new THREE.BoxGeometry(6, 6, 6, 10, 10, 10),
  new THREE.MeshBasicMaterial({color: 0x202020, wireframe: true})
))

scene.add(new THREE.HemisphereLight(0x404020, 0x202040, 1.0))
var light = new THREE.DirectionalLight(0xffffff)
light.position.set(10, 10, 10).normalize()
scene.add(light)

var renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setClearColor(0x101010)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

controls = new THREE.VRControls(camera)
controls.standing = true

var controller = new ViveController(0, controls)
scene.add(controller)

var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(.1,32,32),
  new THREE.MeshPhongMaterial({color: 0x32f3e2})
)
sphere.position.z = -.2
controller.add(sphere)
sphere.visible = false
controller.Events.on(controller.Events.PadTouched, () => {
  sphere.visible = true
})
controller.Events.on(controller.Events.PadUntouched, () => {
  sphere.visible = false
  sphere.position.x = 0
  sphere.position.z = -.2
})
controller.Events.on(controller.Events.PadDragged, (dx, dy) => {
  sphere.position.x += dx / 5
  sphere.position.z += dy / 5
})

controller.Events.on(controller.Events.Connected, () => {
  console.log("Connected")
})

controller.Events.on(controller.Events.Disonnected, () => {
  console.log("Disconnected")
})

controller.Events.on(controller.Events.TriggerClicked, () => {
  controller.scale.set(1.3, 1.3, 1.3)
})
controller.Events.on(controller.Events.TriggerUnclicked, () => {
  controller.scale.set(1, 1, 1)
})

var animate = function() {
  requestAnimationFrame(animate)
  camera.lookAt(controller.position)
  renderer.render(scene, camera)
}
animate()

var THREE = require('three')
var VRControls = require('./VRControls')(THREE)
var ViveController = require('..')(THREE, "../")
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

controller.on(controller.Connected, () => {
  console.log("Connected")
})


// Pad
var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(.03,32,32),
  new THREE.MeshPhongMaterial({color: 0x32f3e2})
)
sphere.position.z = -.2
controller.add(sphere)
sphere.visible = false
controller.on(controller.PadTouched, () => {
  sphere.visible = true
})
controller.on(controller.PadUntouched, () => {
  sphere.visible = false
  sphere.position.x = 0
  sphere.position.z = -.2
})
controller.on(controller.PadDragged, (dx, dy) => {
  sphere.position.x += dx / 5
  sphere.position.z -= dy / 5
})
controller.on(controller.PadPressed, () => { sphere.scale.y = 2})
controller.on(controller.PadUnpressed, () => { sphere.scale.y = 1})


// Grip
var gripBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.02, 0.02),
  new THREE.MeshPhongMaterial({color: 0x20ee20})
)
gripBox.position.set(0, -0.03, 0.1)
gripBox.visible = false
controller.add(gripBox)
controller.on(controller.Gripped, () => {
  gripBox.visible = true
})
controller.on(controller.Ungripped, () => {
  gripBox.visible = false
})


// Trigger
var triggerBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.02, 0.1),
  new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true})
)
triggerBox.rotation.x = -Math.PI / 4
triggerBox.position.y = -.08
controller.add(triggerBox)
controller.on(controller.TriggerClicked, () => {
  triggerBox.material.color.set(0x20ee20)
})
controller.on(controller.TriggerUnclicked, () => {
  triggerBox.material.color.set(0xffffff)
})


// Menu
var menuBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.1, 0.02),
  new THREE.MeshPhongMaterial({color: 0x20ee20})
)
menuBox.position.set(0, 0.08, 0.02)
menuBox.visible = false
controller.add(menuBox)
controller.on(controller.MenuPressed, () => {
  menuBox.visible = true
})
controller.on(controller.MenuUnpressed, () => {
  menuBox.visible = false
})

var animate = function() {
  requestAnimationFrame(animate)
  camera.lookAt(controller.position)
  triggerBox.material.opacity = controller.triggerLevel
  triggerBox.scale.z = controller.triggerLevel
  renderer.render(scene, camera)
}
animate()

let _unitConvert = 0.01;
var _splinePath;
var _splineObj;
var curve;
let _heightOffsetCurve = 0.45;
let _unitArray = [];
const _MAXOBJ = 10;
const _OPACITYTHRESHOLDIN = 0.1;
const _OPACITYTHRESHOLDOUT = 0.9;
const _ADD_OFFSET = 10;
let objectCounter = _MAXOBJ;

let _loopCounter = 0;
let _maxLoop = 5;

let totalCount = 0;
let _speed = 0.1;
var _maxCount = 593;
var progress = document.getElementById('progress');
var _progressWidth;

var _straightPath = [];
let numberContainer = document.querySelector('h1.countScroll');

//basic THREEJS Setup
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000 );
scene.add(camera);
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Camera
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.campingFactor = 0.25;
controls.enableZoom = true;
camera.position.x = -1.2;
camera.position.y = 2.3;
camera.position.z = 7.3;
camera.rotation.x = -18.175*_unitConvert;
camera.rotation.y = -13.189*_unitConvert;

//time
var clock = new THREE.Clock(); //units a second
var dt = 0;
var _f = 0;

//UI
var datGUI = new dat.GUI({ autoPlace: false });
var GUIContainer = document.getElementById('guiContainer');
GUIContainer.appendChild(datGUI.domElement);

var guiControls = new function () {
  this.speed = 1;
  this.restart = function() {
      totalCount = 0;
   };

}

datGUI.add(guiControls, 'speed', 0.01, 5, 0.01);
datGUI.add(guiControls, 'restart');
datGUI.close();



//Background
var backgroundTexBlack = new THREE.TextureLoader().load( 'Assets/gradientB&W.jpg' );
scene.background = backgroundTexBlack;

var circleGeo = new THREE.CircleGeometry(0.2, 32);

window.addEventListener("DOMContentLoaded", (event) => {
  init();
  render();
});

window.addEventListener( 'resize', onWindowResize, false );


function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function init() {

  createObj();
  straightPath();
  _splinePath = new Spline(_straightPath);

}

function render () {

  if(totalCount < _maxCount) {
    dt += clock.getDelta();
    _f = (dt*guiControls.speed)%1;

    //progressBar
    _progressWidth = mapRange(totalCount, 0,_maxCount, 0, 50);
    progress.style.width = _progressWidth + "%";

    for(var i = 0; i<_unitArray.length; i++) {
      var obj = _unitArray[i];
      obj.userData.f = ((_f + obj.userData.offset))%1;
      _splinePath.setObjectPath(obj, obj.userData.f);
      obj.lookAt(camera.position);
      opacityEase(obj.userData.f, obj);
      if(obj.userData.f< obj.userData.prevF ) {
        totalCount += 1;
      }
      obj.userData.prevF = obj.userData.f;
      numberContainer.innerHTML = totalCount;
    }
  }
  requestAnimationFrame( render );

  renderer.render( scene, camera );
};

function createObj() {
 for(var i = 0; i<_MAXOBJ; i++) {
  var redMat = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true});
  redMat.needsUpdate = true;
  redMat.opacity = 0;
  var startPos = new THREE.Vector3(-5, 0, 0);
  var obj = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), redMat);
  obj.userData.offset = i*0.1;
  obj.userData.f = 0;
  obj.userData.number = i;
  obj.userData.prevF = 0;
  obj.position.copy(startPos);
  scene.add(obj);
  _unitArray.push(obj);

  }
}

function straightPath () {
  var vec3Array = [];
  for(var i = 0; i < 10; i++) {
    var point = new THREE.Vector3(i-5, 0, 0);
    _straightPath.push(i-5, 0, 0)
    vec3Array.push(point);
  }
}

function opacityEase(f, obj) {

  if(f < _OPACITYTHRESHOLDIN) {
    obj.material.opacity =  mapRange(f, 0,_OPACITYTHRESHOLDIN, 0, 1);
  } else if (f > _OPACITYTHRESHOLDOUT) {
    obj.material.opacity = mapRange(f,_OPACITYTHRESHOLDOUT,1, 1, 0);
  } else {
    obj.material.opacity = 1;
  }
}


function mapRange(value, a, b, c, d) {
  value = (value - a) / (b - a);
  return c + value*(d-c);
}

function  clamp ( value, min, max ) {

  return Math.max( min, Math.min( max, value ) );

}



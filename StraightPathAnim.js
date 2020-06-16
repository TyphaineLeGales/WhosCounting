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
let _speed = 2;
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
var t;
var _f = 0;

//UI
var datGUI = new dat.GUI();
var guiControls = new function () {
  this.orbitControlsEnabled = false;
  this.hideSpline = false;
  this.modelIsVisible = false;
  this.skyBackground = false;
  this.redDots = false;
  this.speed = 1;
  this.pathF = 0.50;
  this.cameraPosX = camera.position.x;
  this.cameraPosY = camera.position.y;
  this.cameraPosZ = camera.position.z;
  this.cameraRX = camera.rotation.x;
  this.cameraRY = camera.rotation.y;
  this.cameraRZ = camera.rotation.z;
}

datGUI.add(guiControls, 'orbitControlsEnabled').onChange(function(value) {
  controls.enabled = value;
});

datGUI.add(guiControls, 'hideSpline').onChange(function(value) {
  _splineObj.visible = value;
})
datGUI.add(guiControls, 'modelIsVisible').onChange(function(value) {
  matcapModel.visible = value;
});

datGUI.add(guiControls, 'skyBackground').onChange(function(value) {
  if(value === true) {
    scene.background = backgroundTexSky;
  } else {
    scene.background = backgroundTexBlack;
  }
});

// datGUI.add(guiControls, 'lineThickness', 1, 10);
datGUI.add(guiControls, 'speed', 1, 10, 1);
datGUI.add(guiControls, 'pathF', 0,1);

var cameraPosition = datGUI.addFolder('CameraPos');

cameraPosition.add(guiControls, 'cameraPosX', -5, 5 ).onChange(function(value) {
  camera.position.x = value;
});
cameraPosition.add(guiControls, 'cameraPosY', -5, 5 ).onChange(function(value) {
  camera.position.y = value;
});
cameraPosition.add(guiControls, 'cameraPosZ', -5, 10 ).onChange(function(value) {
  camera.position.z = value;
});

cameraPosition.close();
var rotationFolder = datGUI.addFolder('CameraRotation');
rotationFolder.add(guiControls, 'cameraRX', -5, 5 ).onChange(function(value) {
  camera.rotation.x = value;
});
rotationFolder.add(guiControls, 'cameraRY', -5, 5 ).onChange(function(value) {
  camera.rotation.y = value;
});
rotationFolder.add(guiControls, 'cameraRZ', -5, 10 ).onChange(function(value) {
  camera.rotation.z = value;
});

rotationFolder.close();

//MATCAP
var testMat = new THREE.MeshNormalMaterial();
var texture = new THREE.TextureLoader().load( 'Assets/matCapTest.jpg' );

var testMat2 = new THREE.MeshNormalMaterial();
var texture2 = new THREE.TextureLoader().load( 'Assets/matCap4.jpg' );
var testMatcap2 = new THREE.MeshMatcapMaterial({matcap:texture2});
var matcapModel= new THREE.MeshMatcapMaterial({matcap:texture2});

//Background
var backgroundTexSky = new THREE.TextureLoader().load( 'Assets/skyTest2.jpg' );
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
  console.log(_f);

  if(totalCount < _maxCount) {
  dt += clock.getDelta();
  _f = dt%1;
    //progressBar
    totalCount += 1;
    _progressWidth = mapRange(totalCount, 0,_maxCount, 0, 50);
    progress.style.width = _progressWidth + "%";


    // console.log(_unitArray[0].userData.f);

    for(var i = 0; i<_unitArray.length; i++) {
      var obj = _unitArray[i];
      // console.log(_f);
      obj.userData.f = ((_f + obj.userData.offset))%1;
      _splinePath.setObjectPath(obj, obj.userData.f);
      obj.lookAt(camera.position);
      opacityEase(obj.userData.f, obj);

    }
  requestAnimationFrame( render );
  }

  renderer.render( scene, camera );
};

function createObj() {
 for(var i = 0; i<_MAXOBJ; i++) {
  var redMat = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true});
  redMat.needsUpdate = true;
  redMat.opacity = 0;
  // var matcap = new THREE.MeshMatcapMaterial({matcap:texture, transparent: true});
  // matcap.needsUpdate = true;
  // matcap.opacity = 0;
  var startPos = new THREE.Vector3(-5, 0, 0);
  // var obj = new THREE.Mesh(new THREE.CubeGeometry( 0.5, 0.5, 0.5),matcap);
  var obj = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), redMat);

  // var obj = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2), personMat);
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
    // var testMesh = new THREE.Mesh(circleGeo, testMat);
    // testMesh.position.copy(point);
    _straightPath.push(i-5, 0, 0)
    // scene.add(testMesh);
    vec3Array.push(point);
  }

  // var path = new THREE.CatmullRomCurve3( vec3array );
  // var tubeGeometry = new THREE.TubeGeometry( path, 256, 0.2, 5, false );
  // var splineObj = new THREE.Mesh( tubeGeometry, testMatcap2 );
  // scene.add( splineObj);
}


function instanceObjAlongSpline () {
var _geo = new THREE.SphereGeometry( 0.03, 8, 8);
var _mat = new THREE.MeshBasicMaterial({color:0xffffff});

  for(var i = 0; i < _splinePoints.length-3; i+=3) {
    var instance = new THREE.Mesh(_geo, _mat);
    instance.position.x = _splinePoints[i];
    instance.position.y = _splinePoints[i+1];
    instance.position.z = _splinePoints[i+2];
    var nextPoint = new THREE.Vector3(_splinePoints[i+3], _splinePoints[i+4], _splinePoints[i+5]);
    instance.lookAt(nextPoint);
    scene.add(instance);
  }
}


function respawn() {

  if(_f > 0.9){
    scrollContainer.scrollTop = 0;
    _loopCounter += 1;
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


function easePath(t) {
    let easedT = t % guiControls.speed;
    easedT = 0.5 + Math.cos(Math.pow(Math.exp(-easedT), 4) * Math.PI) * 0.5;
    return easedT
}

function mapRange(value, a, b, c, d) {
  value = (value - a) / (b - a);
  return c + value*(d-c);
}

function  clamp ( value, min, max ) {

  return Math.max( min, Math.min( max, value ) );

}


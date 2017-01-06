var THREE = require('three');
var raf = require('raf');
var lsb = require('lsb');
var request = require('browser-request');
var ndarray = require('ndarray');
const actions = require( './assets/js/actions' );
const voxels = require( './assets/js/voxel' );
const colorsh = require( './assets/js/colors' );
const helper = require( './assets/js/helper' );
const events = require( './assets/js/events' );
const animate = require( './assets/js/animate' );

module.exports = function() {
  var container;
  var camera = window.camera, renderer = window.renderer, brush = window.brush;
  var projector, plane, scene, grid, shareDialog;
  var mouse2D, mouse3D, raycaster, objectHovered;
  var isShiftDown = window.isShiftDown = false, isCtrlDown = window.isCtrlDown = false, isMouseDown = window.isMouseDown = false, isAltDown = window.isAltDown = false;
  var onMouseDownPosition = window.onMouseDownPosition = new THREE.Vector2(), onMouseDownPhi = 60, onMouseDownTheta = 45;
  var radius = window.radius = 1600, theta = window.theta = 90, phi = window.phi = 60;
  var target = window.target = new THREE.Vector3( 0, 200, 0 );
  var CubeMaterial = window.CubeMaterial = window.CubeMaterial = THREE.MeshBasicMaterial;
  var cube = window.cube = new THREE.CubeGeometry( 50, 50, 50 );
  var wireframeCube = window.wireframeCube = new THREE.CubeGeometry(50.5, 50.5 , 50.5);
  var wireframe = window.wireframe = true, fill = window.fill = true, animation = window.animation = false, animating = window.animating = false, animationInterval;
  var manualAnimating = window.manualAnimating = false;
  var wireframeOptions = window.wireframeOptions = { color: 0x000000, wireframe: true, wireframeLinewidth: 1, opacity: 0.8 };
  var wireframeMaterial = window.wireframeMaterial = new THREE.MeshBasicMaterial(wireframeOptions);
  var animationFrames = window.animationFrames = [];
  var currentFrame = window.currentFrame = 0;
  var sliderEl, playPauseEl;
  var color = window.color = 0;
  var colors = window.colors = ['2ECC71', '3498DB', '34495E', 'E67E22', 'ECF0F1'].map(function(c) { return colorsh.hex2rgb(c) });
  for( var c = 0; c < 5; c++ ) {
    colorsh.addColorToPalette(c);
  }

  init();
  raf(window).on('data', render);

  function init() {

    bindEventsAndPlugins()
    helper.setupImageDropImport(document.body)

    container = document.createElement( 'div' )
    document.body.appendChild( container )

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 )
    camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 )
    camera.position.y = radius * Math.sin( phi * Math.PI / 360 )
    camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 )
    window.camera = camera;

    scene = new THREE.Scene()
    window.scene = scene;

    // Grid

    var size = 500, step = 50

    var geometry = new THREE.Geometry()

    for ( var i = - size; i <= size; i += step ) {

      geometry.vertices.push( new THREE.Vector3( - size, 0, i ) )
      geometry.vertices.push( new THREE.Vector3(   size, 0, i ) )

      geometry.vertices.push( new THREE.Vector3( i, 0, - size ) )
      geometry.vertices.push( new THREE.Vector3( i, 0,   size ) )

    }

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } )

    var line = new THREE.Line( geometry, material )
    line.type = THREE.LinePieces
    grid = line
    scene.add( line )

    // Plane

    projector = new THREE.Projector();

    plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshBasicMaterial() );
    plane.rotation.x = - Math.PI / 2;
    plane.visible = false;
    plane.isPlane = true;
    scene.add( plane );
    window.plane = plane;

    window.mouse2D = new THREE.Vector3( 0, 10000, 0.5 );

    // Brush

    var brushMaterials = [
      new CubeMaterial( { vertexColors: THREE.VertexColors, opacity: 0.5, transparent: true } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
    ]
    brushMaterials[0].color.setRGB(colors[0][0], colors[0][1], colors[0][2])
    brush = THREE.SceneUtils.createMultiMaterialObject( cube, brushMaterials )

    brush.isBrush = true
    brush.position.y = 2000
    brush.overdraw = false
    scene.add( brush );
    window.brush = brush;

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 )
    scene.add( ambientLight )

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
		directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
		scene.add( directionalLight );

    // var directionalLight = new THREE.DirectionalLight( 0xffffff )
    // directionalLight.position.x = Math.random() - 0.5
    // directionalLight.position.y = Math.random() - 0.5
    // directionalLight.position.z = Math.random() - 0.5
    // directionalLight.position.normalize()
    // scene.add( directionalLight )
    //
    // var directionalLight = new THREE.DirectionalLight( 0x808080 )
    // directionalLight.position.x = Math.random() - 0.5
    // directionalLight.position.y = Math.random() - 0.5
    // directionalLight.position.z = Math.random() - 0.5
    // directionalLight.position.normalize()
    // scene.add( directionalLight )

    var hasWebGL =  ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )()

    if (hasWebGL)
      renderer = new THREE.WebGLRenderer({antialias: true})
    else
      renderer = new THREE.CanvasRenderer()

    renderer.setSize( window.innerWidth, window.innerHeight )

    container.appendChild(renderer.domElement)

    renderer.domElement.addEventListener( 'mousemove', events.onDocumentMouseMove, false )
    renderer.domElement.addEventListener( 'mousedown', events.onDocumentMouseDown, false )
    renderer.domElement.addEventListener( 'mouseup', events.onDocumentMouseUp, false )
    document.addEventListener( 'keydown', events.onDocumentKeyDown, false )
    document.addEventListener( 'keyup', events.onDocumentKeyUp, false )
    window.addEventListener('DOMMouseScroll', events.mousewheel, false);
    window.addEventListener('mousewheel', events.mousewheel, false);

    window.addEventListener( 'resize', events.onWindowResize, false )

    if ( window.location.hash )
      helper.buildFromHash();

    helper.updateHash();

    window.renderer = renderer;

  }

  function bindEventsAndPlugins() {

    $(window).on('hashchange', function() {
      if (window.updatingHash) return;
      window.location.reload()
    });

    $('.colorPickButton').click(colorsh.pickColor)
    $('.colorPickButton').on("contextmenu", colorsh.changeColor)
    $('.colorAddButton').click(colorsh.addColor)

    $('.toggle input').click(function(e) {
      // setTimeout ensures this fires after the input value changes
      setTimeout(function() {
        var el = $(e.target).parent()
        var state = !el.hasClass('toggle-off')
        exports[el.attr('data-action')](state)
      }, 0)
    })

    var actionsMenu = $(".actionsMenu");
    actionsMenu.dropkick({
                           change: function(value, label) {
                             if (value === 'noop') return;
                             if (value in actions) actions[value]();
                             setTimeout(function() {
                               actionsMenu.dropkick('reset');
                             }, 0);
                           }
                         });

    // Todo list
    $(".todo li").click(function() {
      $(this).toggleClass("todo-done");
    });

    // Init tooltips
    $("[data-toggle=tooltip]").tooltip("show");

    // Init tags input
    $("#tagsinput").tagsInput();

    sliderEl = $("#slider");
    playPauseEl = $('.play-pause');
    var addFrameButton = $('.plus-button');
    var removeFrameButton = $('.minus-button');

    // Init jQuery UI slider
    sliderEl.slider({
                      min: 1,
                      max: 1,
                      value: 1,
                      orientation: "horizontal",
                      range: "min",
                      change: function( event, ui ) {
                        if (manualAnimating) return
                        var val = ui.value
                        var nextFrame = val - 1
                        animate(nextFrame)
                        currentFrame = nextFrame
                      }
                    })

    addFrameButton.click(animate.addFrame)
    removeFrameButton.click(animate.removeFrame)

    playPauseEl.click(function(e) {
      exports.playPause()
    })

    // JS input/textarea placeholder
    $("input, textarea").placeholder();

    $(".btn-group").on("click", "a", function() {
      $(this).siblings().removeClass("active");
      $(this).addClass("active");
    });

    // Disable link click not scroll top
    $("a[href^='#']").click(function(e) {
      e.preventDefault()
    });

    // About modal
    $('a[href="#about"]').on( 'click', function() {
      exports.about();
    } );

    // Open links in new tab
    $( 'a[href^="http"]' ).on( 'click', function() {
      this.target = '_blank';
    } );

    window.sliderEl = sliderEl;
    window.playPauseEl = playPauseEl;

  }

  function save() {
    window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
  }

  function render() {
    camera.lookAt( target );
    window.raycaster = projector.pickingRay( window.mouse2D.clone(), camera );
    renderer.render( scene, camera );
  }
  window.render = render;

};

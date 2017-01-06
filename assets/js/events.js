/**
 * Created by dweipert on 14.07.16.
 */

const helper = require( './helper' );
const colorsh = require( './colors' );
const animate = require( './animate' );
const voxels = require( './voxel' );

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize( window.innerWidth, window.innerHeight )
  helper.interact()
}

function mousewheel( event ) {
  // prevent zoom if a modal is open
  if ($('.modal').hasClass('in'))
    return
  helper.zoom(event.wheelDeltaY || event.detail)
}

function onDocumentMouseMove( event ) {
  event.preventDefault()

  if ( isMouseDown ) {

    theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta
    phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi

    phi = Math.min( 180, Math.max( 0, phi ) )

    camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 )
    camera.position.y = radius * Math.sin( phi * Math.PI / 360 )
    camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 )
    camera.updateMatrix()

  }

  mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1
  mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1

  helper.interact()
}

function onDocumentMouseDown( event ) {
  event.preventDefault()
  isMouseDown = true
  onMouseDownTheta = theta
  onMouseDownPhi = phi
  onMouseDownPosition.x = event.clientX
  onMouseDownPosition.y = event.clientY
}

function onDocumentMouseUp( event ) {
  event.preventDefault()
  isMouseDown = false
  onMouseDownPosition.x = event.clientX - onMouseDownPosition.x
  onMouseDownPosition.y = event.clientY - onMouseDownPosition.y

  if ( onMouseDownPosition.length() > 5 ) return

  var intersect = helper.getIntersecting()

  if ( intersect ) {
    if ( isShiftDown ) {
      if ( intersect.object != plane ) {
        scene.remove( intersect.object.wireMesh )
        scene.remove( intersect.object )
      }
    } else {
      if (brush.position.y != 2000) voxels.addVoxel(brush.position.x, brush.position.y, brush.position.z, color)
    }
  }

  helper.updateHash();
  render();
  helper.interact();
}

function onDocumentKeyDown( event ) {
  switch( event.keyCode ) {
    case 189: helper.zoom(100); break;
    case 187: helper.zoom(-100); break;
    case 49: colorsh.setColor(0); break;
    case 50: colorsh.setColor(1); break;
    case 51: colorsh.setColor(2); break;
    case 52: colorsh.setColor(3); break;
    case 53: colorsh.setColor(4); break;
    case 54: colorsh.setColor(5); break;
    case 55: colorsh.setColor(6); break;
    case 56: colorsh.setColor(7); break;
    case 57: colorsh.setColor(8); break;
    case 48: colorsh.setColor(9); break;
    case 32: colorsh.playPause(); break;
    case 16: isShiftDown = true; break;
    case 17: isCtrlDown = true; break;
    case 18: isAltDown = true; break;
    case 81: animate.changeFrame(); break;
    case 65: helper.setIsometricAngle(); break;
    case 87: animate.addFrame(); break;
  }

}

function onDocumentKeyUp( event ) {

  switch( event.keyCode ) {
    case 16: isShiftDown = false; break;
    case 17: isCtrlDown = false; break;
    case 18: isAltDown = false; break;
  }
}

module.exports = {

  onWindowResize: onWindowResize,

  mousewheel: mousewheel,

  onDocumentMouseMove: onDocumentMouseMove,
  onDocumentMouseDown: onDocumentMouseDown,
  onDocumentMouseUp: onDocumentMouseUp,

  onDocumentKeyDown: onDocumentKeyDown,
  onDocumentKeyUp: onDocumentKeyUp

};

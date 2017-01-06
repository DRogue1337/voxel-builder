/**
 * Created by dweipert on 14.07.16.
 */

var voxel2dprinter = require('voxel-2d-print');
var orthogamiExport = require('./orthogami.js');
const helper = require( './helper' );

/**
 * Instructions modal
 */
module.exports.viewInstructions = function() {
  $('#welcome').modal();
};

module.exports.orthogamiExport = function() {
  var data = getVoxels()
  try {
    var svgs = orthogamiExport(data.voxels, data.colors)
    $('#orthogamiExport').modal()
    var content = $('#orthogamiExport .orthogami')
    content.html('')
    svgs.map(function(svg) {
      var svgUri = encodeSVGDatauri(svg)
      content.append($('<a href="' + svgUri + '">' + svg + '</a>'))
    })
  } catch(e) {
    alert('Unable to export current design, sorry! Try making it a bit simpler')
  }
}

module.exports.paperstackExport = function() {
  var data = getVoxels()
  console.log(data)
  var stack = voxel2dprinter(data.voxels, data.colors, 80)

  $('#paperstackExport').modal()
  var content = $('#paperstackExport .canvases')
  content.html('')
  console.log(stack)
  stack.canvases.map(function(canv) {
    var pngUri = canv.toDataURL('image/png')
    var link = $('<a href="' + pngUri + '"></a>')
    link.append(canv)
    content.append(link)
  })
}

module.exports.loadExample = function() {
  window.location.replace( '#C/2ecc713498db34495ee67e22ecf0f11d2999000000:A/bdhiSeVhhSiSfVheUhSfSiXhfjfhffcSi')
  buildFromHash()
}

module.exports.imageImport = function() {

  var imageImport = $( '#imageImport' );

  imageImport.modal();
  var file = imageImport.find( '[name="file"]' )[ 0 ];
  imageImport.find( '[name="import"]' ).on( 'click', function( e ) {

    if( !file.files[ 0 ] ) {
      alert( 'Select a file!' );
      return;
    }

    file = window.URL.createObjectURL( file.files[ 0 ] );
    var img = new Image;

    img.src = file;
    img.onload = function() {
      if ( !importImage( img ) )
      {
        alert( 'Looks like that image doesn\'t have any voxels inside it...\nOr this image wasn\'t exported from here.' );
        return;
      }

      imageImport.modal( 'toggle' );
    };

  } );

};

module.exports.zoxelImport = function() {};

module.exports.zoxelExport = function() {
  // TODO: zugriff auf die erstellten arrays
  // TODO: diese dann als .zox exporten
};

module.exports.getImage = function(imgURL, cb) {
  var img = new Image()
  img.crossOrigin = ''
  img.src = imgURL
  img.onload = function() {
    cb(img)
  }
}

module.exports.exportImage = function() {
  var voxels = updateHash();
  if (voxels.length === 0) return;

  var canvas = helper.getExportCanvas(800, 600);
  var image = new Image;
  image.src = canvas.toDataURL();

  window.open(image.src, 'voxel-painter-window');
};

/**
 * Reset function
 */
module.exports.reset = function() {
  alert('Hallo hime!');
  if( !confirm( 'Really reset? (hime)' ) )
    return;

  window.location.replace('#/');
  scene.children
       .filter(function(el) { return el.isVoxel })
       .map(function(mesh) { scene.remove(mesh) });
};

/**
 * About modal
 */
module.exports.about = function() {
  $('#about').modal();
};

exports.setColor = function(idx) {
  $('i[data-color="' + idx + '"]').click()
}

exports.setWireframe = function(bool) {
  wireframe = bool
  scene.children
       .filter(function(el) { return el.isVoxel })
       .map(function(mesh) { mesh.wireMesh.visible = bool })
}

exports.toggleAnimation = function(bool) {
  animation = bool
  $('.animationControls').toggle()
}

exports.setFill = function(bool) {
  fill = bool
  scene.children
       .filter(function(el) { return el.isVoxel })
       .map(function(mesh) { mesh.material.visible = bool })
}

exports.showGrid = function(bool) {
  grid.material.visible = bool
}

exports.setShadows = function(bool) {
  if (bool) CubeMaterial = THREE.MeshLambertMaterial
  else CubeMaterial = THREE.MeshBasicMaterial
  scene.children
       .filter(function(el) { return el !== brush && el.isVoxel })
       .map(function(cube) { scene.remove(cube) })
  buildFromHash()
}

exports.playPause = function() {
  animating = !animating
  playPauseEl.toggleClass('fui-play', !animating).toggleClass('fui-pause', animating)
  if (animating) animationInterval = setInterval(changeFrame, 250)
  else clearInterval(animationInterval)
}
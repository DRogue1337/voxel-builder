/**
 * Created by dweipert on 14.07.16.
 */

const THREE = require( 'three' );
const Convert = require('voxel-critter/lib/convert.js');
const ndarray = require( 'ndarray' );
const ndarrayFill = require( 'ndarray-fill' );
const colorsh = require( './colors' );

function addVoxel(x, y, z, c) {
  var cubeMaterial = new CubeMaterial( { vertexColors: THREE.VertexColors, transparent: true } )
  var col = colors[c] || colors[0]
  cubeMaterial.color.setRGB( col[0], col[1], col[2] )
  var wireframeMaterial = new THREE.MeshBasicMaterial(wireframeOptions)
  wireframeMaterial.color.setRGB( col[0]-0.05, col[1]-0.05, col[2]-0.05 )
  var voxel = new THREE.Mesh( cube, cubeMaterial )
  voxel.wireMesh = new THREE.Mesh( wireframeCube, wireframeMaterial )
  voxel.isVoxel = true
  voxel.position.x = x
  voxel.position.y = y
  voxel.position.z = z
  voxel.wireMesh.position.copy(voxel.position)
  voxel.wireMesh.visible = wireframe
  voxel.matrixAutoUpdate = false
  voxel.updateMatrix()
  voxel.name = x + "," + y + "," + z
  voxel.overdraw = true
  scene.add( voxel )
  scene.add( voxel.wireMesh )
}

function getVoxels() {
  var hash = window.location.hash.substr(1)
  var convert = new Convert()
  var data = convert.toVoxels(hash)
  var l = data.bounds[0]
  var h = data.bounds[1]
  var d = [ h[0]-l[0] + 1, h[1]-l[1] + 1, h[2]-l[2] + 1]
  var len = d[0] * d[1] * d[2]
  var voxels = ndarray(new Int32Array(len), [d[0], d[1], d[2]])

  var colors = [undefined]
  data.colors.map(function(c) {
    colors.push('#' + colorsh.rgb2hex(c))
  })

  function generateVoxels(x, y, z) {
    var offset = [x + l[0], y + l[1], z + l[2]]
    var val = data.voxels[offset.join('|')]
    return data.colors[val] ? val + 1: 0
  }

  ndarrayFill(voxels, generateVoxels)
  return {voxels: voxels, colors: colors}
}

function encodeSVGDatauri(str, type) {
  var prefix = 'data:image/svg+xml'
  // base64
  if (!type || type === 'base64') {
    prefix += ';base64,'
    str = prefix + new Buffer(str).toString('base64')
    // URI encoded
  } else if (type === 'enc') {
    str = prefix + ',' + encodeURIComponent(str)
    // unencoded
  } else if (type === 'unenc') {
    str = prefix + ',' + str
  }
  return str
}

module.exports = {

  addVoxel: addVoxel,
  getVoxels: getVoxels,

  encodeSVGDatauri: encodeSVGDatauri

};

/**
 * Created by dweipert on 22.07.16.
 */

function changeFrame() {
  if (animationFrames.length === 0) return
  nextFrame = (currentFrame + 1) % animationFrames.length
  animate(nextFrame)
  currentFrame = nextFrame
  manualAnimating = true
  sliderEl.slider( "option", "value", currentFrame + 1)
  manualAnimating = false
}

function addFrame() {
  animationFrames.push(animationFrames[currentFrame])
  changeFrame()
  updateHash()
  sliderEl.slider( "option", "max", animationFrames.length )
}

function removeFrame() {
  animationFrames.splice(currentFrame, 1)
  if (currentFrame === animationFrames.length) currentFrame--
  loadCurrentFrame()
  sliderEl.slider( "option", "max", animationFrames.length )
  manualAnimating = true
  sliderEl.slider( "option", "value", currentFrame + 1)
  manualAnimating = false
}

function loadCurrentFrame() {
  scene.children.filter(function(c) {
    return (c.isVoxel)
  }).map(function(c) {
    scene.remove(c.wireMesh)
    scene.remove(c)
  })
  var positions = getPositionsFromData(decode(animationFrames[currentFrame]))
  for(var i = 0; i < positions.length; i++){
    var v = positions[i].split(',')
    addVoxel(v[0], v[1], v[2], v[3])
  }
}

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

function getFrameDiff(frame1, frame2) {
  pos1 = getPositionsFromData(decode(animationFrames[frame1]))
  pos2 = getPositionsFromData(decode(animationFrames[frame2]))
  removed = pos1.diff(pos2)
  added = pos2.diff(pos1)
  return [removed, added]
}

function getPositionsFromData(data) {
  var current = { x: 0, y: 0, z: 0, c: 0 }
  var voxels = []
  var i = 0, l = data.length
  while (i < l){
    var code = data[ i ++ ].toString( 2 )
    if ( code.charAt( 1 ) == "1" ) current.x += data[ i ++ ] - 32
    if ( code.charAt( 2 ) == "1" ) current.y += data[ i ++ ] - 32
    if ( code.charAt( 3 ) == "1" ) current.z += data[ i ++ ] - 32
    if ( code.charAt( 4 ) == "1" ) current.c += data[ i ++ ] - 32
    voxels.push((current.x * 50 + 25) + "," + (current.y * 50 + 25) + "," + (current.z * 50 + 25) + "," + current.c)
  }
  return voxels
}

function animate(frame) {
  diff = getFrameDiff(currentFrame, frame)
  removed = diff[0]
  added = diff[1]
  remove = {}
  removed.map(function(pos){
    var p = pos.split(',')
    var key = p[0] + "," + p[1] + "," + p[2]
    remove[key] = 1
  })
  //go through this loop in reverse instead of decrementing the counter every time an item is removed
  for ( i = scene.children.length - 1; i >= 0 ; i -- ) {
    c = scene.children[ i ]
    if (remove[c.name] == 1){
      if ( c.isVoxel ) {
        scene.remove(c.wireMesh)
        scene.remove(c)
      }
    }
  }

  for(var i = 0; i < added.length; i++){
    var v = added[i].split(',')
    addVoxel(v[0], v[1], v[2], v[3])
  }
}

module.exports = {

  changeFrame: changeFrame,

  addFrame: addFrame,
  removeFrame: removeFrame,

  loadCurrentFrame: loadCurrentFrame,

  getFrameDiff: getFrameDiff,

  getPositionsFromData: getPositionsFromData,

  animate: animate

};

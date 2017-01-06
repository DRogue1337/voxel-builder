/**
 * Created by dweipert on 14.07.16.
 */

const helper = require( './helper' );

var brush = window.brush;

function v2h(value) {
  value = parseInt(value).toString(16);
  return value.length < 2 ? '0' + value : value;
}

function rgb2hex(rgb) {
  var v2h = module.exports.v2h;
  return v2h( rgb[ 0 ] * 255 ) + v2h( rgb[ 1 ] * 255 ) + v2h( rgb[ 2 ] * 255 );
}

function hex2rgb(hex) {
  if(hex[0]=='#') hex = hex.substr(1);
  return [parseInt(hex.substr(0,2), 16)/255, parseInt(hex.substr(2,2), 16)/255, parseInt(hex.substr(4,2), 16)/255];
}

function addColorToPalette(idx) {
  // add a button to the group
  var colorBox = $('i[data-color="' + idx + '"]');
  if(!colorBox.length) {
    var base = $('.colorAddButton')
    var clone = base.clone()
    clone.removeClass('colorAddButton')
    clone.addClass('colorPickButton')
    colorBox = clone.find('.colorAdd')
    colorBox.removeClass('colorAdd')
    colorBox.addClass('color')
    colorBox.attr('data-color',idx)
    colorBox.text('')
    base.before(clone)
    clone.click(function(e) {
      pickColor(e)
      e.preventDefault()
    })
    clone.on("contextmenu", changeColor)
  }

  colorBox.parent().attr('data-color','#'+rgb2hex(colors[idx]))
  colorBox.css('background',"#"+rgb2hex(colors[idx]))

  if( color == idx && brush )
    brush.children[0].material.color.setRGB(colors[idx][0], colors[idx][1], colors[idx][2])
}

function addColor(e) {
  //add new color
  colors.push([0.0,0.0,0.0]);
  const idx = colors.length-1;

  color = idx;

  addColorToPalette(idx);

  helper.updateHash();

  updateColor(idx);
}

function updateColor(idx) {
  color = idx;
  var picker = $('i[data-color="' + idx + '"]').parent().colorpicker('show');

  picker.on('changeColor', function(e) {
    colors[idx]=hex2rgb(e.color.toHex());
    addColorToPalette(idx);

    // todo:  better way to update color of existing blocks
    scene.children
         .filter(function(el) { return el.isVoxel })
         .map(function(mesh) { scene.remove(mesh.wireMesh); scene.remove(mesh) });
    var frameMask = 'A';
    if (currentFrame != 0) frameMask = 'A' + currentFrame;
    helper.buildFromHash(frameMask);
  });
  picker.on('hide', function(e) {
    // todo:  add a better remove for the colorpicker.
    picker.unbind('click.colorpicker');
  });
}

function changeColor(e) {
  var target = $(e.currentTarget);
  var idx = +target.find('.color').attr('data-color');
  updateColor(idx);
  return false; // eat the event
}

function pickColor(e) {
  var target = $(e.currentTarget);
  var idx = +target.find('.color').attr('data-color');

  color = idx;
  brush.children[0].material.color.setRGB(colors[idx][0], colors[idx][1], colors[idx][2]);
}

// skips every fourth byte when encoding images,
// i.e. leave the alpha channel
// alone and only change RGB
function pickRGB(idx) {
  return idx + (idx/3) | 0
}

module.exports = {

  v2h: v2h,
  rgb2hex: rgb2hex,
  hex2rgb: hex2rgb,

  addColorToPalette: addColorToPalette,

  addColor: addColor,
  updateColor: updateColor,
  changeColor: changeColor,
  pickColor: pickColor,

  pickRGB: pickRGB

};

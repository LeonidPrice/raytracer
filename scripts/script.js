var canvas = document.getElementById('canvas');

// canvas.height = document.documentElement.scrollHeight;
// canvas.width = document.documentElement.scrollWidth;

var context = canvas.getContext('2d');
var buffer = context.getImageData(0, 0, canvas.width, canvas.height);
var step = buffer.width * 4;

var viewport_size = 1;
var projection_plane_z = 1;
var camera_position = [0,0,0];
var background_color = [0, 0, 0, 255];

function put_pixel(x, y, color) {
    var xr = Math.round(canvas.width / 2 + x);
    var yr = Math.round(canvas.height / 2 - y - 1);
    var offset = 4 * xr + step * yr;

    buffer.data[offset++] = color[0];
    buffer.data[offset++] = color[1];
    buffer.data[offset++] = color[2];
    buffer.data[offset++] = color[3] || 255;

    if (x < 0 ||  y < 0 || x >= canvas.width || y >= canvas.height) {
        return;
    }
}

function update_canvas() {
    context.putImageData(buffer, 0, 0);
}
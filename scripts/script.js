var canvas = document.getElementById('canvas');

canvas.width = document.documentElement.scrollWidth;
canvas.height = document.documentElement.scrollHeight;

var context = canvas.getContext('2d');
var buffer = context.getImageData(0, 0, canvas.width, canvas.height);
var step = buffer.width * 4;

var viewport_width = canvas.width / canvas.height;    // window width to height ratio
var viewport_height = 1;
var projection_plane_z = 1;
var camera_position = [0, 0, 0];
var background_color = [0, 0, 0, 255];

var sphere = function(center, radius, color) {
    this.center = center;
    this.radius = radius;
    this.color = color;
}

var spheres = [
    new sphere([0, -1, 3], 1, [255, 0, 0, 255]),
    new sphere([2, 0, 4], 1, [0, 0, 255, 255]),
    new sphere([-2, 0, 4], 1, [0, 255, 0, 255])
];

/**
 * Inserts a pixel of the desired color into the canvas
 * @param {number} x - coordinate x on the canvas
 * @param {number} y - coordinate y on the canvas
 * @param {number[]} color - [R, G, B, A] or [R, G, B] for full opacity
 */
var put_pixel = function(x, y, color) {
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

var update_canvas = function() {
    context.putImageData(buffer, 0, 0);
}

/**
 * @param {number[]} v1 - vector in format [vx, vy] or [vx, vy, vz]
 * @param {number[]} v2 - vector in format [vx, vy] or [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy] or [vx, vy, vz]
 */
var vectors_subtraction = function(v1, v2) {
    if (v1 && v2) {
        if (v1.length == 2 && v2.length == 2) {
            return [v1[0] - v2[0], v1[1] - v2[1]];
        } else if (v1.length == 3 && v2.length == 3) {
            return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
        } else {
            let error = "Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

/**
 * @param {number[]} v1 - vector in format [vx, vy] or [vx, vy, vz]
 * @param {number[]} v2 - vector in format [vx, vy] or [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy] or [vx, vy, vz]
 */
var scalar_product = function(v1, v2) {
    if (v1 && v2) {
        if (v1.length == 2 && v2.length == 2) {
            return [v1[0]*v2[0] + v1[1]*v2[1]];
        } else if (v1.length == 3 && v2.length == 3) {
            return [v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]];
        } else {
            var error = "Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

/**
 * Converts canvas pixel coordinates into viewport coordinates
 * @param {number[]} canvas_point - pixel coordinates on the canvas [x, y]
 * @returns {number[]} coordinates on the viewport [x, y, z]
 */
var canvas_to_viewport = function(canvas_point) {
    return[
        canvas_point[0] * viewport_width / canvas.width,  
        canvas_point[1] * viewport_height / canvas.height,
        projection_plane_z                                
    ];
}

/**
 * Solves a quadratic equation to determine the intersection of the ray and the sphere
 * @param {number[]} origin - camera position [x, y, z]
 * @param {number[]} direction - viewport coordinates [x, y, z]
 * @param {Object[]} sphere - coordinates of center [x, y, z], her radius and color [R, G, B, A] or [R, G, B]
 * @param {number[]} sphere[].center - sphere center coordinates [x, y, z]
 * @param {number} sphere[].radius - positive number
 * @param {number[]} sphere[.color] - [R, G, B, A] or [R, G, B] for full opacity
 * @returns {number[]} returns the roots of the quadratic equation [t1, t2]
 */
var intersect_ray_sphere = function(origin, direction, sphere) {
    var co = vectors_subtraction(origin, sphere.center);

    var a = scalar_product(direction, direction);
    var b = 2 * scalar_product(co, direction);
    var c = scalar_product(co, co) - sphere.radius*sphere.radius;

    var discriminant = b**2 - 4*a*c;

    var t1 = (-b + Math.sqrt(discriminant)) / (2*a);
    var t2 = (-b - Math.sqrt(discriminant)) / (2*a);

    if (discriminant < 0) {
        return [Infinity, Infinity];
    } else {
        return [t1, t2];
    }
}

/**
 * Calculates the intersections of the ray with each sphere and returns her color at the closest intersection in the requested range from t_min till t_max
 * @param {number[]} origin - camera position [x, y, z] 
 * @param {number[]} direction - viewport coordinates [x, y, z]
 * @param {number} t_min - start of the ray
 * @param {number} t_max - end of the ray
 * @returns {number[]} [R, G, B, A]
 */
var trace_ray = function(origin, direction, t_min, t_max) {
    var closest_t = Infinity;
    var closest_sphere = null;

    for (var i = 0; i < spheres.length; i++) {
        var t12 = intersect_ray_sphere(origin, direction, spheres[i]);
        if (t_min < t12[0] && t12[0] < t_max && t12[0] < closest_t) {
            closest_t = t12[0];
            closest_sphere = spheres[i];
        }
        if (t_min < t12[1] && t12[1] < t_max && t12[1] < closest_t) {
            closest_t = t12[1];
            closest_sphere = spheres[i];
        }
    }

    if (closest_sphere == null) {
        return background_color;
    } else {
        return closest_sphere.color;
    }
}

for (var x = -canvas.width / 2; x < canvas.width / 2; x++) {
    for (var y = -canvas.height / 2; y < canvas.height / 2; y++) {
        var direction = canvas_to_viewport([x, y]);
        var color = trace_ray(camera_position, direction, 1, Infinity);
        put_pixel(x, y, color);
    }
}

update_canvas()

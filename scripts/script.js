var canvas = document.getElementById('canvas');

canvas.width = document.documentElement.scrollWidth;
canvas.height = document.documentElement.scrollHeight;

var context = canvas.getContext('2d');
var buffer = context.getImageData(0, 0, canvas.width, canvas.height);
var step = buffer.width * 4;

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
var scalar_product = function(v1, v2) {
    if (v1 && v2) {
        if (v1.length == 2 && v2.length == 2) {
            return [v1[0]*v2[0] + v1[1]*v2[1]];
        } else if (v1.length == 3 && v2.length == 3) {
            return [v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]];
        } else {
            var error = "ERROR: Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

/**
 * @param {number[]} vector - vector in format [vx, vy] or [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy] or [vx, vy, vz]
 */
var vector_lenght = function(vector) {
    if (vector) {
        return Math.sqrt(scalar_product(vector, vector));
    } else {
        let error = "ERROR: Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
        return error;
    }
}

/**
 * @param {number} n - any number
 * @param {number[]} v - vector in format [vx, vy] or [vx, vy, vz]
 * @returns 
 */
var vector_multiply_number = function(n, v) {
    if (v && n) {
        if (v.length == 2) {
            return [n*v[0], n*v[1]];
        } else if (v.length == 3) {
            return [n*v[0], n*v[1], n*v[2]];
        } else {
            var error = "ERROR: Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

/**
 * @param {number[]} v1 - vector in format [vx, vy] or [vx, vy, vz]
 * @param {number[]} v2 - vector in format [vx, vy] or [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy] or [vx, vy, vz]
 */
var vectors_addition = function(v1, v2) {
    if (v1 && v2) {
        if (v1.length == 2 && v2.length == 2) {
            return [v1[0] + v2[0], v1[1] + v2[1]];
        } else if (v1.length == 3 && v2.length == 3) {
            return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
        } else {
            let error = "ERROR: Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
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
            let error = "ERROR: Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

/**
 * Sets the color in the range 0-255
 * @param {number[]} vector - vector in format [R, G, B] or [R, G, B, A]
 * @returns {number[]} [R, G, B, A] in canonic form from 0 to 255
 */
var clamp_color = function(vector) {
    if (vector) {
        return [Math.min(255, Math.max(0, vector[0])),
            Math.min(255, Math.max(0, vector[1])),
            Math.min(255, Math.max(0, vector[2])),
            Math.min(255, Math.max(0, vector[3]))];
    } else {
        var error = "ERROR: Parameters must be of the form v = [R, G, B]";
        return error;
    }
}

var SPHERE = function(center, radius, color) {
    this.center = center;
    this.radius = radius;
    this.color = color;
}

var LIGHT = function(light_type, intensity, position) {
    this.light_type = light_type;
    this.intensity = intensity;
    this.position = position;
}

LIGHT.AMBIENT = 0;
LIGHT.POINT = 1;
LIGHT.DIRECTIONAL = 2;

var viewport_width = canvas.width / canvas.height;    // window width to height ratio
var viewport_height = 1;
var projection_plane_z = 1;
var camera_position = [0, -0.25, -01];
var background_color = [0, 0, 0, 255];
var spheres = [
    new SPHERE([0, -1, 3], 1, [255, 0, 0]),
    new SPHERE([2, 0, 4], 1, [0, 0, 255]),
    new SPHERE([-2, 0, 4], 1, [0, 255, 0]),
    // new SPHERE([0, -5001.5, 0], 5000, [255, 255, 0])
];
var lights = [
    new LIGHT(LIGHT.AMBIENT, 0.2),
    new LIGHT(LIGHT.POINT, 0.6, [2, 1, 0]),
    new LIGHT(LIGHT.DIRECTIONAL, 0.2, [1, 4, 4])
];

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

    var discriminant = b*b - 4*a*c;

    if (discriminant < 0) {
        return [Infinity, Infinity];
    }

    var t1 = (-b + Math.sqrt(discriminant)) / (2*a);
    var t2 = (-b - Math.sqrt(discriminant)) / (2*a);

    return [t1, t2];
}

/**
 * Calculates the intensity of light in the scene and the length of the light vector
 * @param {number[]} point coordinates of the 3d point [x,y,z]
 * @param {number[]} normal coordinates of the normal vector [x,y,z]
 * @returns {number} value of the intensity
 */
var compute_lighting = function(point, normal) {
    var intensity = 0;
    var length_normal = vector_lenght(normal);

    for (var i = 0; i < lights.length; i++) {
        var light = lights[i];
        if (light.light_type == LIGHT.AMBIENT) {
            intensity += light.intensity;
        } else {
            var light_vector;
            if (light.light_type == LIGHT.POINT) {
                light_vector = vectors_subtraction(light.position, point);
            } else {
                // light is directional
                light_vector = light.position;
            }

            var normal_dot_lenght = scalar_product(normal, light_vector);
            if (normal_dot_lenght > 0) {
                intensity += light.intensity * normal_dot_lenght / (length_normal * vector_lenght(light_vector));
            }
        }
    }
    return intensity;
}

/**
 * Calculates the intersections of the ray with each sphere and returns her color at the closest intersection in the requested range from t_min till t_max.
 * Color in format [R, G, B] without alpha channel!
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
    }

    var point = vectors_addition(origin, vector_multiply_number(closest_t, direction));
    var normal = vectors_subtraction(point, closest_sphere.center);
    normal = vector_multiply_number((1.0 / vector_lenght(normal)), normal);

    return vector_multiply_number(compute_lighting(point, normal), closest_sphere.color);
}

for (var x = -canvas.width / 2; x < canvas.width / 2; x++) {
    for (var y = -canvas.height / 2; y < canvas.height / 2; y++) {
        var direction = canvas_to_viewport([x, y]);
        var color = trace_ray(camera_position, direction, 1, Infinity);
        put_pixel(x, y, clamp_color(color));
    }
}

update_canvas();

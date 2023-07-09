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

    if (xr < 0 ||  yr < 0 || xr >= canvas.width || yr >= canvas.height) {
        return;
    }

    buffer.data[offset++] = color[0];
    buffer.data[offset++] = color[1];
    buffer.data[offset++] = color[2];
    buffer.data[offset++] = color[3] || 255;
}

var update_canvas = function() {
    context.putImageData(buffer, 0, 0);
}

var clear_canvas = function() {
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight; 
}

// Emulation of an infinitesimal real number
var EPSILON = 0.001;

/**
 * @param {number[]} v1 vector in format [vx, vy, vz]
 * @param {number[]} v2 vector in format [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy, vz]
 */
var scalar_product = function(v1, v2) {
    return [v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]];
}

/**
 * @param {number[]} vector vector in format [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy, vz]
 */
var vector_length = function(vector) {
    return Math.sqrt(scalar_product(vector, vector));
}

/**
 * @param {number} n any number
 * @param {number[]} v vector in format [vx, vy, vz]
 * @returns vector in format [vx, vy, vz]
 */
var vector_multiply_number = function(n, v) {
    return [n*v[0], n*v[1], n*v[2]];
}

/**
 * @param {number[]} v1 vector in format [vx, vy, vz]
 * @param {number[]} v2 vector in format [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy, vz]
 */
var vectors_addition = function(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];  
}

/**
 * @param {number[]} v1 vector in format [vx, vy, vz]
 * @param {number[]} v2 vector in format [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy, vz]
 */
var vectors_subtraction = function(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

/**
 * Sets the color in the range 0-255
 * @param {number[]} vector vector in format [R, G, B] or [R, G, B, A]
 * @returns {number[]} [R, G, B, A] in canonic form from 0 to 255
 */
var clamp_color = function(vector) {
    return [Math.min(255, Math.max(0, vector[0])),
            Math.min(255, Math.max(0, vector[1])),
            Math.min(255, Math.max(0, vector[2])),
            Math.min(255, Math.max(0, vector[3]))];
}

/**
 * Computes the reflections of vector 1 respect vector 2
 * @param {number[]} v1 vector in format [vx, vy, vz]
 * @param {number[]} v2 vector in format [vx, vy, vz]
 * @returns {number[]} vector in format [vx, vy, vz]
 */
var reflect_ray = function(v1, v2) {
    return vectors_subtraction(vector_multiply_number(2*scalar_product(v1, v2), v2), v1);
}

var SPHERE = function(center, radius, color, specular, reflective) {
    this.center = center;
    this.radius = radius;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
}

var LIGHT = function(light_type, intensity, position) {
    this.light_type = light_type;
    this.intensity = intensity;
    this.position = position;
}

LIGHT.AMBIENT = 0;
LIGHT.POINT = 1;
LIGHT.DIRECTIONAL = 2;

var viewport_ratio = canvas.width / canvas.height;
var viewport_height = 1;
var projection_plane_z = 1;
var camera_position = [0, -0.25, -1];
var background_color = [0, 0, 0];
var spheres = [
    new SPHERE([0, -1, 3], 1, [255, 0, 0], 500, 0.3),
    new SPHERE([-2, 0, 4], 1, [0, 255, 0], 10, 0.4),
    new SPHERE([2, 0, 4], 1, [0, 0, 255], 500, 0.3),
    new SPHERE([0, -32, 0], 30, [255, 255, 0], 1000, 0.5)
];
var lights = [
    new LIGHT(LIGHT.AMBIENT, 0.2),
    new LIGHT(LIGHT.POINT, 0.6, [2, 1, 0]),
    new LIGHT(LIGHT.DIRECTIONAL, 0.2, [1, 4, 4])
];

var recursion_depth = 3;

var update_recursion_depth = function() {
    var v = document.getElementById('recursion_depth_value').value | 0;

    if (v < 0) {
        v = 0;
    } 
    if (v > 5) {
        v = 5;
    }

    document.getElementById('recursion_depth_value').value = v;

    if (recursion_depth != v) {
        recursion_depth = v;
        render();
    }
}

/** 
 * Converts canvas pixel coordinates into viewport coordinates
 * @param {number[]} canvas_point - pixel coordinates on the canvas [x, y]
 * @returns {number[]} coordinates on the viewport [x, y, z]
 */
var canvas_to_viewport = function(canvas_point) {
    return[
        canvas_point[0] * viewport_ratio / canvas.width,  
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
    var oc = vectors_subtraction(origin, sphere.center);

    var a = scalar_product(direction, direction);
    var b = 2 * scalar_product(oc, direction);
    var c = scalar_product(oc, oc) - sphere.radius*sphere.radius;

    var discriminant = b*b - 4*a*c;

    if (discriminant < 0) {
        return [Infinity, Infinity];
    }

    var t1 = (-b + discriminant**(0.5)) / (2*a);
    var t2 = (-b - discriminant**(0.5)) / (2*a);

    return [t1, t2];
}

/**
 * Calculates the intensity of light in the scene and the length of the light vector
 * @param {number[]} point coordinates of the 3d point [x,y,z]
 * @param {number[]} normal coordinates of the normal vector [x,y,z]
 * @param {number[]} view position of the camera [x,y,z]
 * @param {number} specular value of the specular reflection
 * @returns {number} value of the intensity
 */
var compute_lighting = function(point, normal, view, specular) {
    var intensity = 0;
    var length_normal = vector_length(normal);
    var length_view = vector_length(view);

    for (var i = 0; i < lights.length; i++) {
        var light = lights[i];
        if (light.light_type == LIGHT.AMBIENT) {
            intensity += light.intensity;
        } else {
            var light_vector, t_max;
            if (light.light_type == LIGHT.POINT) {
                light_vector = vectors_subtraction(light.position, point);
                t_max = 1.0;
            } else {
                // light is directional
                light_vector = light.position;
                t_max = Infinity;
            }

            var blocker = closest_intersection(point, light_vector, EPSILON, t_max);
            if (blocker) {
                continue;
            }

            // diffusion reflection
            var normal_dot_light = scalar_product(normal, light_vector);
            if (normal_dot_light > 0) {
                intensity += light.intensity * normal_dot_light / (length_normal * vector_length(light_vector));
            }

            // specular reflection
            if (specular != -1) {
                var reflection_vector = reflect_ray(light_vector, normal);
                var reflection_dot_view = scalar_product(reflection_vector, view);
                if (reflection_dot_view > 0) {
                    intensity += light.intensity * Math.pow(reflection_dot_view / (vector_length(reflection_vector) * length_view), specular);
                }
            }
        }
    }
    return intensity;
}

/**
 * Calculates the closest intersection of the sphere with the ray for shadow rendering
 * @param {number[]} origin - camera position [x, y, z]
 * @param {number[]} direction - viewport coordinates [x, y, z]
 * @param {number} t_min - point of intersection with sphere
 * @param {number} t_max - point of intersection with sphere 
 * @returns {[]} [closest_sphere, closest_t]
 */
var closest_intersection = function(origin, direction, t_min, t_max) {
    var closest_t = Infinity;
    var closest_sphere = null;

    for (var i = 0; i < spheres.length; i++) {
        var t12 = intersect_ray_sphere(origin, direction, spheres[i]);
        if (t12[0] < closest_t && t12[0] < t_max && t_min < t12[0]) {
            closest_t = t12[0];
            closest_sphere = spheres[i];
        }
        if (t12[1] < closest_t && t12[1] < t_max && t_min < t12[1]) {
            closest_t = t12[1];
            closest_sphere = spheres[i];
        }
    }

    if (closest_sphere) {
        return [closest_sphere, closest_t];
    }

    return null;
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
var trace_ray = function(origin, direction, t_min, t_max, depth) {
    var intersection = closest_intersection(origin, direction, t_min, t_max);

    if (!intersection) {
        return background_color;
    }

    var closest_sphere = intersection[0];
    var closest_t = intersection[1];

    var point = vectors_addition(origin, vector_multiply_number(closest_t, direction));
    var normal = vectors_subtraction(point, closest_sphere.center);
    normal = vector_multiply_number(1.0 / vector_length(normal), normal);

    var view = vector_multiply_number(-1, direction);
    var lighting = compute_lighting(point, normal, view, closest_sphere.specular);
    var local_color = vector_multiply_number(lighting, closest_sphere.color);

    if (closest_sphere.reflective <=0 || depth <= 0) {
        return local_color;
    }

    var reflected_rey = reflect_ray(view, normal);
    var reflected_color = trace_ray(point, reflected_rey, EPSILON, Infinity, depth - 1);

    return vectors_addition(vector_multiply_number(1 - closest_sphere.reflective, local_color),vector_multiply_number(closest_sphere.reflective, reflected_color));
}

var render = function() {
    clear_canvas();

    setTimeout( function() {
        // main loop
        for (var x = -canvas.width / 2; x < canvas.width / 2; x++) {
            for (var y = -canvas.height / 2; y < canvas.height / 2; y++) {
                var direction = canvas_to_viewport([x, y]);
                var color = trace_ray(camera_position, direction, 1, Infinity, recursion_depth);
                put_pixel(x, y, clamp_color(color));
            }
        }
        update_canvas();
    }, 0);
}

render();
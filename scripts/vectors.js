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
 * Calculate length of the vector
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
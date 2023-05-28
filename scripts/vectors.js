
function vectors_addition(v1, v2) {
    if (v1 && v2) {
        if (v1.length == 2 && v2.length == 2) {
            return [v1[0] + v2[0], v1[1] + v2[1]];
        } else if (v1.length == 3 && v2.length == 3) {
            return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
        } else {
            let error = "Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

function vectors_subtraction(v1, v2) {
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

function vector_number_product(v, n) {
    if (v && n) {
        if (v.length == 2) {
            [v[0] * n, v[1] * n];
        } else if (v.length == 3) {
            return [v[0] * n, v[1] * n, v[2] * n];
        } else {
            var error = "Parameters must be of the form v = [vx, vy] or v = [vx, vy, vz]";
            return error;
        }
    }
}

function vector_product(v1, v2) {
    if (v1 && v2) {
        if (v1.length == 3 && v2.length == 3) {
            var cx = 1 * (v1[1] * v2[2] - v2[1] * v1[2]);
            var cy = -1 * (v1[0] * v2[2] - v2[0] * v1[2]);
            var cz = 1 * (v1[0] * v2[1] - v2[0] * v1[1]);
            return [cx, cy, cz];
        } else {
            var error = "Parameters must be of the form v = [vx, vy, vz]";
            return error;
        }
    }
}

function scalar_product(v1, v2) {
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

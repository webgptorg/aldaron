/**
 * Traces the cover artwork of AI ta Krajta into the shapes and the body measurements which
 * `businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.ts` is written from.
 *
 * It reads the colours of the cover apart into the parts the drawing is painted with, fits a curve and a gradient to
 * each of them, and then walks the middle of the animal from its nose to the tip of its tail measuring how thick and
 * what colour it is along the way. The result is printed as TypeScript, to be pasted into that module; nothing here
 * runs at build time. `aiTaKrajtaMarkArtwork.test.ts` is what keeps the pasted numbers honest.
 *
 * Run with `node scripts/_traceAiTaKrajtaMark.mjs`.
 */
import sharp from 'sharp';

const SOURCE = 'public/pavol/media/ai-ta-krajta.jpg';
const VIEW_BOX_SIZE = 128;
const BACKGROUND = [53, 60, 53];
const SEAM_OVERLAP_IN_PIXELS = 3;

/**
 * How far apart the printed points of the centre line are, in units of the view box
 */
const BODY_POINT_DISTANCE = 2.4;

/**
 * How long the run into the tip of the tail is and how thick the animal still is there
 *
 * Note: The medial axis of a shape which lies on itself cannot see the point of the tail, so the last stretch is run
 *       out by hand to where the drawing ends it.
 */
const TAIL_TAPER_LENGTH = 26;
const TAIL_TIP_HALF_WIDTH = 0.6;

/**
 * How many walked points are dropped at the nose, where the centre line runs past the end of the drawn head
 */
const HEAD_TRIM_POINT_COUNT = 8;

/**
 * The order the parts of the drawing are painted in, and what each of them is called
 */
const DRAWING_ORDER = [
    { region: 2, id: 'tail' },
    { region: 1, id: 'coil' },
    { region: 0, id: 'body' },
];

async function loadPixels(blurSigma) {
    const pipeline = sharp(SOURCE);
    const { data, info } = await (blurSigma === undefined ? pipeline : pipeline.blur(blurSigma))
        .raw()
        .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, channels: info.channels };
}

function colorAt(image, x, y) {
    const offset = (y * image.width + x) * image.channels;
    return [image.data[offset], image.data[offset + 1], image.data[offset + 2]];
}

function colorDistance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function buildSnakeMask(image) {
    const { width, height } = image;
    const mask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = colorAt(image, x, y);
            const isBackground = colorDistance(color, BACKGROUND) <= 45;
            const isWhite = color[0] > 200 && color[1] > 200 && color[2] > 200;
            mask[y * width + x] = isBackground || isWhite ? 0 : 1;
        }
    }
    return mask;
}

function buildSeedMask(image, snakeMask) {
    const { width, height } = image;
    const seeds = new Uint8Array(width * height);
    for (let y = 3; y < height - 3; y++) {
        for (let x = 3; x < width - 3; x++) {
            const index = y * width + x;
            if (snakeMask[index] === 0) continue;
            const here = colorAt(image, x, y);
            let strongest = 0;
            for (const [dx, dy] of [
                [3, 0],
                [-3, 0],
                [0, 3],
                [0, -3],
            ]) {
                strongest = Math.max(strongest, colorDistance(here, colorAt(image, x + dx, y + dy)));
            }
            seeds[index] = strongest < 16 ? 1 : 0;
        }
    }
    return seeds;
}

function labelComponents(mask, width, height) {
    const labels = new Int32Array(width * height).fill(-1);
    const components = [];
    const queue = new Int32Array(width * height);
    for (let start = 0; start < mask.length; start++) {
        if (mask[start] === 0 || labels[start] !== -1) continue;
        const label = components.length;
        let head = 0;
        let tail = 0;
        queue[tail++] = start;
        labels[start] = label;
        const pixels = [];
        while (head < tail) {
            const index = queue[head++];
            pixels.push(index);
            const x = index % width;
            const y = (index - x) / width;
            for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ]) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                const neighbour = ny * width + nx;
                if (mask[neighbour] === 0 || labels[neighbour] !== -1) continue;
                labels[neighbour] = label;
                queue[tail++] = neighbour;
            }
        }
        components.push(pixels);
    }
    return { labels, components };
}

/**
 * Grows the seed regions over every snake pixel, so that edges and antialiasing join the region they touch
 */
function growRegions(seedLabels, snakeMask, width, height, keptLabels) {
    const labels = new Int32Array(width * height).fill(-1);
    const queue = [];
    for (let index = 0; index < labels.length; index++) {
        const label = keptLabels.indexOf(seedLabels[index]);
        if (seedLabels[index] >= 0 && label >= 0) {
            labels[index] = label;
            queue.push(index);
        }
    }
    let head = 0;
    while (head < queue.length) {
        const index = queue[head++];
        const x = index % width;
        const y = (index - x) / width;
        for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const neighbour = ny * width + nx;
            if (snakeMask[neighbour] === 0 || labels[neighbour] !== -1) continue;
            labels[neighbour] = labels[index];
            queue.push(neighbour);
        }
    }
    return labels;
}

/**
 * Walks the outside of a region clockwise, one pixel at a time
 */
function traceRegionContour(isInside, width, height) {
    let startX = -1;
    let startY = -1;
    outer: for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isInside(x, y)) {
                startX = x;
                startY = y;
                break outer;
            }
        }
    }
    if (startX < 0) return [];

    const neighbours = [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
    ];
    const contour = [[startX, startY]];
    let currentX = startX;
    let currentY = startY;
    let entryDirection = 6;
    for (let step = 0; step < width * height * 4; step++) {
        let moved = false;
        for (let turn = 0; turn < 8; turn++) {
            const direction = (entryDirection + 6 + turn) % 8;
            const [dx, dy] = neighbours[direction];
            const nx = currentX + dx;
            const ny = currentY + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || !isInside(nx, ny)) continue;
            currentX = nx;
            currentY = ny;
            entryDirection = direction;
            contour.push([currentX, currentY]);
            moved = true;
            break;
        }
        if (!moved) break;
        if (currentX === startX && currentY === startY) break;
    }
    contour.pop();
    return contour;
}

/**
 * Pushes the parts of a contour which are hidden under another shape outwards, so no background shows through a seam
 */
function overlapSeams(contour, isInside, isSnake, width, height) {
    const count = contour.length;
    return contour.map((point, index) => {
        const [x, y] = point;
        const before = contour[(index - 6 + count) % count];
        const after = contour[(index + 6) % count];
        const tangentX = after[0] - before[0];
        const tangentY = after[1] - before[1];
        const tangentLength = Math.hypot(tangentX, tangentY) || 1;
        let normalX = tangentY / tangentLength;
        let normalY = -tangentX / tangentLength;
        if (isInside(Math.round(x + normalX * 2), Math.round(y + normalY * 2))) {
            normalX = -normalX;
            normalY = -normalY;
        }
        const outsideX = Math.round(x + normalX * 2);
        const outsideY = Math.round(y + normalY * 2);
        const isOutsideOnSnake =
            outsideX >= 0 &&
            outsideY >= 0 &&
            outsideX < width &&
            outsideY < height &&
            isSnake(outsideX, outsideY);
        if (!isOutsideOnSnake) return [x, y];
        return [x + normalX * SEAM_OVERLAP_IN_PIXELS, y + normalY * SEAM_OVERLAP_IN_PIXELS];
    });
}

function smoothClosedPolyline(points, radius) {
    const count = points.length;
    return points.map((_, index) => {
        let sumX = 0;
        let sumY = 0;
        for (let offset = -radius; offset <= radius; offset++) {
            const point = points[(index + offset + count * 2) % count];
            sumX += point[0];
            sumY += point[1];
        }
        return [sumX / (radius * 2 + 1), sumY / (radius * 2 + 1)];
    });
}

function findCorners(points, lookAhead, thresholdInDegrees) {
    const count = points.length;
    const corners = [];
    for (let index = 0; index < count; index++) {
        const before = points[(index - lookAhead + count) % count];
        const here = points[index];
        const after = points[(index + lookAhead) % count];
        const angleBefore = Math.atan2(here[1] - before[1], here[0] - before[0]);
        const angleAfter = Math.atan2(after[1] - here[1], after[0] - here[0]);
        let turn = angleAfter - angleBefore;
        while (turn > Math.PI) turn -= Math.PI * 2;
        while (turn < -Math.PI) turn += Math.PI * 2;
        corners.push({ index, turn: Math.abs(turn) });
    }
    const threshold = (thresholdInDegrees * Math.PI) / 180;
    const picked = [];
    for (const candidate of corners) {
        if (candidate.turn < threshold) continue;
        const isLocalMaximum = corners
            .filter((other) => Math.abs(other.index - candidate.index) <= lookAhead)
            .every((other) => other.turn <= candidate.turn);
        if (isLocalMaximum && !picked.some((index) => Math.abs(index - candidate.index) <= lookAhead)) {
            picked.push(candidate.index);
        }
    }
    return picked.sort((a, b) => a - b);
}

// --- cubic fitting -------------------------------------------------------

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function scale(a, factor) {
    return [a[0] * factor, a[1] * factor];
}

function normalize(a) {
    const length = Math.hypot(a[0], a[1]) || 1;
    return [a[0] / length, a[1] / length];
}

function evaluateCubic(curve, t) {
    const u = 1 - t;
    return [
        u * u * u * curve[0][0] + 3 * u * u * t * curve[1][0] + 3 * u * t * t * curve[2][0] + t * t * t * curve[3][0],
        u * u * u * curve[0][1] + 3 * u * u * t * curve[1][1] + 3 * u * t * t * curve[2][1] + t * t * t * curve[3][1],
    ];
}

function chordLengthParameterize(points) {
    const parameters = [0];
    for (let index = 1; index < points.length; index++) {
        parameters.push(parameters[index - 1] + Math.hypot(...subtract(points[index], points[index - 1])));
    }
    const total = parameters[parameters.length - 1] || 1;
    return parameters.map((value) => value / total);
}

function generateBezier(points, parameters, leftTangent, rightTangent) {
    const first = points[0];
    const last = points[points.length - 1];
    let c00 = 0;
    let c01 = 0;
    let c11 = 0;
    let x0 = 0;
    let x1 = 0;
    for (let index = 0; index < points.length; index++) {
        const t = parameters[index];
        const u = 1 - t;
        const a = scale(leftTangent, 3 * u * u * t);
        const b = scale(rightTangent, 3 * u * t * t);
        c00 += a[0] * a[0] + a[1] * a[1];
        c01 += a[0] * b[0] + a[1] * b[1];
        c11 += b[0] * b[0] + b[1] * b[1];
        const target = subtract(points[index], [
            u * u * u * first[0] + 3 * u * u * t * first[0] + 3 * u * t * t * last[0] + t * t * t * last[0],
            u * u * u * first[1] + 3 * u * u * t * first[1] + 3 * u * t * t * last[1] + t * t * t * last[1],
        ]);
        x0 += a[0] * target[0] + a[1] * target[1];
        x1 += b[0] * target[0] + b[1] * target[1];
    }
    const determinant = c00 * c11 - c01 * c01;
    let alphaLeft = determinant === 0 ? 0 : (x0 * c11 - x1 * c01) / determinant;
    let alphaRight = determinant === 0 ? 0 : (c00 * x1 - c01 * x0) / determinant;
    const segmentLength = Math.hypot(...subtract(last, first));
    if (alphaLeft < 1e-6 || alphaRight < 1e-6) {
        alphaLeft = segmentLength / 3;
        alphaRight = segmentLength / 3;
    }
    return [first, add(first, scale(leftTangent, alphaLeft)), add(last, scale(rightTangent, alphaRight)), last];
}

function findMaximumError(points, curve, parameters) {
    let maximumError = 0;
    let splitIndex = Math.floor(points.length / 2);
    for (let index = 1; index < points.length - 1; index++) {
        const distance = Math.hypot(...subtract(evaluateCubic(curve, parameters[index]), points[index]));
        if (distance > maximumError) {
            maximumError = distance;
            splitIndex = index;
        }
    }
    return { maximumError, splitIndex };
}

function fitCubics(points, leftTangent, rightTangent, maximumAllowedError, depth = 0) {
    if (points.length < 3) {
        const distance = Math.hypot(...subtract(points[points.length - 1], points[0])) / 3;
        return [
            [
                points[0],
                add(points[0], scale(leftTangent, distance)),
                add(points[points.length - 1], scale(rightTangent, distance)),
                points[points.length - 1],
            ],
        ];
    }
    const parameters = chordLengthParameterize(points);
    const curve = generateBezier(points, parameters, leftTangent, rightTangent);
    const { maximumError, splitIndex } = findMaximumError(points, curve, parameters);
    if (maximumError <= maximumAllowedError || depth > 24) return [curve];
    const centerTangent = normalize(subtract(points[splitIndex - 1], points[splitIndex + 1]));
    return [
        ...fitCubics(points.slice(0, splitIndex + 1), leftTangent, centerTangent, maximumAllowedError, depth + 1),
        ...fitCubics(
            points.slice(splitIndex),
            scale(centerTangent, -1),
            rightTangent,
            maximumAllowedError,
            depth + 1,
        ),
    ];
}

function fitClosedContour(points, cornerIndices, maximumAllowedError) {
    const count = points.length;
    const breaks = cornerIndices.length > 0 ? cornerIndices : [0];
    const curves = [];
    for (let breakIndex = 0; breakIndex < breaks.length; breakIndex++) {
        const from = breaks[breakIndex];
        const to = breaks[(breakIndex + 1) % breaks.length];
        const segment = [];
        for (let index = from; ; index = (index + 1) % count) {
            segment.push(points[index]);
            if (index === to) break;
        }
        if (segment.length < 2) continue;
        const leftTangent = normalize(subtract(segment[Math.min(4, segment.length - 1)], segment[0]));
        const rightTangent = normalize(
            subtract(
                segment[Math.max(0, segment.length - 1 - 4)],
                segment[segment.length - 1],
            ),
        );
        curves.push(...fitCubics(segment, leftTangent, rightTangent, maximumAllowedError));
    }
    return curves;
}

// --- gradients -----------------------------------------------------------

/**
 * Keeps only the pixels a few steps away from any border, where no antialiasing pollutes the colour
 */
function erodeRegion(pixelIndices, regionLabels, region, width, height, radius) {
    const isInside = (x, y) =>
        x >= 0 && y >= 0 && x < width && y < height && regionLabels[y * width + x] === region;
    return pixelIndices.filter((index) => {
        const x = index % width;
        const y = (index - x) / width;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (!isInside(x + dx, y + dy)) return false;
            }
        }
        return true;
    });
}

function fitGradient(image, pixelIndices, width) {
    let directionX = 0;
    let directionY = 0;
    const scalarAt = (x, y) => {
        const color = colorAt(image, x, y);
        return color[0] - color[2];
    };
    for (const index of pixelIndices) {
        const x = index % width;
        const y = (index - x) / width;
        if (x < 4 || y < 4 || x >= image.width - 4 || y >= image.height - 4) continue;
        const dx = scalarAt(x + 3, y) - scalarAt(x - 3, y);
        const dy = scalarAt(x, y + 3) - scalarAt(x, y - 3);
        const magnitude = Math.hypot(dx, dy);
        if (magnitude < 1.2) continue;
        directionX += dx / magnitude;
        directionY += dy / magnitude;
    }
    const axis = normalize([directionX, directionY]);
    let minimum = Infinity;
    let maximum = -Infinity;
    for (const index of pixelIndices) {
        const x = index % width;
        const y = (index - x) / width;
        const projection = x * axis[0] + y * axis[1];
        minimum = Math.min(minimum, projection);
        maximum = Math.max(maximum, projection);
    }
    const binCount = 40;
    const sums = Array.from({ length: binCount }, () => [0, 0, 0, 0]);
    for (const index of pixelIndices) {
        const x = index % width;
        const y = (index - x) / width;
        if (x < 3 || y < 3 || x >= image.width - 3 || y >= image.height - 3) continue;
        const projection = x * axis[0] + y * axis[1];
        const bin = Math.min(binCount - 1, Math.floor(((projection - minimum) / (maximum - minimum)) * binCount));
        const color = colorAt(image, x, y);
        sums[bin][0] += color[0];
        sums[bin][1] += color[1];
        sums[bin][2] += color[2];
        sums[bin][3] += 1;
    }
    const ramp = sums
        .map((sum, bin) => ({
            offset: (bin + 0.5) / binCount,
            color: sum[3] === 0 ? null : [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]],
        }))
        .filter((entry) => entry.color !== null);

    // The scalar direction points from blue to red, the gradient is written from red to blue
    return {
        // Written back in image pixels, converted by the caller
        from: [
            axis[0] * (minimum - (maximum - minimum) * 0) ,
            axis[1] * (minimum - (maximum - minimum) * 0),
        ],
        axis,
        minimum,
        maximum,
        ramp,
    };
}

function simplifyRamp(ramp, tolerance) {
    const kept = [0, ramp.length - 1];
    let changed = true;
    while (changed) {
        changed = false;
        const sorted = [...kept].sort((a, b) => a - b);
        for (let index = 0; index < sorted.length - 1; index++) {
            const from = sorted[index];
            const to = sorted[index + 1];
            let worst = -1;
            let worstError = 0;
            for (let between = from + 1; between < to; between++) {
                const ratio = (ramp[between].offset - ramp[from].offset) / (ramp[to].offset - ramp[from].offset);
                let error = 0;
                for (let channel = 0; channel < 3; channel++) {
                    const expected =
                        ramp[from].color[channel] + (ramp[to].color[channel] - ramp[from].color[channel]) * ratio;
                    error = Math.max(error, Math.abs(expected - ramp[between].color[channel]));
                }
                if (error > worstError) {
                    worstError = error;
                    worst = between;
                }
            }
            if (worstError > tolerance && worst >= 0) {
                kept.push(worst);
                changed = true;
            }
        }
    }
    return kept.sort((a, b) => a - b).map((index) => ramp[index]);
}

function toHex(color) {
    return (
        '#' +
        color
            .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
            .join('')
    );
}

// --- centre line ---------------------------------------------------------

function buildDistanceTransform(isInside, width, height) {
    const distance = new Float32Array(width * height).fill(Infinity);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            distance[y * width + x] = isInside(x, y) ? Infinity : 0;
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (distance[index] === 0) continue;
            let best = distance[index];
            if (x > 0) best = Math.min(best, distance[index - 1] + 1);
            if (y > 0) best = Math.min(best, distance[index - width] + 1);
            if (x > 0 && y > 0) best = Math.min(best, distance[index - width - 1] + Math.SQRT2);
            if (x < width - 1 && y > 0) best = Math.min(best, distance[index - width + 1] + Math.SQRT2);
            distance[index] = best;
        }
    }
    for (let y = height - 1; y >= 0; y--) {
        for (let x = width - 1; x >= 0; x--) {
            const index = y * width + x;
            if (distance[index] === 0) continue;
            let best = distance[index];
            if (x < width - 1) best = Math.min(best, distance[index + 1] + 1);
            if (y < height - 1) best = Math.min(best, distance[index + width] + 1);
            if (x < width - 1 && y < height - 1) best = Math.min(best, distance[index + width + 1] + Math.SQRT2);
            if (x > 0 && y < height - 1) best = Math.min(best, distance[index + width - 1] + Math.SQRT2);
            distance[index] = best;
        }
    }
    return distance;
}

function sampleDistance(distance, width, height, x, y) {
    const cx = Math.round(x);
    const cy = Math.round(y);
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) return 0;
    return distance[cy * width + cx];
}

/**
 * Follows the middle of a tube-shaped region, which is the line the living snake is later posed along
 */
function walkCenterLine(distance, width, height, start, direction, stepInPixels, maximumSteps) {
    const points = [[start[0], start[1]]];
    let position = [start[0], start[1]];
    let heading = normalize(direction);
    for (let step = 0; step < maximumSteps; step++) {
        const candidate = add(position, scale(heading, stepInPixels));
        const normal = [-heading[1], heading[0]];
        const searchRadius = Math.max(3, sampleDistance(distance, width, height, candidate[0], candidate[1]) * 0.9);
        let best = null;
        let bestDistance = -1;
        for (let offset = -searchRadius; offset <= searchRadius; offset += 0.5) {
            const point = add(candidate, scale(normal, offset));
            const value = sampleDistance(distance, width, height, point[0], point[1]);
            if (value > bestDistance) {
                bestDistance = value;
                best = point;
            }
        }
        if (best === null || bestDistance < 2.5) break;
        heading = normalize(add(scale(heading, 0.45), scale(normalize(subtract(best, position)), 0.55)));
        position = best;
        points.push([position[0], position[1]]);
    }
    return points;
}

// --- output --------------------------------------------------------------

function formatNumber(value) {
    return Number(value.toFixed(2)).toString();
}

function curvesToPathData(curves, toViewBox) {
    const start = toViewBox(curves[0][0]);
    let pathData = `M${formatNumber(start[0])} ${formatNumber(start[1])}`;
    for (const curve of curves) {
        const control1 = toViewBox(curve[1]);
        const control2 = toViewBox(curve[2]);
        const end = toViewBox(curve[3]);
        pathData +=
            `C${formatNumber(control1[0])} ${formatNumber(control1[1])}` +
            ` ${formatNumber(control2[0])} ${formatNumber(control2[1])}` +
            ` ${formatNumber(end[0])} ${formatNumber(end[1])}`;
    }
    return pathData + 'Z';
}

async function main() {
    const sharpImage = await loadPixels();
    const blurred = await loadPixels(1.2);
    const { width, height } = sharpImage;
    const toViewBox = (point) => [(point[0] * VIEW_BOX_SIZE) / width, (point[1] * VIEW_BOX_SIZE) / height];

    const snakeMask = buildSnakeMask(blurred);
    const seedMask = buildSeedMask(blurred, snakeMask);
    const { labels: seedLabels, components } = labelComponents(seedMask, width, height);
    const bigComponents = components
        .map((pixels, label) => ({ label, area: pixels.length, pixels }))
        .filter((component) => component.area > 1500)
        .sort((a, b) => b.area - a.area);
    const keptLabels = bigComponents.map((component) => component.label);
    const regionLabels = growRegions(seedLabels, snakeMask, width, height, keptLabels);

    const regionPixels = keptLabels.map(() => []);
    for (let index = 0; index < regionLabels.length; index++) {
        if (regionLabels[index] >= 0) regionPixels[regionLabels[index]].push(index);
    }

    const result = { regions: [] };
    for (let region = 0; region < regionPixels.length; region++) {
        const isInside = (x, y) =>
            x >= 0 && y >= 0 && x < width && y < height && regionLabels[y * width + x] === region;
        const isSnake = (x, y) => x >= 0 && y >= 0 && x < width && y < height && snakeMask[y * width + x] === 1;
        const rawContour = traceRegionContour(isInside, width, height);
        const overlapped = overlapSeams(rawContour, isInside, isSnake, width, height);
        const smoothed = smoothClosedPolyline(overlapped, 3);
        const corners = findCorners(smoothed, 9, 42);
        const curves = fitClosedContour(smoothed, corners, 1.4);
        const cleanPixels = erodeRegion(regionPixels[region], regionLabels, region, width, height, 4);
        const gradient = fitGradient(sharpImage, cleanPixels, width);
        const ramp = simplifyRamp(gradient.ramp, 3);
        result.regions.push({
            region,
            contourLength: rawContour.length,
            corners: corners.map((index) => smoothed[index].map((value) => Math.round(value))),
            curveCount: curves.length,
            pathData: curvesToPathData(curves, toViewBox),
            gradient: {
                axis: gradient.axis,
                start: toViewBox([gradient.axis[0] * gradient.minimum, gradient.axis[1] * gradient.minimum]),
                end: toViewBox([gradient.axis[0] * gradient.maximum, gradient.axis[1] * gradient.maximum]),
                stops: ramp.map((entry) => ({
                    offset: Number(
                        (
                            (entry.offset * (gradient.maximum - gradient.minimum)) /
                            (gradient.maximum - gradient.minimum)
                        ).toFixed(3),
                    ),
                    color: toHex(entry.color),
                })),
            },
        });
    }


    // The line the living snake is posed along, walked from the head through the coil out to the tip of the tail
    const isBody = (x, y) => x >= 0 && y >= 0 && x < width && y < height && regionLabels[y * width + x] === 0;
    const isLobe = (x, y) => x >= 0 && y >= 0 && x < width && y < height && regionLabels[y * width + x] === 1;
    const isTail = (x, y) => x >= 0 && y >= 0 && x < width && y < height && regionLabels[y * width + x] === 2;
    const isAnimal = (x, y) => x >= 0 && y >= 0 && x < width && y < height && snakeMask[y * width + x] === 1;

    const bodyDistance = buildDistanceTransform(isBody, width, height);
    const lobeDistance = buildDistanceTransform(isLobe, width, height);
    const tailDistance = buildDistanceTransform(isTail, width, height);
    const animalDistance = buildDistanceTransform(isAnimal, width, height);

    // The head is the widest place of the body above the coil
    let headCenter = [0, 0];
    let headRadius = 0;
    for (let y = 150; y < 330; y++) {
        for (let x = 400; x < 700; x++) {
            const value = bodyDistance[y * width + x];
            if (value > headRadius) {
                headRadius = value;
                headCenter = [x, y];
            }
        }
    }
    // The snout reaches past the middle of the head, so the line starts there rather than at the widest place
    const snoutLine = walkCenterLine(bodyDistance, width, height, headCenter, [1, 0.12], 6, 12);
    const bodyLine = [
        ...snoutLine.slice(1).reverse(),
        ...walkCenterLine(bodyDistance, width, height, headCenter, [-0.2, 1], 6, 400),
    ];
    const lobeStart = bodyLine[bodyLine.length - 1];
    const lobeSeed = [lobeStart[0] + 8, lobeStart[1] - 46];
    const lobeLine = walkCenterLine(lobeDistance, width, height, lobeSeed, [1, -0.15], 6, 400);

    let tailTip = [0, 0];
    for (let y = 600; y < 730; y++) {
        for (let x = 500; x < width; x++) {
            if (isTail(x, y) && x > tailTip[0]) tailTip = [x, y];
        }
    }
    const tailLine = walkCenterLine(tailDistance, width, height, tailTip, [-1, -0.2], 6, 400)
        .filter((point) => point[0] > 545)
        .reverse();

    const spine = [...bodyLine, ...lobeLine, ...tailLine];

    // Even spacing and a light smoothing, so the game can walk the line at its own step
    const resampled = [];
    let carried = 0;
    const spacing = 4;
    for (let index = 1; index < spine.length; index++) {
        const from = spine[index - 1];
        const to = spine[index];
        const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
        if (length === 0) continue;
        if (resampled.length === 0) resampled.push(from);
        for (let travelled = spacing - carried; travelled <= length; travelled += spacing) {
            const ratio = travelled / length;
            resampled.push([from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio]);
        }
        carried = (carried + length) % spacing;
    }
    const smoothedSpine = resampled.map((point, index) => {
        let sumX = 0;
        let sumY = 0;
        let count = 0;
        for (let offset = -2; offset <= 2; offset++) {
            const neighbour = resampled[Math.min(resampled.length - 1, Math.max(0, index + offset))];
            sumX += neighbour[0];
            sumY += neighbour[1];
            count += 1;
        }
        return [sumX / count, sumY / count];
    });

    // How thick the drawn animal is at every point of that line, measured on the artwork itself
    const spinePoints = smoothedSpine.map((point, index) => {
        const before = smoothedSpine[Math.max(0, index - 2)];
        const after = smoothedSpine[Math.min(smoothedSpine.length - 1, index + 2)];
        const tangent = normalize([after[0] - before[0], after[1] - before[1]]);
        const normal = [-tangent[1], tangent[0]];
        const measure = (sign) => {
            for (let step = 1; step < 200; step += 1) {
                const x = Math.round(point[0] + normal[0] * step * sign);
                const y = Math.round(point[1] + normal[1] * step * sign);
                if (!isAnimal(x, y)) return step;
            }
            return 200;
        };
        // The coil lies on itself, so the ray is capped at what the medial axis says is local
        const localLimit = Math.max(4, sampleDistance(animalDistance, width, height, point[0], point[1]) * 1.05);
        const halfWidth = Math.min(localLimit, (measure(1) + measure(-1)) / 2);
        return { point, halfWidth };
    });

    // The drawn coil pinches where it crosses itself, a living body may not. Closing fills those narrow dips and
    // leaves the long taper of the tail alone; the blur afterwards only takes the corners off.
    const slide = (values, radius, pick) =>
        values.map((_, index) => {
            let chosen = values[index];
            for (let offset = -radius; offset <= radius; offset++) {
                chosen = pick(chosen, values[Math.min(values.length - 1, Math.max(0, index + offset))]);
            }
            return chosen;
        });
    const widths = spinePoints.map((entry) => entry.halfWidth);
    const closed = slide(slide(widths, 12, Math.max), 12, Math.min);
    const profile = closed.map((_, index) => {
        let sum = 0;
        for (let offset = -3; offset <= 3; offset++) {
            sum += closed[Math.min(closed.length - 1, Math.max(0, index + offset))];
        }
        return sum / 7;
    });
    spinePoints.forEach((entry, index) => {
        entry.halfWidth = profile[index];
    });

    const spineOutput = spinePoints.map(({ point, halfWidth }) => {
        const [x, y] = toViewBox(point);
        return {
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2)),
            halfWidth: Number(((halfWidth * VIEW_BOX_SIZE) / width).toFixed(2)),
        };
    });
    result.spine = spineOutput;

    printArtworkData(result, sharpImage);
}

// --- the TypeScript to paste into the artwork module -----------------------

function round(value, decimals = 2) {
    return Number(value.toFixed(decimals));
}

/**
 * The colour of the drawing at a point of the centre line, averaged over the pixels of the animal around it
 */
function sampleBodyColor(image, x, y) {
    const centerX = (x * image.width) / VIEW_BOX_SIZE;
    const centerY = (y * image.height) / VIEW_BOX_SIZE;
    const totals = [0, 0, 0];
    let counted = 0;

    for (let offsetY = -3; offsetY <= 3; offsetY++) {
        for (let offsetX = -3; offsetX <= 3; offsetX++) {
            const sample = colorAt(image, Math.round(centerX + offsetX), Math.round(centerY + offsetY));
            const isBackground = colorDistance(sample, BACKGROUND) <= 45;
            const isWhite = sample[0] > 200 && sample[1] > 200 && sample[2] > 200;
            if (isBackground || isWhite) continue;
            totals[0] += sample[0];
            totals[1] += sample[1];
            totals[2] += sample[2];
            counted += 1;
        }
    }

    return counted === 0
        ? colorAt(image, Math.round(centerX), Math.round(centerY))
        : totals.map((total) => total / counted);
}

/**
 * Reads the walked centre line at an even spacing, ending it in the point the drawing ends its tail in
 */
function resampleBody(spine) {
    const distances = [0];
    for (let index = 1; index < spine.length; index++) {
        distances.push(
            distances[index - 1] + Math.hypot(spine[index].x - spine[index - 1].x, spine[index].y - spine[index - 1].y),
        );
    }

    const total = distances[distances.length - 1];
    const points = [];
    let cursor = 1;

    for (let distance = 0; distance <= total; distance += BODY_POINT_DISTANCE) {
        while (cursor < spine.length - 1 && distances[cursor] < distance) cursor++;
        const before = spine[cursor - 1];
        const after = spine[cursor];
        const span = distances[cursor] - distances[cursor - 1];
        const ratio = span === 0 ? 0 : (distance - distances[cursor - 1]) / span;
        const halfWidth = before.halfWidth + (after.halfWidth - before.halfWidth) * ratio;
        const taperRatio = Math.min(1, (total - distance) / TAIL_TAPER_LENGTH);

        points.push({
            x: before.x + (after.x - before.x) * ratio,
            y: before.y + (after.y - before.y) * ratio,
            halfWidth: TAIL_TIP_HALF_WIDTH + (halfWidth - TAIL_TIP_HALF_WIDTH) * taperRatio,
        });
    }

    const tip = spine[spine.length - 1];
    points.push({ x: tip.x, y: tip.y, halfWidth: TAIL_TIP_HALF_WIDTH });

    return points;
}

/**
 * Where the traced shapes sit inside the view box, measured by drawing them
 */
async function measureBounds(regions) {
    const size = 900;
    const paths = DRAWING_ORDER.map(({ region }) => `<path d="${regions[region].pathData}" fill="#ffffff"/>`).join('');
    const drawn = await sharp(
        Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}"` +
                ` width="${size}" height="${size}">` +
                `<rect width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" fill="#000000"/>${paths}</svg>`,
        ),
    )
        .removeAlpha()
        .raw()
        .toBuffer();

    const edges = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (drawn[(y * size + x) * 3] < 128) continue;
            edges.left = Math.min(edges.left, x);
            edges.top = Math.min(edges.top, y);
            edges.right = Math.max(edges.right, x);
            edges.bottom = Math.max(edges.bottom, y);
        }
    }

    return Object.fromEntries(
        Object.entries(edges).map(([edge, value]) => [edge, round((value * VIEW_BOX_SIZE) / size, 1)]),
    );
}

async function printArtworkData(result, image) {
    console.log('// AI_TA_KRAJTA_MARK_SHAPES');
    for (const { region, id } of DRAWING_ORDER) {
        const { pathData, gradient } = result.regions[region];
        const stops = gradient.stops
            .map((stop) => `{ offset: ${round(stop.offset, 3)}, color: '${stop.color}' },`)
            .join('\n                ');

        console.log(`    {
        id: '${id}',
        pathData:
            '${pathData}',
        gradient: {
            x1: ${round(gradient.start[0])},
            y1: ${round(gradient.start[1])},
            x2: ${round(gradient.end[0])},
            y2: ${round(gradient.end[1])},
            stops: [
                ${stops}
            ],
        },
    },`);
    }

    console.log('\n// AI_TA_KRAJTA_MARK_BODY');
    for (const point of resampleBody(result.spine.slice(HEAD_TRIM_POINT_COUNT))) {
        const color = toHex(sampleBodyColor(image, point.x, point.y));
        console.log(
            `    { x: ${round(point.x, 1)}, y: ${round(point.y, 1)},` +
                ` halfWidth: ${round(point.halfWidth, 2)}, color: '${color}' },`,
        );
    }

    console.log('\n// AI_TA_KRAJTA_MARK_BOUNDS');
    console.log(JSON.stringify(await measureBounds(result.regions)));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

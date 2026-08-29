/**
 * A point of the playing field, in pixels of the canvas
 */
export type SnakePoint = {
    readonly x: number;
    readonly y: number;
};

/**
 * Size of the playing field, in pixels of the canvas
 */
export type SnakeBounds = {
    readonly width: number;
    readonly height: number;
};

/**
 * One token lying on the field, waiting to be eaten
 */
export type SnakeFood = {
    readonly id: number;
    readonly position: SnakePoint;

    /**
     * Which of the two colors of the show this token is drawn in
     */
    readonly isWarm: boolean;
};

export type SnakeState = {
    readonly headPosition: SnakePoint;

    /**
     * Direction the head is moving in, in radians, zero pointing right
     */
    readonly headAngleInRadians: number;

    /**
     * Where the head has been, newest first, one point every `TRAIL_POINT_DISTANCE_IN_PIXELS`
     */
    readonly trail: readonly SnakePoint[];

    /**
     * How many segments the body is drawn with, which is how the snake shows that it grew
     */
    readonly segmentCount: number;

    readonly food: readonly SnakeFood[];

    /**
     * How many tokens have been eaten
     */
    readonly score: number;

    /**
     * Identifier the next token will be given, so that React can tell two tokens apart
     */
    readonly nextFoodId: number;
};

/**
 * How fast the snake glides, in pixels per second
 */
const SPEED_IN_PIXELS_PER_SECOND = 175;

/**
 * How sharply the snake can turn, in radians per second
 */
const MAXIMUM_TURN_IN_RADIANS_PER_SECOND = 4.2;

/**
 * How fast the snake turns while nobody is pointing at it, in radians per second
 */
const IDLE_TURN_IN_RADIANS_PER_SECOND = 0.9;

/**
 * Distance between two remembered points of the trail, in pixels
 */
const TRAIL_POINT_DISTANCE_IN_PIXELS = 4;

/**
 * Distance between two drawn segments of the body, in pixels
 */
export const SEGMENT_DISTANCE_IN_PIXELS = 8;

/**
 * How long the body is before the snake eats anything
 */
const INITIAL_SEGMENT_COUNT = 14;

/**
 * Direction of the snake while it first appears in the middle of the field
 */
const INITIAL_HEAD_ANGLE_IN_RADIANS = -Math.PI / 2;

/**
 * How much longer the body gets with every eaten token
 */
const SEGMENT_COUNT_PER_FOOD = 3;

/**
 * Where the body stops growing, so that it never fills the whole field
 */
const MAXIMUM_SEGMENT_COUNT = 70;

/**
 * How many tokens lie on the field at once
 */
const FOOD_COUNT = 5;

/**
 * How close the head has to come to a token to eat it, in pixels
 */
const EATING_DISTANCE_IN_PIXELS = 18;

/**
 * How far from the walls a token is placed and how close the head may come to a wall, in pixels
 */
const FIELD_MARGIN_IN_PIXELS = 26;

/**
 * How far from the head a new token appears, so that it is never eaten the moment it is placed
 */
const MINIMUM_FOOD_DISTANCE_IN_PIXELS = 90;

/**
 * How long one step of the simulation may be, in seconds
 *
 * Note: A browser tab which was in the background hands over one enormous step. Cutting it keeps the snake from
 *       teleporting across the field when the visitor comes back.
 */
const MAXIMUM_STEP_IN_SECONDS = 1 / 20;

/**
 * A source of random numbers between zero and one, handed in so that a test can run the same game twice
 */
export type CreateRandomNumber = () => number;

function getDistance(firstPoint: SnakePoint, secondPoint: SnakePoint): number {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

/**
 * Writes an angle as the shortest turn, between minus half a turn and half a turn
 */
function normalizeAngle(angleInRadians: number): number {
    return Math.atan2(Math.sin(angleInRadians), Math.cos(angleInRadians));
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

/**
 * How many remembered trail points make up a body of the requested length
 */
function getNeededTrailLength(segmentCount: number): number {
    const trailPointsPerSegment = SEGMENT_DISTANCE_IN_PIXELS / TRAIL_POINT_DISTANCE_IN_PIXELS;

    return Math.ceil(segmentCount * trailPointsPerSegment) + 2;
}

/**
 * Fills the body behind the head before the first animation frame, so the snake never starts as overlapping dots
 */
function createInitialTrail(headPosition: SnakePoint): SnakePoint[] {
    return Array.from({ length: getNeededTrailLength(INITIAL_SEGMENT_COUNT) }, (_, trailPointIndex) => {
        const distanceFromHead = trailPointIndex * TRAIL_POINT_DISTANCE_IN_PIXELS;

        return {
            x: headPosition.x - Math.cos(INITIAL_HEAD_ANGLE_IN_RADIANS) * distanceFromHead,
            y: headPosition.y - Math.sin(INITIAL_HEAD_ANGLE_IN_RADIANS) * distanceFromHead,
        };
    });
}

/**
 * Places one token somewhere on the field, out of reach of the head
 */
function createFood(
    id: number,
    bounds: SnakeBounds,
    headPosition: SnakePoint,
    createRandomNumber: CreateRandomNumber,
): SnakeFood {
    const usableWidth = Math.max(1, bounds.width - 2 * FIELD_MARGIN_IN_PIXELS);
    const usableHeight = Math.max(1, bounds.height - 2 * FIELD_MARGIN_IN_PIXELS);

    // Note: A field can be smaller than the distance asked for, so the search gives up after a few tries instead of
    //       spinning forever.
    for (let attempt = 0; attempt < 12; attempt++) {
        const position = {
            x: FIELD_MARGIN_IN_PIXELS + createRandomNumber() * usableWidth,
            y: FIELD_MARGIN_IN_PIXELS + createRandomNumber() * usableHeight,
        };

        if (getDistance(position, headPosition) >= MINIMUM_FOOD_DISTANCE_IN_PIXELS || attempt === 11) {
            return { id, position, isWarm: createRandomNumber() < 0.5 };
        }
    }

    throw new Error('Unreachable, the loop above always returns');
}

/**
 * Sets the field up with the snake in the middle and the first tokens around it
 */
export function createSnakeState(bounds: SnakeBounds, createRandomNumber: CreateRandomNumber): SnakeState {
    const headPosition = { x: bounds.width / 2, y: bounds.height / 2 };
    const food: SnakeFood[] = [];

    for (let foodIndex = 0; foodIndex < FOOD_COUNT; foodIndex++) {
        food.push(createFood(foodIndex, bounds, headPosition, createRandomNumber));
    }

    return {
        headPosition,
        headAngleInRadians: INITIAL_HEAD_ANGLE_IN_RADIANS,
        trail: createInitialTrail(headPosition),
        segmentCount: INITIAL_SEGMENT_COUNT,
        food,
        score: 0,
        nextFoodId: FOOD_COUNT,
    };
}

/**
 * Which way the head wants to go, which is towards the pointer or, when there is none, around in a slow circle
 */
function getDesiredAngleInRadians(
    state: SnakeState,
    targetPosition: SnakePoint | null,
    stepInSeconds: number,
): number {
    if (targetPosition === null) {
        return state.headAngleInRadians + IDLE_TURN_IN_RADIANS_PER_SECOND * stepInSeconds;
    }

    return Math.atan2(targetPosition.y - state.headPosition.y, targetPosition.x - state.headPosition.x);
}

/**
 * Keeps the head on the field by turning it away from the wall it is about to leave through
 */
function reflectOffWalls(
    headPosition: SnakePoint,
    headAngleInRadians: number,
    bounds: SnakeBounds,
): { readonly headPosition: SnakePoint; readonly headAngleInRadians: number } {
    const minimumX = FIELD_MARGIN_IN_PIXELS;
    const maximumX = Math.max(minimumX, bounds.width - FIELD_MARGIN_IN_PIXELS);
    const minimumY = FIELD_MARGIN_IN_PIXELS;
    const maximumY = Math.max(minimumY, bounds.height - FIELD_MARGIN_IN_PIXELS);
    const isOutsideHorizontally = headPosition.x < minimumX || headPosition.x > maximumX;
    const isOutsideVertically = headPosition.y < minimumY || headPosition.y > maximumY;

    const reflectedAngle = isOutsideHorizontally
        ? Math.PI - headAngleInRadians
        : isOutsideVertically
          ? -headAngleInRadians
          : headAngleInRadians;

    return {
        headPosition: {
            x: clamp(headPosition.x, minimumX, maximumX),
            y: clamp(headPosition.y, minimumY, maximumY),
        },
        headAngleInRadians: normalizeAngle(reflectedAngle),
    };
}

/**
 * Remembers where the head has been, dropping what is already behind the tail
 */
function extendTrail(trail: readonly SnakePoint[], headPosition: SnakePoint, segmentCount: number): SnakePoint[] {
    const neededTrailLength = getNeededTrailLength(segmentCount);
    const newestPoint = trail[0];

    if (newestPoint !== undefined && getDistance(newestPoint, headPosition) < TRAIL_POINT_DISTANCE_IN_PIXELS) {
        return [...trail];
    }

    return [headPosition, ...trail].slice(0, neededTrailLength);
}

export type AdvanceSnakeStateOptions = {
    readonly bounds: SnakeBounds;

    /**
     * Where the pointer is, `null` when it left the field and the snake glides on its own
     */
    readonly targetPosition: SnakePoint | null;

    readonly stepInSeconds: number;
    readonly createRandomNumber: CreateRandomNumber;
};

/**
 * Moves the game on by one step
 *
 * Note: The whole game is this one pure function, so the component around it only has to draw what it returns and a
 *       test can play the game without a canvas.
 */
export function advanceSnakeState(state: SnakeState, options: AdvanceSnakeStateOptions): SnakeState {
    const stepInSeconds = Math.min(MAXIMUM_STEP_IN_SECONDS, Math.max(0, options.stepInSeconds));
    const desiredAngle = getDesiredAngleInRadians(state, options.targetPosition, stepInSeconds);
    const maximumTurn = MAXIMUM_TURN_IN_RADIANS_PER_SECOND * stepInSeconds;
    const turn = clamp(normalizeAngle(desiredAngle - state.headAngleInRadians), -maximumTurn, maximumTurn);
    const angleAfterTurn = normalizeAngle(state.headAngleInRadians + turn);
    const distance = SPEED_IN_PIXELS_PER_SECOND * stepInSeconds;

    const { headPosition, headAngleInRadians } = reflectOffWalls(
        {
            x: state.headPosition.x + Math.cos(angleAfterTurn) * distance,
            y: state.headPosition.y + Math.sin(angleAfterTurn) * distance,
        },
        angleAfterTurn,
        options.bounds,
    );

    const eatenFood = state.food.filter(
        (food) => getDistance(food.position, headPosition) <= EATING_DISTANCE_IN_PIXELS,
    );
    const segmentCount = Math.min(
        MAXIMUM_SEGMENT_COUNT,
        state.segmentCount + eatenFood.length * SEGMENT_COUNT_PER_FOOD,
    );

    const food = state.food.map((existingFood, foodIndex) =>
        eatenFood.includes(existingFood)
            ? createFood(state.nextFoodId + foodIndex, options.bounds, headPosition, options.createRandomNumber)
            : existingFood,
    );

    return {
        headPosition,
        headAngleInRadians,
        trail: extendTrail(state.trail, headPosition, segmentCount),
        segmentCount,
        food,
        score: state.score + eatenFood.length,
        nextFoodId: state.nextFoodId + (eatenFood.length === 0 ? 0 : state.food.length),
    };
}

/**
 * Where the body of the snake is drawn, from right behind the head to the tip of the tail
 */
export function getSnakeSegments(state: SnakeState): readonly SnakePoint[] {
    const trailPointsPerSegment = SEGMENT_DISTANCE_IN_PIXELS / TRAIL_POINT_DISTANCE_IN_PIXELS;
    const segments: SnakePoint[] = [];

    for (let segmentIndex = 0; segmentIndex < state.segmentCount; segmentIndex++) {
        const trailIndex = Math.round(segmentIndex * trailPointsPerSegment);

        segments.push(state.trail[Math.min(trailIndex, state.trail.length - 1)]);
    }

    return segments;
}

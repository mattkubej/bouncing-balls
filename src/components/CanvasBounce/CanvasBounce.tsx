import { useRef, useState, useEffect, useCallback } from 'react';

import './CanvasBounce.css';

const DEFAULT_BALL_AMOUNT = 25;
const BALL_RADIUS = 25;
const ENDING_ANGLE = 2 * Math.PI;

const BALL_COLOR = 'red';
const BALL_BORDER_COLOR = 'black';

const MIN_BALLS = 25;
const BALL_STEPS = 25;
const MAX_BALLS = 2500;

const SLOWEST_VELOCITY = 1;
const FASTEST_VELOCITY = 5;

interface IBall {
  radius: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

function randomSign() {
  return Math.sign(Math.random() - 0.5);
}

function randomNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomVelocity() {
  return randomSign() * randomNumberBetween(SLOWEST_VELOCITY, FASTEST_VELOCITY);
}

function initializeBalls(
  containerHeight: number,
  containerWidth: number,
  amount: number = 1
): IBall[] {
  return new Array(amount).fill(0).map(() => ({
    radius: BALL_RADIUS,
    x: Math.random() * containerWidth,
    y: Math.random() * containerHeight,
    dx: randomVelocity(),
    dy: randomVelocity(),
  }));
}

function getVelocity(
  position: number,
  velocity: number,
  ballRadius: number,
  borderPosition: number
) {
  const movingOutsideLowerBoundary = position <= ballRadius && velocity < 0;
  const movingOutsideUpperBoundary =
    position + ballRadius >= borderPosition && velocity > 0;

  return movingOutsideLowerBoundary || movingOutsideUpperBoundary
    ? velocity * -1
    : velocity;
}

function updateBall(
  ball: IBall,
  containerHeight: number,
  containerWidth: number
) {
  const newDx = getVelocity(ball.x, ball.dx, ball.radius, containerWidth);
  const newDy = getVelocity(ball.y, ball.dy, ball.radius, containerHeight);

  return {
    ...ball,
    dx: newDx,
    dy: newDy,
    x: ball.x + newDx,
    y: ball.y + newDy,
  };
}

function clearCanvas(canvasElement: HTMLCanvasElement) {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  ctx.beginPath();
}

function drawBall(canvasElement: HTMLCanvasElement, ball: IBall) {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  ctx.beginPath();

  ctx.arc(ball.x, ball.y, ball.radius, 0, ENDING_ANGLE);
  ctx.fillStyle = BALL_COLOR;
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = BALL_BORDER_COLOR;
  ctx.stroke();
}

function useBouncingBalls(
  canvasElement: HTMLCanvasElement | null,
  initBallAmount: number = DEFAULT_BALL_AMOUNT
) {
  const [ballAmount, setBallAmount] = useState(initBallAmount);
  const balls = useRef<IBall[]>([]);

  const init = useCallback(() => {
    if (!canvasElement || balls.current.length === ballAmount) return;
    const { height, width } = canvasElement;

    balls.current = initializeBalls(height, width, ballAmount);
  }, [canvasElement, ballAmount]);

  const nextTick = useCallback(() => {
    if (!canvasElement) return;
    const { height, width } = canvasElement;

    clearCanvas(canvasElement);

    balls.current = balls.current.map((ball) => {
      const nextBall = updateBall(ball, height, width);

      drawBall(canvasElement, ball);

      return nextBall;
    });
  }, [canvasElement]);

  return {
    init,
    nextTick,
    ballAmount,
    setBallAmount,
  };
}

export function CanvasBounce() {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );

  const { init, nextTick, ballAmount, setBallAmount } =
    useBouncingBalls(canvasElement);

  const animationFrameRequestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerElement || !canvasElement) return;

    function setCanvasDimensions() {
      if (containerElement && canvasElement) {
        canvasElement.height = containerElement.clientHeight;
        canvasElement.width = containerElement.clientWidth;
      }
    }

    setCanvasDimensions();

    window.addEventListener('resize', setCanvasDimensions);
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, [containerElement, canvasElement]);

  useEffect(() => {
    init();
  }, [init]);

  const renderFrame = useCallback(() => {
    nextTick();

    animationFrameRequestRef.current = requestAnimationFrame(renderFrame);
  }, [nextTick]);

  useEffect(() => {
    animationFrameRequestRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameRequestRef.current !== null) {
        cancelAnimationFrame(animationFrameRequestRef.current);
      }
    };
  }, [renderFrame]);

  const handleChangeAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBallAmount(Number(e.target.value));
    },
    [setBallAmount]
  );

  return (
    <div id="container">
      <div id="controls">
        <span>amount: {ballAmount}</span>
        <input
          type="range"
          min={MIN_BALLS}
          step={BALL_STEPS}
          max={MAX_BALLS}
          value={ballAmount}
          onChange={handleChangeAmount}
        />
      </div>
      <div id="ballContainer" ref={setContainerElement}>
        <canvas ref={setCanvasElement}></canvas>
      </div>
    </div>
  );
}

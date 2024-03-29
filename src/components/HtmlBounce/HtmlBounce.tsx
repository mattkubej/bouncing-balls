import { useRef, useState, useEffect, useCallback } from 'react';

import './HtmlBounce.css';

const DEFAULT_BALL_AMOUNT = 25;
const BALL_DIAMETER = 50;

const MIN_BALLS = 25;
const BALL_STEPS = 25;
const MAX_BALLS = 2500;

const SLOWEST_VELOCITY = 1;
const FASTEST_VELOCITY = 5;

interface IBall {
  diameter: number;
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
    diameter: BALL_DIAMETER,
    x: Math.random() * containerWidth,
    y: Math.random() * containerHeight,
    dx: randomVelocity(),
    dy: randomVelocity(),
  }));
}

function getVelocity(
  position: number,
  velocity: number,
  ballDiameter: number,
  borderPosition: number
) {
  const movingOutsideLowerBoundary = position <= 0 && velocity < 0;
  const movingOutsideUpperBoundary =
    position + ballDiameter >= borderPosition && velocity > 0;

  return movingOutsideLowerBoundary || movingOutsideUpperBoundary
    ? velocity * -1
    : velocity;
}

function updateBall(
  ball: IBall,
  containerHeight: number,
  containerWidth: number
) {
  const newDx = getVelocity(ball.x, ball.dx, ball.diameter, containerWidth);
  const newDy = getVelocity(ball.y, ball.dy, ball.diameter, containerHeight);

  return {
    ...ball,
    dx: newDx,
    dy: newDy,
    x: ball.x + newDx,
    y: ball.y + newDy,
  };
}

function useBouncingBalls(
  containerElement: HTMLDivElement | null,
  initBallAmount: number = DEFAULT_BALL_AMOUNT
) {
  const [ballAmount, setBallAmount] = useState(initBallAmount);
  const [balls, setBalls] = useState<IBall[]>([]);

  const init = useCallback(() => {
    if (!containerElement || balls.length === ballAmount) return;
    const { clientHeight, clientWidth } = containerElement;

    setBalls(initializeBalls(clientHeight, clientWidth, ballAmount));
  }, [containerElement, balls.length, ballAmount]);

  const nextTick = useCallback(() => {
    if (!containerElement) return;
    const { clientHeight, clientWidth } = containerElement;

    setBalls((prevState) => {
      return prevState.map((ball) =>
        updateBall(ball, clientHeight, clientWidth)
      );
    });
  }, [containerElement]);

  return {
    init,
    nextTick,
    balls,
    ballAmount,
    setBallAmount,
  };
}

function Ball({ diameter, x, y }: IBall) {
  return (
    <div
      className="ball"
      style={{
        width: diameter,
        height: diameter,
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    ></div>
  );
}

export function HtmlBounce() {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const { init, nextTick, balls, ballAmount, setBallAmount } =
    useBouncingBalls(containerElement);

  const animationFrameRequestRef = useRef<number | null>(null);

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
        {balls.map((ball, index) => {
          return <Ball key={index} {...ball} />;
        })}
      </div>
    </div>
  );
}

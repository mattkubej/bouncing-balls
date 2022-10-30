import { useRef, useState, useEffect, useCallback } from "react";

import "./HtmlBounce.css";

interface IBall {
  diameter: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
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

function randomSign() {
  return Math.sign(Math.random() - 0.5);
}

function initializeBalls(
  containerHeight: number,
  containerWidth: number,
  amount: number = 1
): IBall[] {
  return new Array(amount).fill(0).map(() => ({
    diameter: 50,
    x: Math.random() * containerWidth,
    y: Math.random() * containerHeight,
    dx: randomSign() * Math.floor((Math.random() * 5) + 1),
    dy: randomSign() * Math.floor((Math.random() * 5) + 1),
  }));
}

function updateBall(
  ball: IBall,
  containerHeight: number,
  containerWidth: number
) {
  const movingOutsideTop = ball.y <= 0 && ball.dy < 0;
  const movingOutsideBottom =
    ball.y + ball.diameter >= containerHeight && ball.dy > 0;

  const movingOutsideLeft = ball.x <= 0 && ball.dx < 0;
  const movingOutsideRight =
    ball.x + ball.diameter >= containerWidth && ball.dx > 0;

  const newDx =
    movingOutsideLeft || movingOutsideRight ? ball.dx * -1 : ball.dx;
  const newDy =
    movingOutsideTop || movingOutsideBottom ? ball.dy * -1 : ball.dy;

  return {
    ...ball,
    dx: newDx,
    dy: newDy,
    x: ball.x + newDx,
    y: ball.y + newDy,
  };
}

export function HtmlBounce() {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);

  const animationFrameRequestRef = useRef<number | null>(null);

  const [amount, setAmount] = useState(25);
  const [balls, setBalls] = useState<IBall[]>([]);

  useEffect(() => {
    console.log('running');
    if (!containerElement || balls.length === amount) return;
    const { clientHeight, clientWidth } = containerElement;

    setBalls(initializeBalls(clientHeight, clientWidth, amount));
  }, [containerElement, balls.length, amount]);

  const renderFrame = useCallback(() => {
    if (!containerElement) return;
    const { clientHeight, clientWidth } = containerElement;

    setBalls((prevState) => {
      return prevState.map((ball) =>
        updateBall(ball, clientHeight, clientWidth)
      );
    });

    animationFrameRequestRef.current = requestAnimationFrame(renderFrame);
  }, [containerElement]);

  useEffect(() => {
    animationFrameRequestRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameRequestRef.current !== null) {
        cancelAnimationFrame(animationFrameRequestRef.current);
      }
    };
  }, [renderFrame]);

  return (
    <div id="container">
      <div id="controls">
        amount: {amount}
        <input type="range" min="25" step="25" max="2500" value={amount} onChange={(e) => {
          setAmount(Number(e.target.value));
        }} />
      </div>
      <div className="ballContainer" ref={setContainerElement}>
        {balls.map((ball, index) => {
          return <Ball key={index} {...ball} />;
        })}
      </div>
    </div>
  );
}

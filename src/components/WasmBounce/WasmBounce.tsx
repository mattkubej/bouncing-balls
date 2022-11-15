import { useRef, useState, useEffect, useCallback } from 'react';

import { BouncingBalls } from 'wasm-lib';

const MIN_BALLS = 1;
const BALL_STEPS = 1;
const MAX_BALLS = 25;

function useBouncingBalls({ defaultAmount }: { defaultAmount: number }) {
  const [bouncingBalls] = useState<BouncingBalls>(
    () => new BouncingBalls(defaultAmount)
  );

  const [amount, setAmount] = useState(defaultAmount);

  useEffect(() => {
    bouncingBalls.init_balls();
  }, [bouncingBalls]);

  const setBallAmount = useCallback(
    (ballAmount: number) => {
      setAmount(ballAmount);
      bouncingBalls.set_amount(ballAmount);
    },
    [bouncingBalls]
  );

  return {
    bouncingBalls,
    ballAmount: amount,
    setBallAmount,
  };
}

export function WasmBounce() {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );

  const { bouncingBalls, ballAmount, setBallAmount } = useBouncingBalls({
    defaultAmount: 1,
  });

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

  const renderFrame = useCallback(() => {
    if (!canvasElement) return;

    bouncingBalls.draw(canvasElement);

    animationFrameRequestRef.current = requestAnimationFrame(renderFrame);
  }, [canvasElement, bouncingBalls]);

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

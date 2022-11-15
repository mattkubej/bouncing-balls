import { useRef, useState, useEffect, useCallback } from 'react';

import { BouncingBalls } from 'wasm-lib';

const MIN_BALLS = 25;
const BALL_STEPS = 25;
const MAX_BALLS = 2500;

function useBouncingBalls({ amount }: { amount: number }) {
  const [bouncingBalls] = useState<BouncingBalls>(
    () => new BouncingBalls(amount)
  );

  useEffect(() => {
    bouncingBalls.init_balls();
  }, [bouncingBalls]);

  return bouncingBalls;
}

export function WasmBounce() {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );

  const bouncingBalls = useBouncingBalls({
    amount: 1,
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
      bouncingBalls.set_amount(Number(e.target.value));
    },
    [bouncingBalls]
  );

  return (
    <div id="container">
      <div id="controls">
        <span>amount: {1}</span>
        <input
          type="range"
          min={MIN_BALLS}
          step={BALL_STEPS}
          max={MAX_BALLS}
          value={1}
          onChange={handleChangeAmount}
        />
      </div>
      <div id="ballContainer" ref={setContainerElement}>
        <canvas ref={setCanvasElement}></canvas>
      </div>
    </div>
  );
}

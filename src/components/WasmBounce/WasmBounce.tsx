import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

import { BouncingBalls } from 'wasm-lib';

const MIN_BALLS = 25;
const BALL_STEPS = 25;
const MAX_BALLS = 2500;

function useBouncingBalls({
  defaultAmount,
  canvasElement,
}: {
  defaultAmount: number;
  canvasElement: HTMLCanvasElement | null;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [bouncingBalls, setBouncingBalls] = useState<BouncingBalls | null>(
    null
  );

  useEffect(() => {
    if (!canvasElement) return;

    (async function () {
      const { BouncingBalls } = await import('wasm-lib');
      const instance = new BouncingBalls(defaultAmount, canvasElement);
      instance.init_balls();

      setBouncingBalls(instance);
    })();
  }, [canvasElement, defaultAmount]);

  const debouncedSetAmount = useMemo(() => {
    return debounce((amount) => {
      bouncingBalls?.set_amount(amount);
    }, 250);
  }, [bouncingBalls]);

  const setBallAmount = useCallback(
    (ballAmount: number) => {
      setAmount(ballAmount);
      debouncedSetAmount(ballAmount);
    },
    [debouncedSetAmount]
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

  const { bouncingBalls, ballAmount, setBallAmount } = useBouncingBalls({
    defaultAmount: MIN_BALLS,
    canvasElement,
  });

  const animationFrameRequestRef = useRef<number | null>(null);

  const renderFrame = useCallback(() => {
    bouncingBalls?.draw();

    animationFrameRequestRef.current = requestAnimationFrame(renderFrame);
  }, [bouncingBalls]);

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

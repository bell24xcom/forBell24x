import { useEffect, useRef, useState } from 'react';

export default function CanvasBackground({
  className = '',
  nodeCount = 50,
  connectionDistance = 150,
  animationSpeed = 0.5,
}: CanvasBackgroundProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>();
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    // ... existing canvas animation and event logic ...
  }, [hasMounted]);

  return (
    <canvas ref={canvasRef} className={className} />
    // Only render animation if hasMounted is true
  );
}

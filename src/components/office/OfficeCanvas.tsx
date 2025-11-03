/**
 * Office Canvas Component
 *
 * Main React component for office visualization
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { Card, Stack, Group, Tooltip, ActionIcon, Text, Badge } from '@mantine/core';
import { OfficeRenderer } from '../../lib/office/renderer';
import { CameraController, createCamera } from '../../lib/office/camera';
import { OfficeStateMapper } from '../../lib/office/stateMapper';
import type { OfficeState } from '../../types/office';
import { gridToScreenCenter } from '../../lib/office/spatial';

interface OfficeCanvasProps {
  gameState: any;  // GameState from Founder's Dilemma
  width?: number;
  height?: number;
}

export default function OfficeCanvas({ gameState, width = 800, height = 600 }: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<OfficeRenderer | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const stateMapperRef = useRef<OfficeStateMapper | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [officeState, setOfficeState] = useState<OfficeState | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const focusCameraOnOffice = useCallback((state: OfficeState, animate: boolean = false) => {
    if (!cameraControllerRef.current) return;

    const centerGrid = {
      x: (state.grid.width - 1) / 2,
      y: (state.grid.height - 1) / 2
    };

    const center = gridToScreenCenter(centerGrid, state.grid);
    cameraControllerRef.current.focusOn(center, 1.0, animate ? 600 : undefined);
  }, []);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (cameraControllerRef.current) {
      cameraControllerRef.current.dispose();
      cameraControllerRef.current = null;
    }
    stateMapperRef.current = null;

    // Create renderer
    const renderer = new OfficeRenderer(canvas);
    renderer.resize(width, height);
    rendererRef.current = renderer;

    // Create camera
    const camera = createCamera(width, height);
    const cameraController = new CameraController(camera, 0.5, 2.0, 1.0, 0.1);
    cameraControllerRef.current = cameraController;

    // Create state mapper
    const stateMapper = new OfficeStateMapper();
    stateMapperRef.current = stateMapper;

    // Initial office state
    const initialOfficeState = stateMapper.mapToOfficeState(gameState);
    setOfficeState(initialOfficeState);

    // Focus camera on office center
    const centerGrid = {
      x: (initialOfficeState.grid.width - 1) / 2,
      y: (initialOfficeState.grid.height - 1) / 2
    };
    const center = gridToScreenCenter(centerGrid, initialOfficeState.grid);
    cameraController.focusOn(center, 1.0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (cameraControllerRef.current) {
        cameraControllerRef.current.dispose();
        cameraControllerRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      stateMapperRef.current = null;
    };
  }, [width, height, gameState, focusCameraOnOffice]);

  // Update office state when game state changes
  useEffect(() => {
    if (!stateMapperRef.current) return;

    const newOfficeState = stateMapperRef.current.mapToOfficeState(gameState);
    setOfficeState(newOfficeState);
  }, [
    gameState.week,
    gameState.burn,
    gameState.morale,
    gameState.tech_debt,
    gameState.velocity,
    gameState.momentum,
    gameState.bank,
    gameState.reputation,
    gameState.wau
  ]);

  // Render loop
  useEffect(() => {
    if (!rendererRef.current || !cameraControllerRef.current || !officeState || isPaused) {
      return;
    }

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    const render = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update FPS
      frameCount++;
      fpsTime += deltaTime;

      if (fpsTime >= 1000) {
        setFps(Math.round(frameCount * 1000 / fpsTime));
        frameCount = 0;
        fpsTime = 0;
      }

      // Update camera animation
      cameraControllerRef.current!.update(currentTime);

      // Render
      rendererRef.current!.render(
        officeState,
        cameraControllerRef.current!.getCamera()
      );

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [officeState, isPaused]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !cameraControllerRef.current) return;

    const dx = lastMousePos.x - e.clientX;
    const dy = lastMousePos.y - e.clientY;

    cameraControllerRef.current.pan(dx, dy);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Camera controls
  const handleZoomIn = useCallback(() => {
    cameraControllerRef.current?.zoom(1);
  }, []);

  const handleZoomOut = useCallback(() => {
    cameraControllerRef.current?.zoom(-1);
  }, []);

  const handleResetCamera = useCallback(() => {
    cameraControllerRef.current?.reset();
    if (officeState) {
      focusCameraOnOffice(officeState, true);
    }
  }, [officeState, focusCameraOnOffice]);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (!cameraControllerRef.current) return;

      const delta = -event.deltaY;
      const zoomFactor = delta > 0 ? 1 : -1;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      cameraControllerRef.current.zoom(zoomFactor, { x: mouseX, y: mouseY });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [width, height]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!cameraControllerRef.current) return;

    const panStep = 40;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        cameraControllerRef.current.pan(0, panStep);
        break;
      case 'ArrowDown':
        event.preventDefault();
        cameraControllerRef.current.pan(0, -panStep);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        cameraControllerRef.current.pan(panStep, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        cameraControllerRef.current.pan(-panStep, 0);
        break;
      case '+':
      case '=':
        event.preventDefault();
        handleZoomIn();
        break;
      case '-':
      case '_':
        event.preventDefault();
        handleZoomOut();
        break;
      case ' ':
        event.preventDefault();
        handleTogglePause();
        break;
      case 'r':
      case 'R':
        event.preventDefault();
        handleResetCamera();
        break;
      default:
        break;
    }
  }, [handleResetCamera, handleTogglePause, handleZoomIn, handleZoomOut]);

  return (
    <Card withBorder padding="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group>
            <Text size="lg" fw={700}>Office View</Text>
            <Badge variant="light">Week {gameState.week}</Badge>
            <Badge variant="light" color="blue">
              {officeState?.team.length || 0} Team Members
            </Badge>
          </Group>

          <Group gap="xs">
            {/* FPS Counter */}
            <Tooltip label="Frames per second">
              <Badge variant="outline" color="gray" size="sm">
                {fps} FPS
              </Badge>
            </Tooltip>

            {/* Pause/Play */}
            <Tooltip label={isPaused ? 'Resume' : 'Pause'}>
              <ActionIcon
                variant="light"
                onClick={handleTogglePause}
                size="lg"
              >
                <Text size="lg">{isPaused ? '▶️' : '⏸️'}</Text>
              </ActionIcon>
            </Tooltip>

            {/* Zoom Controls */}
            <Tooltip label="Zoom in">
              <ActionIcon
                variant="light"
                onClick={handleZoomIn}
                size="lg"
              >
                <Text size="lg">🔍+</Text>
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Zoom out">
              <ActionIcon
                variant="light"
                onClick={handleZoomOut}
                size="lg"
              >
                <Text size="lg">🔍-</Text>
              </ActionIcon>
            </Tooltip>

            {/* Reset Camera */}
            <Tooltip label="Reset view">
              <ActionIcon
                variant="light"
                onClick={handleResetCamera}
                size="lg"
              >
                <Text size="lg">🎯</Text>
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Canvas */}
        <div
          style={{ position: 'relative' }}
          tabIndex={0}
          role="img"
          onKeyDown={handleKeyDown}
          aria-label="Office visualization - use arrow keys to pan, plus or minus to zoom, space to pause, r to reset"
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: isDragging ? 'grabbing' : 'grab',
              display: 'block'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Instructions Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(255,255,255,0.9)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              fontSize: '12px',
              pointerEvents: 'none'
            }}
          >
            <Text size="xs" c="dimmed">
              🖱️ <strong>Drag</strong> to pan • <strong>Scroll</strong> to zoom • ⌨️ <strong>Arrows</strong> to pan, <strong>+/-</strong> to zoom, <strong>Space</strong> to pause, <strong>R</strong> to reset
            </Text>
          </div>
        </div>

        {/* Office Stats */}
        {officeState && (
          <Group justify="space-between">
            <Group gap="lg">
              <div>
                <Text size="xs" c="dimmed">Layout</Text>
                <Text size="sm" fw={600} tt="capitalize">{officeState.layout}</Text>
              </div>

              <div>
                <Text size="xs" c="dimmed">Clutter Level</Text>
                <Text size="sm" fw={600}>{officeState.clutter.length} items</Text>
              </div>

              <div>
                <Text size="xs" c="dimmed">Ambiance</Text>
                <Text size="sm" fw={600} tt="capitalize">
                  {officeState.ambiance.mood} • {officeState.ambiance.lighting}
                </Text>
              </div>
            </Group>
          </Group>
        )}
      </Stack>
    </Card>
  );
}

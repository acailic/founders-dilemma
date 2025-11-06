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
  useMemo,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { Card, Stack, Group, Tooltip, ActionIcon, Text, Badge } from '@mantine/core';
import { OfficeRenderer } from '../../lib/office/renderer';
import { CameraController, createCamera, screenToWorld } from '../../lib/office/camera';
import { OfficeStateMapper } from '../../lib/office/stateMapper';
import type { OfficeState, TeamMember } from '../../types/office';
import { gridToScreen, gridToScreenCenter, TILE_HEIGHT } from '../../lib/office/spatial';
import OfficeOverlay from './OfficeOverlay';

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
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const [officeState, setOfficeState] = useState<OfficeState | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null);

  const focusCameraOnOffice = useCallback((state: OfficeState, animate: boolean = false) => {
    if (!cameraControllerRef.current) return;

    const centerGrid = {
      x: (state.grid.width - 1) / 2,
      y: (state.grid.height - 1) / 2
    };

    const center = gridToScreenCenter(centerGrid, state.grid);
    cameraControllerRef.current.focusOn(center, 1.0, animate ? 600 : undefined);
  }, []);

  const findMemberAt = useCallback((clientX: number, clientY: number): string | null => {
    if (!officeState || !canvasRef.current || !cameraControllerRef.current) {
      return null;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const local = { x: clientX - rect.left, y: clientY - rect.top };
    const camera = cameraControllerRef.current.getCamera();
    const world = screenToWorld(local, camera);

    const threshold = 32;
    let closestId: string | null = null;
    let closestDist = Number.POSITIVE_INFINITY;

    for (const member of officeState.team) {
      const memberPoint = gridToScreen(member.position, officeState.grid);
      const dx = world.x - memberPoint.x;
      const dy = world.y - (memberPoint.y - TILE_HEIGHT / 4);
      const dist = Math.hypot(dx, dy);

      if (dist < threshold && dist < closestDist) {
        closestDist = dist;
        closestId = member.id;
      }
    }

    return closestDist <= threshold ? closestId : null;
  }, [officeState]);

  const updateHover = useCallback((clientX: number, clientY: number) => {
    const candidate = findMemberAt(clientX, clientY);
    setHoveredMemberId(prev => (prev === candidate ? prev : candidate));
  }, [findMemberAt]);

  const clearHover = useCallback(() => {
    setHoveredMemberId(prev => (prev !== null ? null : prev));
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
        rendererRef.current.setInteractionState({ hoveredTeamId: null, selectedTeamId: null });
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      stateMapperRef.current = null;
      setPointerPosition(null);
      setHoveredMemberId(null);
      setSelectedMemberId(null);
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

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setInteractionState({
      hoveredTeamId: hoveredMemberId,
      selectedTeamId: selectedMemberId
    });
  }, [hoveredMemberId, selectedMemberId]);

  useEffect(() => {
    if (!officeState) {
      setHoveredMemberId(null);
      setSelectedMemberId(null);
      return;
    }

    if (hoveredMemberId && !officeState.team.some(member => member.id === hoveredMemberId)) {
      setHoveredMemberId(null);
    }

    if (selectedMemberId && !officeState.team.some(member => member.id === selectedMemberId)) {
      setSelectedMemberId(null);
    }
  }, [officeState, hoveredMemberId, selectedMemberId]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPointerPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!cameraControllerRef.current || !canvasRef.current) return;

    const dx = lastMousePos.x - e.clientX;
    const dy = lastMousePos.y - e.clientY;

    const rect = canvasRef.current.getBoundingClientRect();
    const local = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPointerPosition(local);

    if (isDragging) {
      cameraControllerRef.current.pan(dx, dy);
      clearHover();
    } else {
      updateHover(e.clientX, e.clientY);
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [clearHover, isDragging, lastMousePos, updateHover]);

  const handleMouseUp = useCallback((e: ReactMouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    const start = dragStartRef.current;
    dragStartRef.current = null;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPointerPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (start) {
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved < 6) {
        updateHover(e.clientX, e.clientY);
        setSelectedMemberId(prev => {
          const candidate = findMemberAt(e.clientX, e.clientY);
          if (!candidate) {
            return null;
          }
          return prev === candidate ? null : candidate;
        });
      }
    }
  }, [findMemberAt, updateHover]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    setPointerPosition(null);
    clearHover();
  }, [clearHover]);

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
    setSelectedMemberId(null);
    setPointerPosition(null);
    clearHover();
  }, [clearHover, focusCameraOnOffice, officeState]);

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

      setPointerPosition({ x: mouseX, y: mouseY });
      cameraControllerRef.current.zoom(zoomFactor, { x: mouseX, y: mouseY });
      updateHover(event.clientX, event.clientY);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [updateHover]);

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
      case 'Escape':
        setSelectedMemberId(null);
        clearHover();
        break;
      default:
        break;
    }
  }, [clearHover, handleResetCamera, handleTogglePause, handleZoomIn, handleZoomOut]);

  const hoveredMember = useMemo<TeamMember | null>(() => {
    if (!officeState || !hoveredMemberId) return null;
    return officeState.team.find(member => member.id === hoveredMemberId) ?? null;
  }, [hoveredMemberId, officeState]);

  const selectedMember = useMemo<TeamMember | null>(() => {
    if (!officeState || !selectedMemberId) return null;
    return officeState.team.find(member => member.id === selectedMemberId) ?? null;
  }, [officeState, selectedMemberId]);

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
            onMouseLeave={handleMouseLeave}
          />

          <OfficeOverlay
            hoveredMember={hoveredMember}
            selectedMember={selectedMember}
            pointerPosition={pointerPosition}
            canvasSize={{ width, height }}
            onClearSelection={() => setSelectedMemberId(null)}
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

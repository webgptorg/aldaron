'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type PavolHeroBadgeCanvasProps = {
    imageSrc: string;
    onReady: () => void;
};

function createRoundedRectangleShape(width: number, height: number, radius: number) {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    return shape;
}

function createBadgeGeometry() {
    const shape = createRoundedRectangleShape(3.05, 4.22, 0.28);
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 10,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        curveSegments: 18,
    });

    geometry.center();

    return geometry;
}

function createTubeGeometry(points: THREE.Vector3[]) {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 44, 0.028, 10, false);
}

function createLanyardGeometries() {
    return [
        createTubeGeometry([
            new THREE.Vector3(-0.62, 2.03, 0.04),
            new THREE.Vector3(-1.14, 2.52, -0.08),
            new THREE.Vector3(-0.72, 3.12, -0.14),
            new THREE.Vector3(0, 3.28, -0.16),
        ]),
        createTubeGeometry([
            new THREE.Vector3(0.62, 2.03, 0.04),
            new THREE.Vector3(1.14, 2.52, -0.08),
            new THREE.Vector3(0.72, 3.12, -0.14),
            new THREE.Vector3(0, 3.28, -0.16),
        ]),
    ];
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
    const materials = Array.isArray(material) ? material : [material];

    materials.forEach((item) => item.dispose());
}

export default function PavolHeroBadgeCanvas({ imageSrc, onReady }: PavolHeroBadgeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const onReadyRef = useRef(onReady);

    useEffect(() => {
        onReadyRef.current = onReady;
    }, [onReady]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas,
            powerPreference: 'high-performance',
        });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        const group = new THREE.Group();
        const badgeGeometry = createBadgeGeometry();
        const lanyardGeometries = createLanyardGeometries();
        const pointer = new THREE.Vector2(0, 0);
        const hoverState = {
            isHovered: false,
            isPressed: false,
        };
        const clock = new THREE.Clock();
        let frameId = 0;
        let isDisposed = false;
        let isReady = false;

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        camera.position.set(0, 0, 9.2);
        scene.add(group);

        scene.add(new THREE.AmbientLight(0xffffff, 2.15));

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
        keyLight.position.set(3, 4, 5);
        scene.add(keyLight);

        const warmLight = new THREE.DirectionalLight(0xf2d7a3, 1.15);
        warmLight.position.set(-4, 1, 3);
        scene.add(warmLight);

        const accentLight = new THREE.PointLight(0x7fd7e4, 0.9);
        accentLight.position.set(-3, -1.8, 3.8);
        scene.add(accentLight);

        lanyardGeometries.forEach((geometry) => {
            const lanyard = new THREE.Mesh(
                geometry,
                new THREE.MeshStandardMaterial({ color: 0x0f8c9d, metalness: 0.05, roughness: 0.48 }),
            );
            group.add(lanyard);
        });

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.33, 0.025, 14, 52),
            new THREE.MeshStandardMaterial({ color: 0xd39b3d, metalness: 0.45, roughness: 0.28 }),
        );
        ring.position.set(0, 2.03, 0.12);
        ring.rotation.z = Math.PI / 2;
        group.add(ring);

        const shadow = new THREE.Mesh(
            badgeGeometry,
            new THREE.MeshBasicMaterial({ color: 0x102033, opacity: 0.12, transparent: true }),
        );
        shadow.position.set(0.1, -0.12, -0.18);
        shadow.scale.set(1.03, 1.03, 1);
        group.add(shadow);

        const badge = new THREE.Mesh(
            badgeGeometry,
            new THREE.MeshPhysicalMaterial({
                clearcoat: 0.42,
                clearcoatRoughness: 0.5,
                color: 0xfffdf8,
                metalness: 0.02,
                roughness: 0.68,
            }),
        );
        group.add(badge);

        const glassPanel = new THREE.Mesh(
            new THREE.PlaneGeometry(2.64, 3.78),
            new THREE.MeshPhysicalMaterial({
                clearcoat: 0.65,
                clearcoatRoughness: 0.28,
                color: 0xffffff,
                metalness: 0,
                opacity: 0.42,
                roughness: 0.34,
                transparent: true,
            }),
        );
        glassPanel.position.set(0, -0.15, 0.14);
        group.add(glassPanel);

        const slot = new THREE.Mesh(
            new THREE.BoxGeometry(0.86, 0.09, 0.035),
            new THREE.MeshStandardMaterial({ color: 0xe7d9c8, roughness: 0.62 }),
        );
        slot.position.set(0, 1.72, 0.2);
        group.add(slot);

        const portraitGeometry = new THREE.PlaneGeometry(2.25, 3.92);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imageSrc, (texture) => {
            if (isDisposed) {
                texture.dispose();
                return;
            }

            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 8;
            texture.needsUpdate = true;

            const portrait = new THREE.Mesh(
                portraitGeometry,
                new THREE.MeshBasicMaterial({
                    alphaTest: 0.02,
                    map: texture,
                    toneMapped: false,
                    transparent: true,
                }),
            );
            portrait.position.set(0, -0.16, 0.18);
            group.add(portrait);
            isReady = true;
        });

        const updateSize = () => {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(1, Math.floor(rect.width));
            const height = Math.max(1, Math.floor(rect.height));

            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(canvas);
        updateSize();

        const updatePointer = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        };

        const setCursor = () => {
            canvas.style.cursor = hoverState.isPressed ? 'grabbing' : hoverState.isHovered ? 'grab' : '';
        };

        const handlePointerMove = (event: PointerEvent) => {
            updatePointer(event);
        };
        const handlePointerEnter = (event: PointerEvent) => {
            hoverState.isHovered = true;
            updatePointer(event);
            setCursor();
        };
        const handlePointerLeave = () => {
            hoverState.isHovered = false;
            hoverState.isPressed = false;
            pointer.set(0, 0);
            setCursor();
        };
        const handlePointerDown = (event: PointerEvent) => {
            hoverState.isPressed = true;
            updatePointer(event);
            canvas.setPointerCapture(event.pointerId);
            setCursor();
        };
        const handlePointerUp = (event: PointerEvent) => {
            hoverState.isPressed = false;
            if (canvas.hasPointerCapture(event.pointerId)) {
                canvas.releasePointerCapture(event.pointerId);
            }
            setCursor();
        };

        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerenter', handlePointerEnter);
        canvas.addEventListener('pointerleave', handlePointerLeave);
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerup', handlePointerUp);

        const render = () => {
            const delta = Math.min(clock.getDelta(), 0.05);
            const elapsed = clock.elapsedTime;
            const activeMultiplier = hoverState.isPressed ? 1.35 : hoverState.isHovered ? 1.05 : 0.72;

            group.rotation.x = THREE.MathUtils.damp(
                group.rotation.x,
                -pointer.y * 0.17 * activeMultiplier + Math.sin(elapsed * 0.95) * 0.018,
                5,
                delta,
            );
            group.rotation.y = THREE.MathUtils.damp(
                group.rotation.y,
                pointer.x * 0.28 * activeMultiplier + Math.sin(elapsed * 0.7) * 0.02,
                5,
                delta,
            );
            group.rotation.z = THREE.MathUtils.damp(
                group.rotation.z,
                -pointer.x * 0.055 + Math.sin(elapsed * 0.82) * 0.018,
                5,
                delta,
            );
            group.position.y = THREE.MathUtils.damp(
                group.position.y,
                -0.25 + Math.sin(elapsed * 1.12) * 0.045 + (hoverState.isPressed ? -0.07 : hoverState.isHovered ? 0.025 : 0),
                4,
                delta,
            );

            renderer.render(scene, camera);

            if (isReady) {
                isReady = false;
                onReadyRef.current();
            }

            frameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            isDisposed = true;
            window.cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerenter', handlePointerEnter);
            canvas.removeEventListener('pointerleave', handlePointerLeave);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);

            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    disposeMaterial(object.material);
                }
            });
            renderer.dispose();
        };
    }, [imageSrc]);

    return <canvas ref={canvasRef} className="h-full w-full" />;
}

'use client';

import { PavolHeroBadgeShell } from '@/businesses/pavol/PavolHeroBadge';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { ContactShadows, RoundedBox, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

const STRAP_SEGMENTS = 18;
const STRAP_ANCHOR_Y = 2.55;

function updateStrapGeometry({
    line,
    offsetX,
    endX,
    endY,
    endZ,
}: {
    line: THREE.Line | null;
    offsetX: number;
    endX: number;
    endY: number;
    endZ: number;
}) {
    if (!line) {
        return;
    }

    const attribute = line.geometry.getAttribute('position') as THREE.BufferAttribute;

    for (let index = 0; index <= STRAP_SEGMENTS; index++) {
        const progress = index / STRAP_SEGMENTS;
        const inverseProgress = 1 - progress;

        const anchorX = offsetX;
        const anchorY = STRAP_ANCHOR_Y;
        const controlX = offsetX + endX * 0.32;
        const controlY = 1.9 + Math.abs(endX) * 0.08;
        const controlZ = endZ * 0.15;
        const targetX = endX + offsetX * 0.4;
        const targetY = endY;
        const targetZ = endZ;

        const x = inverseProgress * inverseProgress * anchorX + 2 * inverseProgress * progress * controlX + progress * progress * targetX;
        const y = inverseProgress * inverseProgress * anchorY + 2 * inverseProgress * progress * controlY + progress * progress * targetY;
        const z = inverseProgress * inverseProgress * 0 + 2 * inverseProgress * progress * controlZ + progress * progress * targetZ;

        attribute.setXYZ(index, x, y, z);
    }

    attribute.needsUpdate = true;
    line.geometry.computeBoundingSphere();
}

function BadgeScene({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
    const badgeRef = useRef<THREE.Group>(null);
    const motionRef = useRef({ x: 0, y: 0 });
    const texture = useTexture(pavolHejny.src);
    const strapLeft = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((STRAP_SEGMENTS + 1) * 3), 3));

        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#0f8c9d', transparent: true, opacity: 0.82 }));
    }, []);
    const strapRight = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((STRAP_SEGMENTS + 1) * 3), 3));

        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#0f8c9d', transparent: true, opacity: 0.82 }));
    }, []);

    texture.colorSpace = THREE.SRGBColorSpace;

    useFrame((state, delta) => {
        const badge = badgeRef.current;

        if (!badge) {
            return;
        }

        const elapsedTime = state.clock.getElapsedTime();

        motionRef.current.x = THREE.MathUtils.damp(motionRef.current.x, pointer.current.x, 4, delta);
        motionRef.current.y = THREE.MathUtils.damp(motionRef.current.y, pointer.current.y, 4, delta);

        const targetRotationX = motionRef.current.y * -0.3 + Math.cos(elapsedTime * 0.9) * 0.045;
        const targetRotationY = motionRef.current.x * 0.55 + Math.sin(elapsedTime * 0.65) * 0.08;
        const targetRotationZ = motionRef.current.x * -0.16 + Math.sin(elapsedTime * 1.1) * 0.03;
        const targetPositionY = -0.55 + Math.sin(elapsedTime * 1.2) * 0.08;

        badge.rotation.x = THREE.MathUtils.damp(badge.rotation.x, targetRotationX, 4.5, delta);
        badge.rotation.y = THREE.MathUtils.damp(badge.rotation.y, targetRotationY, 4.5, delta);
        badge.rotation.z = THREE.MathUtils.damp(badge.rotation.z, targetRotationZ, 4.5, delta);
        badge.position.y = THREE.MathUtils.damp(badge.position.y, targetPositionY, 3.8, delta);

        const strapEndX = badge.rotation.y * 0.85;
        const strapEndY = 1.28 + badge.position.y;
        const strapEndZ = badge.rotation.x * -0.5;

        updateStrapGeometry({
            line: strapLeft,
            offsetX: -0.12,
            endX: strapEndX,
            endY: strapEndY,
            endZ: strapEndZ,
        });
        updateStrapGeometry({
            line: strapRight,
            offsetX: 0.12,
            endX: strapEndX,
            endY: strapEndY,
            endZ: strapEndZ,
        });
    });

    return (
        <>
            <ambientLight intensity={1.6} />
            <directionalLight position={[4, 5, 5]} intensity={2.5} color="#ffffff" />
            <directionalLight position={[-4, 2, 3]} intensity={1.4} color="#ffe7c2" />
            <pointLight position={[0, -2.2, 4]} intensity={10} color="#f8c97b" />

            <group position={[0, 0.1, 0]}>
                <mesh position={[0, STRAP_ANCHOR_Y + 0.05, 0]}>
                    <sphereGeometry args={[0.11, 24, 24]} />
                    <meshStandardMaterial color="#d39b3d" metalness={0.7} roughness={0.25} />
                </mesh>

                <primitive object={strapLeft} />
                <primitive object={strapRight} />

                <group ref={badgeRef} position={[0, -0.55, 0]}>
                    <mesh position={[0, 1.42, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.22, 0.035, 20, 40]} />
                        <meshStandardMaterial color="#d39b3d" metalness={0.85} roughness={0.18} />
                    </mesh>

                    <mesh position={[0, 1.26, 0.02]}>
                        <boxGeometry args={[0.42, 0.14, 0.08]} />
                        <meshStandardMaterial color="#f3c66f" metalness={0.45} roughness={0.3} />
                    </mesh>

                    <RoundedBox args={[2.3, 3.25, 0.18]} radius={0.18} smoothness={5}>
                        <meshStandardMaterial color="#fffdf9" metalness={0.08} roughness={0.34} />
                    </RoundedBox>

                    <mesh position={[0, 0, 0.1]}>
                        <planeGeometry args={[1.72, 2.62]} />
                        <meshStandardMaterial map={texture} transparent roughness={0.45} metalness={0.02} />
                    </mesh>

                    <mesh position={[0, -1.08, 0.12]}>
                        <boxGeometry args={[1.55, 0.28, 0.05]} />
                        <meshStandardMaterial color="#0f8c9d" metalness={0.12} roughness={0.4} />
                    </mesh>

                    <mesh position={[0, -1.08, 0.15]}>
                        <planeGeometry args={[1.22, 0.09]} />
                        <meshStandardMaterial color="#ecfdf5" roughness={0.8} metalness={0} />
                    </mesh>
                </group>
            </group>

            <ContactShadows position={[0, -2.45, 0]} opacity={0.24} scale={5.6} blur={2.6} far={3.2} />
        </>
    );
}

export function PavolHeroBadge3D({ alt = 'Pavol Hejný' }: { alt?: string }) {
    const pointer = useRef({ x: 0, y: 0 });

    return (
        <PavolHeroBadgeShell className="h-[540px]" innerClassName="p-0">
            <div
                role="img"
                aria-label={alt}
                className="relative z-10 h-full"
                onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();

                    pointer.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
                    pointer.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
                }}
                onMouseLeave={() => {
                    pointer.current.x = 0;
                    pointer.current.y = 0;
                }}
            >
                <Canvas camera={{ position: [0, 0.15, 7.4], fov: 28 }} dpr={[1, 1.5]}>
                    <Suspense fallback={null}>
                        <BadgeScene pointer={pointer} />
                    </Suspense>
                </Canvas>
                <div className="pointer-events-none absolute inset-x-10 bottom-6 h-10 rounded-full bg-[var(--pavol-ink)]/10 blur-2xl" />
            </div>
        </PavolHeroBadgeShell>
    );
}

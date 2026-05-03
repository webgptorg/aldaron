'use client';

import { ContactShadows, Float, RoundedBox, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { Group, MathUtils, SRGBColorSpace } from 'three';

const BADGE_IMAGE_SRC = '/people/pavol-hejny-transparent.png';

useTexture.preload(BADGE_IMAGE_SRC);

function PavolBadgeModel() {
    const badgeRef = useRef<Group>(null);
    const badgeTexture = useTexture(BADGE_IMAGE_SRC);

    badgeTexture.colorSpace = SRGBColorSpace;

    useFrame((state, delta) => {
        if (!badgeRef.current) {
            return;
        }

        const elapsed = state.clock.elapsedTime;
        const targetRotationX = -state.pointer.y * 0.18 + Math.sin(elapsed * 0.8) * 0.04;
        const targetRotationY = state.pointer.x * 0.3 + Math.sin(elapsed * 0.55) * 0.05;
        const targetPositionY = Math.sin(elapsed * 1.25) * 0.08;

        badgeRef.current.rotation.x = MathUtils.damp(badgeRef.current.rotation.x, targetRotationX, 5, delta);
        badgeRef.current.rotation.y = MathUtils.damp(badgeRef.current.rotation.y, targetRotationY, 5, delta);
        badgeRef.current.position.y = MathUtils.damp(badgeRef.current.position.y, targetPositionY, 4, delta);
    });

    return (
        <Float rotationIntensity={0.08} floatIntensity={0.4} speed={1.8}>
            <group ref={badgeRef} position={[0, 0.05, 0]} scale={1.02}>
                <RoundedBox args={[3.55, 4.85, 0.55]} radius={0.32} smoothness={8} position={[0, 0, -0.42]}>
                    <meshStandardMaterial color="#f6ede1" roughness={0.78} metalness={0.03} />
                </RoundedBox>

                <RoundedBox args={[3.05, 4.2, 0.24]} radius={0.24} smoothness={10} castShadow receiveShadow>
                    <meshStandardMaterial color="#fffaf5" roughness={0.24} metalness={0.08} />
                </RoundedBox>

                <RoundedBox args={[2.72, 3.78, 0.05]} radius={0.18} smoothness={8} position={[0, -0.06, 0.135]}>
                    <meshStandardMaterial color="#fffefe" roughness={0.66} metalness={0.02} />
                </RoundedBox>

                <mesh position={[0, -0.02, 0.17]}>
                    <planeGeometry args={[2.54, 3.62]} />
                    <meshBasicMaterial map={badgeTexture} transparent alphaTest={0.02} toneMapped={false} />
                </mesh>

                <RoundedBox args={[1.08, 0.34, 0.12]} radius={0.13} smoothness={6} position={[0, 1.83, 0.16]}>
                    <meshStandardMaterial color="#f0e7dc" roughness={0.52} metalness={0.06} />
                </RoundedBox>

                <mesh position={[0, 2.14, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <torusGeometry args={[0.3, 0.055, 18, 48]} />
                    <meshStandardMaterial color="#d39b3d" roughness={0.38} metalness={0.4} />
                </mesh>

                <mesh position={[0, 2.14, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.16, 0.035, 16, 36]} />
                    <meshStandardMaterial color="#fffaf5" roughness={0.4} metalness={0.08} />
                </mesh>
            </group>
        </Float>
    );
}

export function PavolHeroDesktopBadge() {
    return (
        <div className="relative z-10 mx-auto aspect-[4/5] w-full max-w-[320px]">
            <Canvas camera={{ position: [0, 0.15, 7.2], fov: 22 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={1.35} />
                    <directionalLight position={[4.5, 5, 6]} intensity={2.1} color="#ffffff" castShadow />
                    <directionalLight position={[-4, -1, 3.5]} intensity={0.65} color="#f4dfb8" />
                    <pointLight position={[0, 2.5, 4]} intensity={0.9} color="#d39b3d" />
                    <PavolBadgeModel />
                    <ContactShadows position={[0, -2.7, 0]} scale={6} opacity={0.22} blur={2.4} far={5} />
                </Suspense>
            </Canvas>
        </div>
    );
}

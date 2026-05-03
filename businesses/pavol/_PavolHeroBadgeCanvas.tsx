'use client';

import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { Float, RoundedBox, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function PavolBadgeScene() {
    const badgeRef = useRef<THREE.Group>(null);
    const portraitTexture = useTexture(pavolHejny.src);

    useEffect(() => {
        portraitTexture.colorSpace = THREE.SRGBColorSpace;
        portraitTexture.anisotropy = 8;
        portraitTexture.needsUpdate = true;
    }, [portraitTexture]);

    useFrame(({ clock, pointer }, delta) => {
        const badge = badgeRef.current;

        if (!badge) {
            return;
        }

        const targetRotationX = THREE.MathUtils.clamp(pointer.y * 0.22, -0.18, 0.18);
        const targetRotationY = THREE.MathUtils.clamp(pointer.x * 0.34, -0.34, 0.34);
        const targetRotationZ = pointer.x * -0.08 + Math.sin(clock.elapsedTime * 0.9) * 0.02;

        badge.rotation.x = THREE.MathUtils.damp(badge.rotation.x, targetRotationX, 4.5, delta);
        badge.rotation.y = THREE.MathUtils.damp(badge.rotation.y, targetRotationY, 4.5, delta);
        badge.rotation.z = THREE.MathUtils.damp(badge.rotation.z, targetRotationZ, 4.5, delta);
    });

    return (
        <>
            <ambientLight intensity={1.35} />
            <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#f6ead9" />
            <directionalLight castShadow position={[3.8, 5.2, 4.6]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-4.5, -2.5, 3]} intensity={0.45} color="#f9dcb8" />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]}>
                <planeGeometry args={[7, 7]} />
                <shadowMaterial transparent opacity={0.16} />
            </mesh>

            <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.3}>
                <group ref={badgeRef}>
                    <mesh castShadow receiveShadow position={[0, 2.18, 0.02]}>
                        <torusGeometry args={[0.19, 0.055, 18, 40]} />
                        <meshStandardMaterial color="#f5ebdd" metalness={0.18} roughness={0.46} />
                    </mesh>

                    <mesh castShadow receiveShadow position={[0, 1.9, 0.02]}>
                        <boxGeometry args={[0.24, 0.34, 0.1]} />
                        <meshStandardMaterial color="#f7efe4" metalness={0.08} roughness={0.55} />
                    </mesh>

                    <RoundedBox args={[2.76, 3.64, 0.16]} radius={0.22} smoothness={5} castShadow receiveShadow>
                        <meshStandardMaterial color="#fffdfa" metalness={0.08} roughness={0.88} />
                    </RoundedBox>

                    <RoundedBox
                        args={[2.34, 3.06, 0.05]}
                        radius={0.18}
                        smoothness={5}
                        position={[0, -0.03, 0.09]}
                        castShadow
                        receiveShadow
                    >
                        <meshStandardMaterial color="#fbf3e8" metalness={0.04} roughness={0.84} />
                    </RoundedBox>

                    <RoundedBox
                        args={[1.62, 0.2, 0.04]}
                        radius={0.06}
                        smoothness={4}
                        position={[0, 1.34, 0.12]}
                        castShadow
                        receiveShadow
                    >
                        <meshStandardMaterial color="#0f8c9d" metalness={0.14} roughness={0.46} />
                    </RoundedBox>

                    <RoundedBox
                        args={[1.14, 0.14, 0.04]}
                        radius={0.05}
                        smoothness={4}
                        position={[0, -1.46, 0.12]}
                        castShadow
                        receiveShadow
                    >
                        <meshStandardMaterial color="#d39b3d" metalness={0.1} roughness={0.5} />
                    </RoundedBox>

                    <mesh position={[0, -0.02, 0.14]} renderOrder={1}>
                        <planeGeometry args={[1.94, 2.76]} />
                        <meshStandardMaterial
                            map={portraitTexture}
                            transparent
                            alphaTest={0.05}
                            depthWrite={false}
                        />
                    </mesh>
                </group>
            </Float>
        </>
    );
}

export function PavolHeroBadgeCanvas() {
    return (
        <div
            className="relative z-10 h-[430px] overflow-hidden rounded-[1.5rem]"
            style={{
                backgroundImage:
                    'radial-gradient(circle at 25% 22%, rgba(15,140,157,0.16), transparent 28%), radial-gradient(circle at 72% 78%, rgba(211,155,61,0.18), transparent 26%), linear-gradient(180deg, #fffdf9 0%, #f8efe4 100%)',
            }}
        >
            <Canvas
                shadows
                dpr={[1, 1.8]}
                camera={{ position: [0, 0, 5.25], fov: 31 }}
                gl={{ alpha: true, antialias: true }}
            >
                <PavolBadgeScene />
            </Canvas>
        </div>
    );
}

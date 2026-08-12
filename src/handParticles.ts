import {
	engine,
	Transform,
	ParticleSystem,
	AvatarAttach,
	AvatarAnchorPointType,
	PBParticleSystem_BlendMode,
	PBParticleSystem_SimulationSpace,
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'

// Sparkles that spawn from the player's hands. The emitters are anchored to
// the animated hand bones via AvatarAttach, so they follow idle bob, walking
// and gestures. Particles simulate in world space, leaving a short trail
// behind the hands as they move.
export function setupHandParticles() {
	createHandEmitter(AvatarAnchorPointType.AAPT_LEFT_HAND)
	createHandEmitter(AvatarAnchorPointType.AAPT_RIGHT_HAND)
}

function createHandEmitter(anchorPointId: AvatarAnchorPointType) {
	const emitter = engine.addEntity()
	Transform.create(emitter, {})
	AvatarAttach.create(emitter, { anchorPointId }) // no avatarId = local player

	ParticleSystem.create(emitter, {
		rate: 25,
		lifetime: 1.2,
		maxParticles: 60,
		initialSize: { start: 0.03, end: 0.08 },
		sizeOverTime: { start: 1, end: 0 },
		initialVelocitySpeed: { start: 0.1, end: 0.4 },
		gravity: -0.05, // slight upward drift
		initialColor: {
			start: Color4.create(0.5, 0.8, 1, 1),
			end: Color4.create(0.9, 0.5, 1, 1),
		},
		colorOverTime: {
			start: Color4.create(1, 1, 1, 1),
			end: Color4.create(1, 1, 1, 0), // fade out
		},
		blendMode: PBParticleSystem_BlendMode.PSB_ADD,
		shape: ParticleSystem.Shape.Sphere({ radius: 0.05 }),
		// World space: spawned particles stay put, so moving hands leave a trail
		simulationSpace: PBParticleSystem_SimulationSpace.PSS_WORLD,
	})
}

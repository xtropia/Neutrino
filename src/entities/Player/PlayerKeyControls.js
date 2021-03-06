import KeyControls from "@lib/components/KeyControls"
import spawnBullet from "@entities/factories/spawnBullet"
import { clamp } from "@utils/math"

const defaultMappings = Object.freeze({
    left: [ 37, 65 ],
    up: [ 38, 87 ],
    right: [ 39, 68 ],
    down: [ 40, 83 ],
    axn: 32
})

class PlayerKeyControls extends KeyControls {
    stateSwitched = false // a helper flag for preventing multiple state updates every frame making sure the first one gets precendence 
    jumpVel = -260
    constructor(speed=100, mappings=defaultMappings) {
        super(mappings)
        this.speed = speed
        this.states = {
            offEdge: new OffEdge(this),
            jumping: new Jumping(this),
            rolling: new Rolling(this),
        }
        this.state = this.states.jumping
    }
    cleanup() {
        this.reset() // reset pressed attribute on all keys
        this.stateSwitched = false // reset stateSwitched for the next frame
    }
    switchState(name, ...params) {
        if (this.stateSwitched || name === this.state.name) { return } // disallow state switching more than once every frame
        this.state.onExit && this.state.onExit() // execute previous state's onExit hook, in case there's one
        this.state = this.states[name]
        this.state.onEnter && this.state.onEnter(...params)
        this.stateSwitched = true
    }
    update(entity, dt) {
        this.state.update(entity, dt)
        this.cleanup()
    }
}

class Rolling {
    name = "rolling"
    constructor(controls) {
        this.controls = controls
    }
    onEnter() {
    }
    update(entity, dt) {
        if (this.controls.get("left")) {
            entity.velX -= this.controls.speed * dt
        }
        if (this.controls.get("right")) {
            entity.velX += this.controls.speed * dt
        }
        if (this.controls.get("up")) {
            this.controls.switchState("jumping", entity)
        }
        // if (this.controls.get("axn", "pressed")) {
        //     spawnBullet({ x: entity.pos.x + entity.width, y: entity.pos.y + entity.height / 2 }, this.explosionSFX)
        // }
    }
}


class Jumping {
    name = "jumping"
    constructor(controls) {
        this.controls = controls
    }
    onEnter(entity) {
        entity.velY += this.controls.jumpVel
        this.limitReached = false
    }
    update(entity, dt) {
        if (this.controls.get("left")) {
            entity.velX -= this.controls.speed * dt / 2 
        }
        if (this.controls.get("right")) {
            entity.velX += this.controls.speed * dt / 2
        }
        if (this.controls.get("up")) {
            if (this.limitReached) { return }
            entity.velY = this.controls.jumpVel * dt + entity.velY
        } else { this.limitReached = true } // if the player has stopped pressing "up" key, that's as much velocity as he'll attain in this jump
    }
}

class OffEdge {
    name = "offEdge"
    constructor(controls, timeout = 0.125) {
        this.controls = controls
        this.timeout = timeout
    }
    update(entity, dt) {
        if (this.controls.get("left")) { // off the right edge
            entity.velX -= this.controls.speed * dt
        }
        if (this.controls.get("right")) { // off the left edge 
            entity.velX += this.controls.speed * dt
        }
        entity.velX = clamp(-100, 100, entity.velX) 
    }
}

export default PlayerKeyControls
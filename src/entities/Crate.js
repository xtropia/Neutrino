import Texture from "@lib/entities/Texture"
import Collision from "@components/Collision"
import Movement from "@components/Movement"
import config from "@config"
import { pickOne } from "@utils/math"

import cartonDarkImg from "@assets/images/cartonDark.png"

class Crate extends Texture {
    constructor({ width = 50, height = 50, ...nodeProps } = {}) {
        super({ imgId: cartonDarkImg, ...nodeProps })
        // this.fill = "lemonchiffon"
        // this.stroke = "orange"
        this.width = width
        this.height = height
        this.smooth = true
        // this.hitbox = { x: 2, y: 2, width: this.width - 2, height: this.height - 2 }
        // this.rotation = pickOne([ 0, 90, 180, 270 ])
        // this.anchor = { x: 25, y: 25 }
        this.wallCollision = new Collision({ entity: this, blocks: "col-rects", rigid: true, movable: false, onHit: (block, _, movY) => {
        } })
        Movement.makeMovable(this, { accY: config.gravity, fricX: 10 })
    }
    update(dt) {
        Movement.update(this, dt)
        this.wallCollision.update()
        // Math.random() < 1/ 1000 && (
        //     console.log({ x: this.pos.x - this.prevPosX, y: this.pos.y - this.prevPosY})
        // )
    }
}

export default Crate
import Sound from "./index"
import SoundPool from "./SoundPool"
import SoundGroup from "./SoundGroup"

const toUsableFormat = meta => { // derive a new meta that our engine can use
    const frames = Object.keys(meta.spritemap)
    return frames.reduce((output, curFrame) => {
        const { start, end } = meta.spritemap[curFrame]
        output[curFrame] = { start, duration: end - start }
        return output
    }, {})
}

class SoundSprite {
    static onCreated() { } // on sound object created
    static onDestroyed() { } // on sound object destroyed
    constructor({ resource, resourceID, meta }) {
        if (!resource) { throw new Error(`Null audio resource: ${resourceID}`) }
        this.meta = toUsableFormat(meta)
        this.resource = resource
    }
    create(frame, opts) {
        const { meta, resource } = this
        const newSound = new Sound(resource, opts)
        newSound.play = newSound.play.bind(newSound, meta[frame].start, meta[frame].duration)
        SoundSprite.onCreated(newSound)
        return newSound
    }
    createPool(frame, opts = {}) {
        const newPool = new SoundPool({ 
            resource: this.resource,
            ...this.meta[frame], // destructuring to get start and duration props
            ...opts
        })
        SoundSprite.onCreated(newPool)
        return newPool
    }
    createGroup(frames, poolSize) {
        const mutations = frames.map(frame => this.createPool(frame, poolSize))
        const newGroup = new SoundGroup(mutations)
        SoundSprite.onCreated(newGroup)
        return newGroup
    }
    destroy(soundObj) {
        SoundSprite.onDestroyed(soundObj)
    }
}

export default SoundSprite
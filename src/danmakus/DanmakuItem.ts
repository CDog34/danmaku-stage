interface IDanmakuInitOptions {
    cvs: HTMLCanvasElement,
    content: string,
    fontSize?: number,
    color?: string,
    fontFamily?: string,
    top?: number
}

export abstract class DanmakuItemBase {
    protected cvs: HTMLCanvasElement = null
    protected text: string = ''
    protected color: string = 'white'
    protected fontSize: number = 25
    protected xPos: number = 0
    protected yPos: number = 0
    protected mWidth: number = 0
    protected state: 'moveIn' | 'active' | 'inactive' = 'moveIn'
    private fontFamily: string = 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif'

    constructor (options: IDanmakuInitOptions) {
        this.cvs = options.cvs
        this.text = options.content
        if (options.color) {
            this.color = options.color
        }
        if (options.fontSize) {
            this.fontSize = options.fontSize
        }
        if (options.fontFamily) {
            this.fontFamily = options.fontFamily
        }
        if (options.top) {
            this.yPos = options.top
        }
    }

    public get isMovingIn () {
        return this.state === 'moveIn'
    }

    public get isActive () {
        return this.state !== 'inactive'
    }

    protected get renderXPos () {
        return this.xPos
    }

    protected get renderYPos () {
        return this.yPos + this.fontSize
    }

    protected get font () {
        return `${this.fontSize}px ${this.fontFamily}`
    }

    protected get speed () {
        if (!this.mWidth) {
            return 0
        }
        return (this.cvs.width + this.mWidth) / (8 + (this.cvs.width - 1920) / 500)
    }

    drawFrame () {
        if (this.state === 'inactive') {
            return
        }
        const ctx = this.cvs.getContext('2d')
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.font = this.font
        if (!this.mWidth) {
            this.mWidth = ctx.measureText(this.text).width
        }
        ctx.fillText(this.text, this.renderXPos, this.renderYPos)
        ctx.closePath()
    }

    abstract calcFrame (secondDruation: number)

    public destory () {
        this.state = 'inactive'
        this.cvs = null
    }

}

export class DanmakuItemRight extends DanmakuItemBase {

    constructor (options: IDanmakuInitOptions) {
        super(options)
        this.xPos = this.cvs.width
    }


    calcFrame (secondDruation: number) {
        if (this.state === 'inactive') {
            return
        }
        this.xPos -= this.speed * secondDruation
        if (this.xPos < -this.mWidth) {
            this.state = 'inactive'
            this.destory()
        }
        if (this.state === 'moveIn' && !!this.mWidth && (this.xPos < this.cvs.width - this.mWidth - 10)) {
            this.state = 'active'
        }
    }
}

export class DanmakuItemLeft extends DanmakuItemBase {

    constructor (options: IDanmakuInitOptions) {
        super(options)
        this.xPos = 0
    }

    protected get renderXPos () {
        return this.xPos - this.mWidth
    }

    calcFrame (secondDruation: number) {
        if (this.state === 'inactive') {
            return
        }
        this.xPos += this.speed * secondDruation
        if (this.xPos > this.cvs.width + this.mWidth) {
            this.state = 'inactive'
            this.destory()
        }
        if (this.state === 'moveIn' && !!this.mWidth && (this.xPos > this.mWidth)) {
            this.state = 'active'
        }
    }
}

export class DanmakuItemCenter extends DanmakuItemBase {
    private currentDuration = 0

    constructor (options: IDanmakuInitOptions) {
        super(options)
        this.xPos = this.cvs.width / 2
        this.state = 'active'
    }

    get durationTarget () {
        return (this.cvs.width + this.mWidth) / super.speed
    }

    protected get renderXPos () {
        return this.xPos - this.mWidth / 2
    }

    protected get speed (): number | number {
        return 0
    }

    calcFrame (secondDruation: number) {
        if (this.state === 'inactive') {
            return
        }
        this.currentDuration += secondDruation
        if (this.currentDuration >= this.durationTarget) {
            this.state = 'inactive'
            this.destory()
        }
    }
}

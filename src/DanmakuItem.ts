interface IDanmakuInitOptions {
    cvs: HTMLCanvasElement,
    content: string,
    fontSize?: number,
    color?: string,
    fontFamily?: string,
    top?: number
}

export class DanmakuItem {
    private cvs: HTMLCanvasElement = null
    private text: string = ''
    private color: string = 'white'
    private fontSize: number = 25
    private fontFamily: string = 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif'
    private xPos: number = 0
    private yPos: number = 0
    private mWidth: number = 0
    private state: 'moveIn' | 'active' | 'inactive' = 'moveIn'

    public get isMovingIn () {
        return this.state === 'moveIn'
    }

    private get font () {
        return `${this.fontSize}px ${this.fontFamily}`
    }

    public get isActive () {
        return this.state !== 'inactive'
    }

    private get speed () {
        if (!this.mWidth) {
            return 0
        }
        return (this.cvs.width + this.mWidth) / (8 + (this.cvs.width - 1920) / 500)
    }

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
        this.xPos = this.cvs.width
    }

    drawFrame () {
        const ctx = this.cvs.getContext('2d')
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.font = this.font
        if (!this.mWidth) {
            this.mWidth = ctx.measureText(this.text).width
        }
        ctx.fillText(this.text, this.xPos, this.yPos + this.fontSize)
        ctx.closePath()
    }

    calcFrame (secondDruation: number) {
        this.xPos -= this.speed * secondDruation
        if (this.xPos < -this.mWidth) {
            this.state = 'inactive'
        }
        if (this.state === 'moveIn' && !!this.mWidth && (this.xPos < this.cvs.width - this.mWidth - 10)) {
            this.state = 'active'
        }
    }
}

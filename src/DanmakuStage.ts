import { DanmakuItem } from './DanmakuItem'

interface IDanmakuStageOptions {
    parentElement: HTMLElement,
    listenResize?: boolean
}

interface IDanmakuRawItem {
    content: string
}

export class DanmakuStage {
    private cvs: HTMLCanvasElement = null
    private parentEle: HTMLElement = null
    private resizeTimer = null
    private lastTS: number = 0
    private state: 'ready' | 'running' = 'ready'
    private dmks: IDanmakuRawItem[] = []
    private railHeight: number = 30
    private renderStage: DanmakuItem[][] = []

    constructor (options: IDanmakuStageOptions) {
        this.parentEle = options.parentElement
        this.createCvs()
        this.balanceRenderStage()
        if (options.listenResize) {
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimer)
                this.resizeTimer = setTimeout(() => {
                    this.setCvsSize()
                    this.balanceRenderStage()
                }, 100)
            })
        }
    }

    get currentDensity () {
        return this.renderStage.reduce((pv, cv) => pv + cv.length, 0)
    }

    get queueLength () {
        return this.dmks.length
    }

    private balanceRenderStage () {
        const railCount = Math.floor(this.cvs.height / this.railHeight)
        const distance = railCount - this.renderStage.length
        if (distance > 0) {
            for (let i = 0; i < distance; i++) {
                this.renderStage.push([])
            }
        } else {
            this.renderStage = this.renderStage.slice(0, railCount)
        }
    }

    private createCvs () {
        if (this.cvs || !this.parentEle) {
            return
        }
        this.cvs = document.createElement('canvas')
        this.setCvsSize()
        this.parentEle.appendChild(this.cvs)
    }

    private setCvsSize () {
        if (!this.cvs || !this.parentEle) {
            return
        }
        this.cvs.width = this.parentEle.clientWidth
        this.cvs.height = this.parentEle.clientHeight
    }

    public appendDanmaku (dmk: IDanmakuRawItem) {
        this.dmks.push(dmk)
    }

    private calcFrame () {
        const now = Date.now()
        const secondDuration = (now - this.lastTS) / 1000
        this.lastTS = now
        const disableBalance = this.dmks.length > 500
        this.renderStage.forEach((rail, i) => {
            this.addDanmakuToRail(rail, i, disableBalance)
            rail.forEach(dmk => dmk.calcFrame(secondDuration))
            this.renderStage[i] = rail.filter(dmk => dmk.isActive)
        })
    }

    private addDanmakuToRail (rail: DanmakuItem[], index: number, disableBalance: boolean = false) {
        if (!this.dmks.length) {
            return
        }
        if (!disableBalance && rail.length > 0 && rail[rail.length - 1].isMovingIn) {
            return
        }
        const d = this.dmks.shift()
        rail.push(new DanmakuItem({
            cvs: this.cvs,
            content: d.content,
            top: index * this.railHeight
        }))
    }

    private drawFrame () {
        const ctx = this.cvs.getContext('2d')
        ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
        this.renderStage.forEach(rail => rail.forEach(dmk => dmk.drawFrame()))
    }

    private renderTick () {
        if (this.state !== 'running') {
            return
        }
        this.calcFrame()
        this.drawFrame()
        window.requestAnimationFrame(this.renderTick.bind(this))
    }

    public startRender () {
        if (this.state === 'running') {
            return
        }
        this.state = 'running'
        this.lastTS = Date.now()
        window.requestAnimationFrame(this.renderTick.bind(this))
    }
}

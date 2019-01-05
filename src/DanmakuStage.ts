import { DanmakuItemCenter, DanmakuItemLeft, DanmakuItemRight } from './danmakus/DanmakuItem'

interface IDanmakuStageOptions {
    parentElement: HTMLElement,
    listenResize?: boolean
}

interface IDanmakuRawItem {
    content: string
}

interface IDanmakuRail {
    left: DanmakuItemLeft[],
    right: DanmakuItemRight[],
    center: DanmakuItemCenter | null
}

export class DanmakuStage {
    private cvs: HTMLCanvasElement = null
    private parentEle: HTMLElement = null
    private resizeTimer = null
    private lastTS: number = 0
    private state: 'ready' | 'running' = 'ready'
    private dmks: IDanmakuRawItem[] = []
    private railHeight: number = 30
    private renderStage: IDanmakuRail[] = []

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
        return this.renderStage.reduce((pv, cv) => pv + cv.left.length + cv.right.length + (cv.center ? 1 : 0), 0)
    }

    get queueLength () {
        return this.dmks.length
    }

    static purgeRail (rail: IDanmakuRail) {
        rail.left = rail.left.filter(dmk => dmk.isActive)
        rail.right = rail.right.filter(dmk => dmk.isActive)
        if (rail.center && !rail.center.isActive) {
            rail.center = null
        }
    }

    static drawRail (rail: IDanmakuRail) {
        rail.left.forEach(dmk => dmk.drawFrame())
        rail.right.forEach(dmk => dmk.drawFrame())
        rail.center && rail.center.drawFrame()
    }

    public appendDanmaku (dmk: IDanmakuRawItem) {
        this.dmks.push(dmk)
    }

    public startRender () {
        if (this.state === 'running') {
            return
        }
        this.state = 'running'
        this.lastTS = Date.now()
        window.requestAnimationFrame(this.renderTick.bind(this))
    }

    private balanceRenderStage () {
        const railCount = Math.floor(this.cvs.height / this.railHeight)
        const distance = railCount - this.renderStage.length
        if (distance > 0) {
            for (let i = 0; i < distance; i++) {
                this.renderStage.push({
                    left: [],
                    right: [],
                    center: null
                })
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

    private calcFrame () {
        const now = Date.now()
        const secondDuration = (now - this.lastTS) / 1000
        this.lastTS = now
        const disableBalance = this.dmks.length > 500
        this.renderStage.forEach((rail, i) => {
            this.addDanmakuToRail(rail, i, disableBalance)
            this.calcRail(rail, secondDuration)
            DanmakuStage.purgeRail(rail)
        })
    }

    private calcRail (rail: IDanmakuRail, secondDuration: number) {
        rail.left.forEach(dmk => dmk.calcFrame(secondDuration))
        rail.right.forEach(dmk => dmk.calcFrame(secondDuration))
        rail.center && rail.center.calcFrame(secondDuration)
    }

    private addDanmakuToRail (rail: IDanmakuRail, index: number, disableBalance: boolean = false) {
        if (!this.dmks.length) {
            return
        }
        if (disableBalance || rail.left.length === 0 || !rail[rail.left.length - 1].isMovingIn) {
            const d = this.dmks.shift()
            rail.left.push(new DanmakuItemLeft({
                cvs: this.cvs,
                content: d.content,
                top: index * this.railHeight
            }))
        }
        if (!this.dmks.length) {
            return
        }
        if (disableBalance || rail.right.length === 0 || !rail[rail.right.length - 1].isMovingIn) {
            const d = this.dmks.shift()
            rail.right.push(new DanmakuItemRight({
                cvs: this.cvs,
                content: d.content,
                top: index * this.railHeight
            }))
        }
        if (!this.dmks.length) {
            return
        }
        if (!rail.center) {
            const d = this.dmks.shift()
            rail.center = new DanmakuItemCenter({
                cvs: this.cvs,
                content: d.content,
                top: index * this.railHeight
            })
        }
    }

    private drawFrame () {
        const ctx = this.cvs.getContext('2d')
        ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
        this.renderStage.forEach(DanmakuStage.drawRail)
    }

    private renderTick () {
        if (this.state !== 'running') {
            return
        }
        this.calcFrame()
        this.drawFrame()
        window.requestAnimationFrame(this.renderTick.bind(this))
    }
}

import { DanmakuStage } from './DanmakuStage'


function main () {
    const stage = new DanmakuStage({
        parentElement: document.getElementById('stage'),
        listenResize: true
    })
    stage.startRender()
    stage.appendDanmaku({ content: '我就是你们要见的网友' })
    window['s'] = stage
    setInterval(() => {
        document.getElementById('jy').innerText = `队列积压：${stage.queueLength}`
        document.getElementById('md').innerText = `弹幕密度：${stage.currentDensity}`
    }, 100)
}

main()

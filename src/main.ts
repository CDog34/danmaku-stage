import { DanmakuStage } from './DanmakuStage'


function main () {
    const stage = new DanmakuStage({
        parentElement: document.getElementById('stage'),
        listenResize: true
    })
    stage.startRender()
    stage.appendDanmaku({ content: '我在右边', type: 'right' })
    stage.appendDanmaku({ content: '我在中间', type: 'center' })
    stage.appendDanmaku({ content: '我在左边', type: 'left' })
    window['s'] = stage
    setInterval(() => {
        document.getElementById('jy').innerText = `队列积压：${stage.queueLength}`
        document.getElementById('md').innerText = `弹幕密度：${stage.currentDensity}`
    }, 100)
}

main()

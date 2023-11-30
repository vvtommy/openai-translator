import '../enable-dev-hmr'
import { createRoot } from 'react-dom/client'
import { Translator } from '../../common/components/Translator'
import { Client as Styletron } from 'styletron-engine-atomic'
import '../../common/i18n.js'
import './index.css'
import { PREFIX } from '../../common/constants'
import { useTheme } from '../../common/hooks/useTheme'
import { useState, useEffect } from 'react'
import { PopupWidthMax, PopupHeightMax } from '../../common/chromium'

const engine = new Styletron({
    prefix: `${PREFIX}-styletron-`,
})

const root = createRoot(document.getElementById('root') as HTMLElement)

// same as `src/browser-extension/popup/index.html`
const DefaultWidth = 700
const DefaultHeight = 600
const SafeDistance = 0
const pixelRatio = window.devicePixelRatio || 1
const zoomPatchNeeded = (() => {
    if (pixelRatio === 1) {
        return false
    }
    try {
        const { matches } = window.matchMedia(`(min-width: ${DefaultWidth}px)`)
        console.log(`$$$match = ${matches}`)
        return !matches
    } catch (_e) {
        return false
    }
})()

function usePopupResize() {
    const [done, setDone] = useState(!zoomPatchNeeded)
    useEffect(
        () => {
            console.log(`usePopupResize: pixelRatio = ${pixelRatio}`)
            if (!zoomPatchNeeded) {
                return
            }

            const { body: bodyTag } = document
            const newWidth = Math.min(Math.floor(PopupWidthMax / pixelRatio) - SafeDistance * pixelRatio, DefaultWidth)
            const newHeight = Math.min(
                Math.floor(PopupHeightMax / pixelRatio) - SafeDistance * pixelRatio,
                DefaultHeight
            )
            bodyTag.style.cssText = `min-width: ${newWidth}px; min-height: ${newHeight}px;`
            setDone(true)
        },
        [
            /* run once */
        ]
    )

    useEffect(() => {
        if (!done) {
            return
        }
        document.body.className = 'ready'
    }, [done])

    return done
}

function App() {
    const { theme } = useTheme()

    console.log('render$$$')

    const resizeDone = usePopupResize()
    if (!resizeDone) {
        return null
    }

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '100vh',
                background: theme.colors.backgroundPrimary,
            }}
            data-testid='popup-container'
        >
            <Translator showSettings defaultShowSettings text='' engine={engine} autoFocus />
        </div>
    )
}

root.render(<App />)

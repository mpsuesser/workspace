import { useCallback, useEffect, useState } from 'react'
import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite'
import { DefaultColorStyle, DefaultColorThemePalette, Editor, getSnapshot, TLUiComponents, Tldraw, useValue } from 'tldraw'

const assetUrls = getAssetUrlsByImport()
const PERSISTENCE_KEY = 'pi-sketch-tldraw'

type SketchColor = 'black' | 'grey' | 'blue' | 'green' | 'red'

const components: TLUiComponents = {
  ContextMenu: null,
}

const COLOR_OPTIONS = [
  { value: 'black', label: 'black', swatch: DefaultColorThemePalette.lightMode.black.solid },
  { value: 'grey', label: 'gray', swatch: DefaultColorThemePalette.lightMode.grey.solid },
  { value: 'blue', label: 'blue', swatch: DefaultColorThemePalette.lightMode.blue.solid },
  { value: 'green', label: 'green', swatch: DefaultColorThemePalette.lightMode.green.solid },
  { value: 'red', label: 'red', swatch: DefaultColorThemePalette.lightMode.red.solid },
] as const satisfies readonly { value: SketchColor; label: string; swatch: string }[]

const COLOR_VALUES: SketchColor[] = COLOR_OPTIONS.map((option) => option.value)

const controlClusterClass = 'flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:gap-3'
const buttonBaseClass =
  'min-w-0 flex-1 basis-0 appearance-none border-0 rounded-none px-4 py-2 text-[14px] leading-[1.2] text-white transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-[0.55] sm:flex-none'
const secondaryButtonClass = `${buttonBaseClass} bg-[#333] hover:bg-[#444] disabled:hover:bg-[#333]`
const primaryButtonClass = `${buttonBaseClass} bg-[#2563eb] hover:bg-[#1d4ed8] disabled:hover:bg-[#2563eb]`
const swatchButtonClass =
  'relative h-8 w-8 appearance-none border border-black/20 rounded-none transition-transform hover:scale-105 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:hover:scale-100'

export default function App() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [activeColor, setActiveColor] = useState<SketchColor>('black')
  const [submitting, setSubmitting] = useState(false)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  const applyColor = useCallback(
    (color: SketchColor) => {
      setActiveColor(color)
      if (!editor) return
      setEditorColor(editor, color)
    },
    [editor]
  )

  const shiftColor = useCallback(
    (direction: -1 | 1) => {
      const currentIndex = COLOR_VALUES.indexOf(activeColor)
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), COLOR_VALUES.length - 1)
      const nextColor = COLOR_VALUES[nextIndex] ?? activeColor
      applyColor(nextColor)
    },
    [activeColor, applyColor]
  )

  const clearCanvas = useCallback(() => {
    if (!editor) return

    const shapeIds = [...editor.getCurrentPageShapeIds()]
    if (shapeIds.length === 0) return
    if (!window.confirm('Clear the current canvas?')) return

    editor.selectNone()
    editor.deleteShapes(shapeIds)
    editor.setCurrentTool('draw')
  }, [editor])

  const cancelSketch = useCallback(async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      await fetch('/cancel', { method: 'POST' })
    } catch {
      // Ignore network errors while shutting down.
    }

    setDoneMessage('Sketch cancelled. You can close this tab and return to pi.')
    setTimeout(() => window.close(), 120)
  }, [submitting])

  const submitSketch = useCallback(async () => {
    if (!editor || submitting) return

    const shapeIds = [...editor.getCurrentPageShapeIds()]
    if (shapeIds.length === 0) {
      window.alert('Add something to the canvas before sending it to pi.')
      return
    }

    setSubmitting(true)

    try {
      const { blob } = await editor.toImage(shapeIds, {
        format: 'png',
        background: true,
        padding: 32,
      })

      const pngBase64 = await blobToBase64(blob)
      const snapshot = getSnapshot(editor.store)

      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pngBase64, snapshot }),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit sketch (${response.status})`)
      }

      setDoneMessage('Sketch sent to pi. You can close this tab and continue in the terminal.')
      setTimeout(() => window.close(), 120)
    } catch (error) {
      setSubmitting(false)
      window.alert(error instanceof Error ? error.message : String(error))
    }
  }, [editor, submitting])

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor)
    setActiveColor('black')
    editor.selectNone()
    editor.setCurrentTool('draw')
    editor.setStyleForNextShapes(DefaultColorStyle, 'black')
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.isContentEditable) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void submitSketch()
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey || !event.shiftKey) return

      if (event.code === 'KeyA') {
        event.preventDefault()
        shiftColor(-1)
        return
      }

      if (event.code === 'KeyD') {
        event.preventDefault()
        shiftColor(1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shiftColor, submitSketch])

  useEffect(() => {
    const onBeforeUnload = () => {
      if (!doneMessage) {
        navigator.sendBeacon('/cancel')
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [doneMessage])

  if (doneMessage) {
    return <DoneScreen message={doneMessage} />
  }

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="flex h-full w-full min-h-0 flex-col">
        <div className="flex justify-center pb-4">
          <SketchControls
            editor={editor}
            clearCanvas={clearCanvas}
            cancelSketch={cancelSketch}
            submitSketch={submitSketch}
            submitting={submitting}
          />
        </div>

        <div className="grid min-h-0 flex-1 place-items-center">
          <div className="my-[5px] aspect-[5/3] w-[1000px] max-h-full max-w-[calc(100vw-40px)] flex-none bg-white shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <Tldraw
              assetUrls={assetUrls}
              autoFocus
              components={components}
              hideUi
              onMount={handleMount}
              persistenceKey={PERSISTENCE_KEY}
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <ColorPalette activeColor={activeColor} onSelectColor={applyColor} />
        </div>
      </div>
    </div>
  )
}

function SketchControls({
  editor,
  clearCanvas,
  cancelSketch,
  submitSketch,
  submitting,
}: {
  editor: Editor | null
  clearCanvas: () => void
  cancelSketch: () => Promise<void>
  submitSketch: () => Promise<void>
  submitting: boolean
}) {
  const shapeCount = useValue('shape count', () => editor?.getCurrentPageShapeIds().size ?? 0, [editor])

  return (
    <div className="flex w-full items-center justify-center sm:w-auto">
      <div className={controlClusterClass}>
        <button className={secondaryButtonClass} disabled={submitting || shapeCount === 0} onClick={clearCanvas} type="button">
          Clear
        </button>
        <button className={secondaryButtonClass} disabled={submitting} onClick={() => void cancelSketch()} type="button">
          Cancel
        </button>
        <button
          className={primaryButtonClass}
          disabled={submitting || shapeCount === 0}
          onClick={() => void submitSketch()}
          type="button"
        >
          {submitting ? 'Sending…' : 'Send to pi'}
        </button>
      </div>
    </div>
  )
}

function ColorPalette({
  activeColor,
  onSelectColor,
}: {
  activeColor: SketchColor
  onSelectColor: (color: SketchColor) => void
}) {
  return (
    <div className="flex w-full items-center justify-center sm:w-auto">
      <div className={controlClusterClass}>
        {COLOR_OPTIONS.map((option) => {
          const isActive = option.value === activeColor

          return (
            <button
              key={option.value}
              aria-label={`Use ${option.label}`}
              aria-pressed={isActive}
              className={`${swatchButtonClass} ${isActive ? 'outline outline-2 outline-offset-2 outline-white' : ''}`}
              onClick={() => onSelectColor(option.value)}
              style={{ backgroundColor: option.swatch }}
              title={option.label}
              type="button"
            >
              {isActive ? <span className="pointer-events-none absolute inset-[6px] border border-white/80" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DoneScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#1a1a1a] p-6 text-white">
      <div className="max-w-[460px]">
        <p className="m-0 leading-6">{message}</p>
      </div>
    </div>
  )
}

function setEditorColor(editor: Editor, color: SketchColor) {
  editor.setStyleForNextShapes(DefaultColorStyle, color)

  if (editor.getSelectedShapeIds().length > 0) {
    editor.setStyleForSelectedShapes(DefaultColorStyle, color)
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read exported sketch image'))
    }

    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Exported sketch did not produce a data URL'))
        return
      }

      const [, base64 = ''] = reader.result.split(',')
      resolve(base64)
    }

    reader.readAsDataURL(blob)
  })
}

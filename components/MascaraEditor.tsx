'use client'

import { useRef, useEffect, useCallback } from 'react'

interface MascaraEditorProps {
  value: string
  onChange: (html: string) => void
}

export default function MascaraEditor({ value, onChange }: MascaraEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // preventDefault on mousedown keeps editor focus/selection intact
  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val)
    handleInput()
  }

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, `<${tag}>`)
    handleInput()
  }

  const btnClass =
    'px-3 py-2 rounded text-xs font-semibold transition-all bg-surface2 text-text2 hover:bg-border2 hover:text-text select-none'

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-surface border-b border-border">
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('bold')} className={btnClass} title="Negrito (Ctrl+B)">
          <b>N</b>
        </button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('italic')} className={btnClass} title="Itálico (Ctrl+I)">
          <i>I</i>
        </button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('underline')} className={btnClass} title="Sublinhado (Ctrl+U)">
          <u>S</u>
        </button>

        <div className="w-px bg-border mx-1" />

        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('justifyLeft')} className={btnClass} title="Alinhar à esquerda">
          Esquerda
        </button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('justifyCenter')} className={btnClass} title="Centralizar">
          Centro
        </button>

        <div className="w-px bg-border mx-1" />

        <button type="button" onMouseDown={preventFocusLoss} onClick={() => formatBlock('h2')} className={btnClass} title="Título grande">
          Título
        </button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => formatBlock('h3')} className={btnClass} title="Seção">
          Seção
        </button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => formatBlock('p')} className={btnClass} title="Texto normal">
          Normal
        </button>

        <div className="w-px bg-border mx-1" />

        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('insertUnorderedList')} className={btnClass} title="Lista">
          Lista
        </button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => exec('insertHorizontalRule')} className={btnClass} title="Linha separadora">
          Linha
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] px-8 py-6 bg-bg2 text-text text-sm leading-relaxed focus:outline-none mascara-content"
        suppressContentEditableWarning
      />
    </div>
  )
}

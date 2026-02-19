'use client'

import { useRef, useEffect, useState } from 'react'
import { SPECS } from '@/lib/specs'

interface SpecBarProps {
  currentSpec: string
  currentSubArea: string
  usesFirebase: boolean
  onSpecChange: (spec: string) => void
  onSubAreaChange: (sub: string) => void
}

export default function SpecBar({ currentSpec, currentSubArea, usesFirebase, onSpecChange, onSubAreaChange }: SpecBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownLeft, setDropdownLeft] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const handleSpecChange = (spec: string) => {
    if (currentSpec === spec && usesFirebase) {
      setDropdownOpen(!dropdownOpen)
    } else {
      onSpecChange(spec)
      if (usesFirebase) {
        setDropdownOpen(true)
      } else {
        setDropdownOpen(false)
      }
    }
  }

  // Position dropdown below the active button
  useEffect(() => {
    if (dropdownOpen && buttonRef.current && barRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect()
      const barRect = barRef.current.getBoundingClientRect()
      let left = btnRect.left - barRect.left
      // Prevent dropdown from going off-screen right
      const maxLeft = barRect.width - 256 // w-64 = 256px
      if (left > maxLeft) left = maxLeft
      if (left < 0) left = 0
      setDropdownLeft(left)
    }
  }, [dropdownOpen, currentSpec])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const currentSpecData = SPECS[currentSpec as keyof typeof SPECS]

  return (
    <div ref={barRef} className="fixed top-16 left-0 right-0 bg-surface border-b border-accent/30" style={{ zIndex: 55 }}>
      {/* Scrollable specialty buttons */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {Object.entries(SPECS).map(([key, spec]) => (
          <button
            key={key}
            ref={currentSpec === key ? buttonRef : null}
            onClick={() => handleSpecChange(key)}
            aria-expanded={currentSpec === key && dropdownOpen}
            aria-haspopup={usesFirebase && spec.subs.length > 0 ? 'listbox' : undefined}
            className={`flex-shrink-0 px-2 sm:px-3 py-2 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
              currentSpec === key
                ? 'bg-accent text-white shadow-md'
                : 'bg-surface2 text-text2 hover:bg-border2 hover:text-text'
            }`}
          >
            <span aria-hidden="true">{spec.icon}</span> <span className="hidden sm:inline">{spec.label}</span>
            {currentSpec === key && usesFirebase && spec.subs.length > 0 && (
              <span className={`ml-1 transition-transform inline-block ${dropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
            )}
          </button>
        ))}
      </div>

      {/* Dropdown rendered OUTSIDE the overflow container */}
      {dropdownOpen && usesFirebase && currentSpecData && currentSpecData.subs.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Sub-areas"
          className="absolute w-56 sm:w-64 bg-surface border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto scrollbar-thin"
          style={{ top: '100%', left: dropdownLeft, marginTop: 8, zIndex: 60 }}
        >
          <button
            role="option"
            aria-selected={currentSubArea === 'all'}
            onClick={() => {
              onSubAreaChange('all')
              setDropdownOpen(false)
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/10 transition-colors ${
              currentSubArea === 'all' ? 'bg-accent/20 text-accent font-semibold' : 'text-text'
            }`}
          >
            Todas as sub-areas
          </button>
          {currentSpecData.subs.map(sub => (
            <button
              key={sub}
              role="option"
              aria-selected={currentSubArea === sub}
              onClick={() => {
                onSubAreaChange(sub)
                setDropdownOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/10 transition-colors ${
                currentSubArea === sub ? 'bg-accent/20 text-accent font-semibold' : 'text-text'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

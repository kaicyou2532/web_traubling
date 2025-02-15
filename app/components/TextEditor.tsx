"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link } from "lucide-react"

interface EditorProps {
  value: string
  onChange?: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  const [text, setText] = useState(value)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = text
    }
  }, [text])

  const handleCommand = (command: string) => {
    document.execCommand(command, false)
    if (editorRef.current) {
      const newText = editorRef.current.innerHTML
      setText(newText)
      onChange && onChange(newText)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      const newText = editorRef.current.innerHTML
      setText(newText)
      if (onChange) {
        onChange(newText)
      }
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 border-b p-2 bg-gray-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("underline")}>
          <Underline className="h-4 w-4" />
        </Button>
        <span className="w-px h-4 bg-gray-300 mx-2" />
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <span className="w-px h-4 bg-gray-300 mx-2" />
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleCommand("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </Button>
        <span className="w-px h-4 bg-gray-300 mx-2" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter URL:")
            if (url) handleCommand("createLink")
          }}
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
   <div 
  ref={editorRef} 
  contentEditable 
  className="p-4 min-h-[200px] focus:outline-none" 
  style={{ textAlign: "start" }}
  onInput={handleInput} 
/>


    </div>
  )
}
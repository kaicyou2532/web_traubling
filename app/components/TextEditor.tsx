"use client"

import React, { useState, useRef, useEffect } from "react"
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
  }, [])

  const handleCommand = (command: string) => {
    if (!editorRef.current) return

    document.execCommand(command, false)
    saveContent()
  }

  const saveContent = () => {
    if (editorRef.current) {
      const newText = editorRef.current.innerHTML
      setText(newText)
      onChange && onChange(newText)
    }
  }

  const handleInput = () => {
    saveContent()
  }
  

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 border-b p-2 bg-gray-50">
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("underline")}>
          <Underline className="h-4 w-4" />
        </Button>
        <span className="w-px h-4 bg-gray-300 mx-2" />
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <span className="w-px h-4 bg-gray-300 mx-2" />
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors duration-150" onClick={() => handleCommand("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </Button>
        <span className="w-px h-4 bg-gray-300 mx-2" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter URL:")
            if (url) document.execCommand("createLink", false, url)
          }}
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
      <div 
        ref={editorRef} 
        contentEditable 
        className="p-4 min-h-[200px] focus:outline-none text-left"
        style={{ textAlign: "left", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        onInput={handleInput} 
      />
    </div>
  )
}

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  showToolbar?: boolean;
  allowImages?: boolean;
  allowLinks?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  disabled = false,
  className,
  minHeight = 200,
  maxHeight = 400,
  showToolbar = true,
  allowImages = true,
  allowLinks = true,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
  }, []);

  const handleFormatToggle = useCallback(
    (format: string) => {
      handleCommand(format);
    },
    [handleCommand]
  );

  const handleLinkClick = useCallback(() => {
    const url = prompt("Enter the URL:");
    if (url) {
      handleCommand("createLink", url);
    }
  }, [handleCommand]);

  const handleImageClick = useCallback(() => {
    const url = prompt("Enter the image URL:");
    if (url) {
      handleCommand("insertImage", url);
    }
  }, [handleCommand]);

  const toolbarButtons = [
    {
      group: "format",
      buttons: [
        { icon: Bold, command: "bold", title: "Bold" },
        { icon: Italic, command: "italic", title: "Italic" },
        { icon: Underline, command: "underline", title: "Underline" },
        {
          icon: Strikethrough,
          command: "strikeThrough",
          title: "Strikethrough",
        },
      ],
    },
    {
      group: "align",
      buttons: [
        { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
        { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
        { icon: AlignRight, command: "justifyRight", title: "Align Right" },
      ],
    },
    {
      group: "list",
      buttons: [
        { icon: List, command: "insertUnorderedList", title: "Bullet List" },
        {
          icon: ListOrdered,
          command: "insertOrderedList",
          title: "Numbered List",
        },
        {
          icon: Quote,
          command: "formatBlock",
          value: "blockquote",
          title: "Quote",
        },
      ],
    },
    {
      group: "insert",
      buttons: [
        ...(allowLinks
          ? [
              {
                icon: Link,
                command: "link",
                title: "Insert Link",
                onClick: handleLinkClick,
              },
            ]
          : []),
        ...(allowImages
          ? [
              {
                icon: Image,
                command: "image",
                title: "Insert Image",
                onClick: handleImageClick,
              },
            ]
          : []),
        {
          icon: Code,
          command: "formatBlock",
          value: "pre",
          title: "Code Block",
        },
      ],
    },
    {
      group: "history",
      buttons: [
        { icon: Undo, command: "undo", title: "Undo" },
        { icon: Redo, command: "redo", title: "Redo" },
      ],
    },
  ];

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {showToolbar && (
        <div className="border-b bg-muted/50 p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {toolbarButtons.map((group, groupIndex) => (
              <div key={group.group} className="flex items-center gap-1">
                {group.buttons.map((button) => (
                  <Toggle
                    key={button.command}
                    size="sm"
                    pressed={false}
                    onPressedChange={() => {
                      if (button.onClick) {
                        button.onClick();
                      } else {
                        handleCommand(button.command, button.value);
                      }
                    }}
                    disabled={disabled}
                    title={button.title}
                  >
                    <button.icon className="h-4 w-4" />
                  </Toggle>
                ))}
                {groupIndex < toolbarButtons.length - 1 && (
                  <Separator orientation="vertical" className="h-6 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        contentEditable={!disabled}
        className={cn(
          "p-3 outline-none prose prose-sm max-w-none",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          isFocused && "ring-2 ring-ring ring-offset-2"
        )}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={(e) => {
          const target = e.target as HTMLElement;
          onChange(target.innerHTML);
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

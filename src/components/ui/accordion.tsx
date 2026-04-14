"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface AccordionContextValue {
  openItems: string[]
  toggle: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: [],
  toggle: () => {},
  type: "single",
})

interface AccordionProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  children: React.ReactNode
  className?: string
  defaultValue?: string
}

const Accordion = ({ type = "single", children, className, defaultValue }: AccordionProps) => {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultValue ? [defaultValue] : [])

  const toggle = (value: string) => {
    if (type === "single") {
      setOpenItems((prev) => (prev.includes(value) ? [] : [value]))
    } else {
      setOpenItems((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      )
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle, type }}>
      <div className={cn("divide-y divide-border", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = ({ value, children, className }: AccordionItemProps) => (
  <div className={cn("border-b", className)} data-value={value}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<{ value?: string }>, { value })
        : child
    )}
  </div>
)

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
  children: React.ReactNode
}

const AccordionTrigger = ({ value, children, className, ...props }: AccordionTriggerProps) => {
  const { openItems, toggle } = React.useContext(AccordionContext)
  const isOpen = value ? openItems.includes(value) : false

  return (
    <button
      type="button"
      onClick={() => value && toggle(value)}
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
      />
    </button>
  )
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  children: React.ReactNode
}

const AccordionContent = ({ value, children, className, ...props }: AccordionContentProps) => {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = value ? openItems.includes(value) : false

  if (!isOpen) return null

  return (
    <div className={cn("pb-4 pt-0 text-sm", className)} {...props}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

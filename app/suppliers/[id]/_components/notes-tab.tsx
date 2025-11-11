"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface NotesTabProps {
  supplierId: string
  notes: string | null
}

export default function NotesTab({ supplierId, notes: initialNotes }: NotesTabProps) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("suppliers")
        .update({ notes: notes || null })
        .eq("id", supplierId)

      if (error) throw error

      // Refresh the page to show updated notes
      router.refresh()
    } catch (error) {
      console.error("Error saving notes:", error)
      alert("Failed to save notes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notes</CardTitle>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this supplier..."
          className="min-h-[400px] resize-y"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Use this space to record important information, reminders, or observations about this
          supplier.
        </p>
      </CardContent>
    </Card>
  )
}

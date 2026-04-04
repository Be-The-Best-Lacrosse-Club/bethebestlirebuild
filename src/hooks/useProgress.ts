import { useState, useCallback } from "react"
import type { UserProgress } from "@/types"

const STORAGE_KEY = "btb-progress"

function loadAll(): Record<string, UserProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, UserProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useProgress(userId: string) {
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>(loadAll)

  const getProgress = useCallback((courseId: string): UserProgress => {
    return progressMap[`${userId}-${courseId}`] || {
      courseId,
      completedSteps: [],
      currentStep: 1,
      score: 0,
      lastAccessed: new Date().toISOString(),
    }
  }, [progressMap, userId])

  const markStepComplete = useCallback((courseId: string, stepId: string) => {
    setProgressMap((prev) => {
      const key = `${userId}-${courseId}`
      const existing = prev[key] || { courseId, completedSteps: [], currentStep: 1, score: 0, lastAccessed: "" }
      const updated = {
        ...existing,
        completedSteps: existing.completedSteps.includes(stepId)
          ? existing.completedSteps
          : [...existing.completedSteps, stepId],
        currentStep: Math.max(existing.currentStep, existing.completedSteps.length + 2),
        lastAccessed: new Date().toISOString(),
      }
      const next = { ...prev, [key]: updated }
      saveAll(next)
      return next
    })
  }, [userId])

  const getCourseCompletion = useCallback((courseId: string, totalSteps: number): number => {
    const p = getProgress(courseId)
    if (totalSteps === 0) return 0
    return Math.round((p.completedSteps.length / totalSteps) * 100)
  }, [getProgress])

  const getAllProgress = useCallback((): UserProgress[] => {
    return Object.entries(progressMap)
      .filter(([key]) => key.startsWith(`${userId}-`))
      .map(([, v]) => v)
  }, [progressMap, userId])

  return { getProgress, markStepComplete, getCourseCompletion, getAllProgress }
}

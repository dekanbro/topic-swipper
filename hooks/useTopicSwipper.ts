import { useState, useCallback } from "react"
import mockData from "../mockData.json"

interface BaseTopic {
  prompt: string
  children: BaseTopic[]
}

interface Topic extends BaseTopic {
  id: string
  parentId: string | null
  children: Topic[]  // Override children type for Topic
}

export function useTopicSwipper() {
  const processTree = (topics: BaseTopic[], parentId: string | null = null): Topic[] => {
    return topics.map((topic, index) => ({
      ...topic,
      id: parentId ? `${parentId}-${index}` : `${index}`,
      parentId,
      children: processTree(topic.children, parentId ? `${parentId}-${index}` : `${index}`)
    }))
  }

  const [topicTree, setTopicTree] = useState<Topic[]>(() => processTree(mockData))
  const [currentTopic, setCurrentTopic] = useState<Topic>(topicTree[0])
  const [history, setHistory] = useState<string[]>([topicTree[0].id])

  const isAtTop = !currentTopic.parentId // Root level topics have null parentId
  const isAtBottom = currentTopic.children.length === 0

  const findTopicById = useCallback((id: string): Topic | null => {
    if (!id) return null
    const parts = id.split('-')
    let current = topicTree[parseInt(parts[0])]
    
    for (let i = 1; i < parts.length && current; i++) {
      current = current.children[parseInt(parts[i])]
    }
    return current || null
  }, [topicTree])

  const handleSwipe = useCallback(
    (direction: "left" | "right" | "switch", topicId?: string) => {
      if (direction === "switch" && topicId) {
        // Switch directly to the specified topic
        setCurrentTopic(topicTree.find(topic => topic.id === topicId) || topicTree[0])
        return
      }
      if (direction === "left") {
        if (isAtTop) {
          // For root level, find the current root topic's index
          const rootIndex = topicTree.findIndex(topic => topic.id === currentTopic.id)
          const nextIndex = (rootIndex + 1) % topicTree.length
          setCurrentTopic(topicTree[nextIndex])
        } else if (currentTopic.parentId) {
          const parent = findTopicById(currentTopic.parentId)
          if (!parent) return
          
          const currentIndex = parseInt(currentTopic.id.split('-').pop() || '0')
          const nextIndex = (currentIndex + 1) % parent.children.length
          setCurrentTopic(parent.children[nextIndex])
        }
      } else if (direction === "right" && currentTopic.children.length > 0) {
        setHistory((prev) => [...prev, currentTopic.id])
        setCurrentTopic(currentTopic.children[0])
      }
    },
    [currentTopic, findTopicById, isAtTop, topicTree],
  )

  const goBack = useCallback(() => {
    if (history.length > 0 && currentTopic.parentId) {
      const parentId = history[history.length - 1]
      const parent = findTopicById(parentId)
      if (parent) {
        setHistory((prev) => prev.slice(0, -1))
        setCurrentTopic(parent)
      }
    }
  }, [history, currentTopic.parentId, findTopicById])

  const addTopics = useCallback(
    (parentId: string, newTopics: BaseTopic[]) => {
      setTopicTree((prevTree) => {
        const updateTopics = (topics: Topic[]): Topic[] => {
          return topics.map(topic => {
            if (topic.id === parentId) {
              const processedNewTopics = processTree(newTopics, parentId)
              const updatedTopic = { 
                ...topic, 
                children: [...topic.children, ...processedNewTopics] 
              }
              
              if (processedNewTopics.length > 0) {
                // Schedule state updates for next render
                setTimeout(() => {
                  setCurrentTopic(processedNewTopics[0])
                  setHistory(prev => [...prev, parentId])
                }, 0)
              }
              
              return updatedTopic
            }
            return { ...topic, children: updateTopics(topic.children) }
          })
        }
        
        return updateTopics(prevTree)
      })
    },
    [],  // Remove findTopicById from dependencies as it's not used
  )

  const getParentTopics = useCallback((topicId: string): Array<{ prompt: string, id: string }> => {
    const result: Array<{ prompt: string, id: string }> = []
    
    const findPath = (topic: Topic, targetId: string, path: Array<{ prompt: string, id: string }> = []): boolean => {
      if (topic.id === targetId) {
        result.push(...path)
        return true
      }
      
      for (const child of topic.children) {
        if (findPath(child, targetId, [...path, { prompt: topic.prompt, id: topic.id }])) {
          return true
        }
      }
      return false
    }

    findPath(topicTree[0], topicId)
    return result
  }, [topicTree])

  return {
    currentTopic,
    handleSwipe,
    goBack,
    addTopics,
    canGoDeeper: currentTopic.children.length > 0,
    canGoBack: !isAtTop,
    isAtTop,
    isAtBottom,
    getAllTopics: useCallback(() => topicTree, [topicTree]),
    getParentTopics,
    topicTree,
  }
}


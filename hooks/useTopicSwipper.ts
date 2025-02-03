import { useState, useCallback } from "react"
import mockData from "../mockData.json"

interface BaseTopic {
  prompt: string
  children?: BaseTopic[]  // Make children optional
}

interface Topic extends Omit<BaseTopic, 'children'> {
  id: string
  parentId: string | null
  children: Topic[]  // But make it required in final Topic
}

const defaultTopic: BaseTopic = {
  prompt: "Movies",
  children: []
}

export function useTopicSwipper() {
  const processTree = (topics: BaseTopic[], parentId: string | null = null): Topic[] => {
    return topics.map((topic, index) => ({
      ...topic,
      id: parentId ? `${parentId}-${index}` : `${index}`,
      parentId,
      children: processTree(topic.children || [], parentId ? `${parentId}-${index}` : `${index}`)
    }))
  }

  const [topicTree, setTopicTree] = useState<Topic[]>(() => {
    try {
      return processTree(mockData || [defaultTopic])
    } catch (error) {
      console.error('Error processing topic tree:', error)
      return processTree([defaultTopic])
    }
  })

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
        // Find the topic in the entire tree
        const findTopic = (topics: Topic[]): Topic | null => {
          for (const topic of topics) {
            if (topic.id === topicId) return topic
            const found = findTopic(topic.children)
            if (found) return found
          }
          return null
        }
        
        const foundTopic = findTopic(topicTree)
        if (foundTopic) {
          setCurrentTopic(foundTopic)
        }
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
    [currentTopic, findTopicById, isAtTop, topicTree]
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
      console.log('Adding topics:', { parentId, newTopics }) // Debug log

      // First process the new topics to add IDs
      const processedNewTopics = processTree(newTopics.map(topic => ({
        prompt: topic.prompt,
        children: []
      })), parentId)

      console.log('Processed topics:', processedNewTopics) // Debug log

      if (processedNewTopics.length === 0) {
        console.warn('No topics to add') // Debug log
        return
      }

      const firstNewTopic = processedNewTopics[0]
      console.log('First new topic:', firstNewTopic) // Debug log

      // Update the tree first
      setTopicTree(prevTree => {
        // If parentId is 'root', add to top level
        if (parentId === 'root') {
          return [...prevTree, ...processedNewTopics]
        }

        const updateTopics = (topics: Topic[]): Topic[] => {
          return topics.map(topic => {
            if (topic.id === parentId) {
              const updatedTopic = {
                ...topic,
                children: [...topic.children, ...processedNewTopics]
              }
              console.log('Updated parent topic:', updatedTopic) // Debug log
              return updatedTopic
            }
            return {
              ...topic,
              children: updateTopics(topic.children)
            }
          })
        }

        const newTree = updateTopics(prevTree)
        console.log('New tree:', newTree) // Debug log
        return newTree
      })

      // Then update current topic and history
      console.log('Setting current topic to:', firstNewTopic) // Debug log
      setCurrentTopic(firstNewTopic)
      setHistory(prev => {
        const newHistory = [...prev, parentId]
        console.log('New history:', newHistory) // Debug log
        return newHistory
      })
    },
    []
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


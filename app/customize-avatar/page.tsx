'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import AvatarCreator from '@/components/AvatarCreator'
import { lorelei } from '@dicebear/collection'
import type { JSONSchema7 } from 'json-schema'
import { toast } from 'react-hot-toast'
import { Switch } from '../../components/ui/switch'

interface SchemaProperty {
  type: string
  enum?: string[]
  items?: {
    enum?: string[]
  }
}

interface AvatarOption {
  type: string
  choices: string[]
}

type AvatarOptions = Record<string, AvatarOption>

type AvatarPreferences = {
  [key: string]: string | number | Array<string>
}

type OptionValue = string | number | Array<string>

// Helper function to safely get array value
const getArrayValue = (value: string | number | Array<string>, index: number): string | undefined => {
  if (Array.isArray(value)) {
    return value[index]
  }
  return undefined
}

// List of options we want to expose to users
const ALLOWED_OPTIONS = [
  'mouth', 'eyes', 'hair', 'hairColor', 'skinColor', 
  'freckles', 'glasses', 'beard',
  'earrings', 'earringsColor',
  'eyebrows', 'eyebrowsColor',
  'eyesColor',
  'hairAccessories', 'hairAccessoriesColor',
  'head',
  'mouthColor',
  'nose', 'noseColor'
] as const

type OptionKey = typeof ALLOWED_OPTIONS[number]

// Nice display names for options
const OPTION_LABELS: Record<OptionKey, string> = {
  mouth: 'Mouth Style',
  eyes: 'Eye Style',
  hair: 'Hair Style',
  hairColor: 'Hair Color',
  skinColor: 'Skin Tone',
  freckles: 'Freckles',
  glasses: 'Glasses',
  beard: 'Beard',
  earrings: 'Earrings',
  earringsColor: 'Earrings Color',
  eyebrows: 'Eyebrows Style',
  eyebrowsColor: 'Eyebrows Color',
  eyesColor: 'Eyes Color',
  hairAccessories: 'Hair Accessories',
  hairAccessoriesColor: 'Accessories Color',
  head: 'Head Shape',
  mouthColor: 'Mouth Color',
  nose: 'Nose Style',
  noseColor: 'Nose Color'
}

// Group related options together
const OPTION_GROUPS = [
  {
    title: 'Base Features',
    options: ['head', 'skinColor']
  },
  {
    title: 'Hair & Accessories',
    options: ['hair', 'hairColor', 'hairAccessories', 'hairAccessoriesColor']
  },
  {
    title: 'Face',
    options: ['eyes', 'eyesColor', 'eyebrows', 'eyebrowsColor', 'nose', 'noseColor', 'mouth', 'mouthColor']
  },
  {
    title: 'Accessories',
    options: ['glasses', 'earrings', 'earringsColor']
  },
  {
    title: 'Additional Features',
    options: ['beard', 'freckles']
  }
] as const

// Define default skin colors with white as default
const DEFAULT_SKIN_COLORS = [
  'ffffff', // White (default)
  'f2d3b1', // Light
  'd1a3a4', // Medium
  'c58c85', // Dark
  'a58b80', // Deep
] as const

export default function CustomizeAvatarPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin')
    }
  })

  const router = useRouter()
  const [options, setOptions] = useState<AvatarOptions>({})
  const [selectedOptions, setSelectedOptions] = useState<AvatarPreferences>({
    skinColor: ['ffffff'], // Set white as default
  })
  const [isSaving, setIsSaving] = useState(false)
  const userEmail = session?.user?.email || ''

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('avatarPreferences')
    if (savedPrefs) {
      setSelectedOptions(JSON.parse(savedPrefs))
    }

    // Get all available options from the schema
    const schemaProperties = {
      ...((lorelei.schema as JSONSchema7).properties || {})
    }

    const processedOptions: AvatarOptions = {}
    for (const [key, prop] of Object.entries(schemaProperties)) {
      // Only process allowed options
      if (ALLOWED_OPTIONS.includes(key as OptionKey) && prop && typeof prop === 'object' && !Array.isArray(prop)) {
        const property = prop as SchemaProperty
        const option: AvatarOption = {
          type: property.type === 'integer' ? 'number' : property.type,
          choices: []
        }

        // Get choices from enum or items.enum
        if (property.enum) {
          option.choices.push(...property.enum)
        } else if (property.items?.enum) {
          option.choices.push(...property.items.enum)
        }

        if (option.choices.length > 0 || property.type === 'boolean') {
          processedOptions[key] = option
        }
      }
    }

    // Override skin colors with our defaults
    if (processedOptions.skinColor) {
      processedOptions.skinColor.choices = [...DEFAULT_SKIN_COLORS]
    }

    setOptions(processedOptions)
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      localStorage.setItem('avatarPreferences', JSON.stringify(selectedOptions))
      toast.success('Avatar preferences saved!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOptionChange = (key: string, value: string | number | string[] | boolean) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev }
      
      // Handle boolean toggles
      if (typeof value === 'boolean') {
        if (value) {
          // When toggle is turned on, set probability to 100
          newOptions[key] = ['variant01'] // Set a default variant
          newOptions[`${key}Probability`] = 100
        } else {
          // When toggle is turned off, set probability to 0
          delete newOptions[key]
          newOptions[`${key}Probability`] = 0
        }
      } else {
        newOptions[key] = value as OptionValue
      }
      
      return newOptions
    })
  }

  if (!session?.user?.email) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Customize Your Character</h1>
            <p className="text-zinc-500">Make your avatar unique to you</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Preview Section */}
            <div className="lg:w-1/3">
              <div className="bg-zinc-900 rounded-lg p-8 sticky top-8">
                <div className="flex flex-col items-center gap-4">
                  <AvatarCreator 
                    seed={userEmail} 
                    size={200} 
                    showRandomizeButton={true}
                    {...selectedOptions} 
                  />
                  <p className="text-sm text-zinc-500">Preview</p>
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="lg:w-2/3">
              <div className="space-y-6">
                {OPTION_GROUPS.map(group => (
                  <div key={group.title} className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-400 mb-4">{group.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.options.map(key => {
                        const option = options[key]
                        if (!option) return null

                        // Special handling for toggleable features
                        if (['glasses', 'beard', 'earrings', 'freckles', 'hairAccessories'].includes(key)) {
                          const isEnabled = selectedOptions[`${key}Probability`] === 100
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <label htmlFor={key} className="text-sm font-medium text-zinc-200">
                                {OPTION_LABELS[key as OptionKey]}
                              </label>
                              <Switch
                                id={key}
                                checked={isEnabled}
                                onCheckedChange={(checked: boolean) => handleOptionChange(key, checked)}
                              />
                            </div>
                          )
                        }

                        // Special handling for skin color
                        if (key === 'skinColor') {
                          return (
                            <div key={key} className="col-span-2">
                              <label className="text-sm font-medium text-zinc-200 block mb-2">
                                {OPTION_LABELS[key as OptionKey]}
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {DEFAULT_SKIN_COLORS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => handleOptionChange(key, [color])}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                      getArrayValue(selectedOptions[key], 0) === color 
                                        ? 'border-yellow-400' 
                                        : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: `#${color}` }}
                                    title={color === 'ffffff' ? 'White (Default)' : `Skin Tone #${color}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        }

                        // Regular select options
                        return (
                          <div key={key}>
                            <label htmlFor={key} className="text-sm font-medium text-zinc-200 block mb-2">
                              {OPTION_LABELS[key as OptionKey]}
                            </label>
                            <select
                              id={key}
                              value={Array.isArray(selectedOptions[key]) ? (selectedOptions[key] as string[])[0] || '' : String(selectedOptions[key] || '')}
                              onChange={(e) => handleOptionChange(key, [e.target.value])}
                              className="w-full bg-zinc-800 text-zinc-200 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-400"
                            >
                              <option value="">Select...</option>
                              {option.choices.map(choice => (
                                <option key={choice} value={choice}>
                                  {choice}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end gap-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-yellow-500 text-yellow-950 rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

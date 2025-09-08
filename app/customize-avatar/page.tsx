'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AvatarCreator from '@/components/AvatarCreator'
import { lorelei } from '@dicebear/collection'
import type { JSONSchema7 } from 'json-schema'
import { toast } from 'react-hot-toast'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'

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

interface AvatarPreferences {
  [key: string]: string | number | string[] | boolean | undefined
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

// Function to check if a string is a valid option key
const isOptionKey = (key: string): key is OptionKey => {
  return (ALLOWED_OPTIONS as readonly string[]).includes(key)
}

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
    options: ['head']
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

// Define a comprehensive skin color palette
const SKIN_COLOR_PALETTE = [
  // Light tones
  { color: 'ffffff', name: 'White (Default)' },
  { color: 'ffdbac', name: 'Porcelain' },
  { color: 'f1c27d', name: 'Light Beige' },
  { color: 'e0ac69', name: 'Beige' },
  
  // Medium tones
  { color: 'c68642', name: 'Light Brown' },
  { color: 'a67c52', name: 'Medium Brown' },
  { color: '8d5524', name: 'Chestnut' },
  
  // Dark tones
  { color: '704214', name: 'Dark Brown' },
  { color: '5c3213', name: 'Deep Brown' },
  { color: '4a2703', name: 'Rich Brown' },
  { color: '33190a', name: 'Dark Chocolate' },
  
  // Special tones
  { color: 'f8d25c', name: 'Golden' },
  { color: 'e5a073', name: 'Peachy' },
  { color: 'd48a70', name: 'Rosy' },
  { color: 'aa6651', name: 'Terra Cotta' },
  
  // Wild colors
  { color: '40e0d0', name: 'Turquoise' },
  { color: 'ff5555', name: 'Red' },
  { color: '9370db', name: 'Purple' },
  { color: '3cb371', name: 'Sea Green' },
  { color: '1e90ff', name: 'Dodger Blue' },
  { color: 'ff69b4', name: 'Hot Pink' },
  { color: '00ced1', name: 'Dark Turquoise' },
  { color: '8a2be2', name: 'Blue Violet' }
] as const

// Define default skin colors with white as default
const DEFAULT_SKIN_COLORS = [
  'ffffff', // White (default)
  'f2d3b1', // Light
  'd1a3a4', // Medium
  'c58c85', // Dark
  'a58b80', // Deep
] as const

// Curated set of 8 hair colors (hex without #) for a clean, visual row
const HAIR_COLORS: readonly string[] = [
  '000000', // Black
  '4b2e2e', // Dark Brown
  '6b3f2b', // Brown
  'e6be8a', // Blonde
  'c0392b', // Red
  'ff69b4', // Pink
  '1e90ff', // Blue
  '9370db', // Purple
] as const

export default function CustomizeAvatarPage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

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

    // Ensure hairColor option exists and use curated 8-color palette
    if (!processedOptions.hairColor) {
      processedOptions.hairColor = { type: 'string', choices: [...HAIR_COLORS] }
    } else {
      processedOptions.hairColor.choices = [...HAIR_COLORS]
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
    if (isOptionKey(key)) {
      setSelectedOptions(prev => {
        const newOptions = { ...prev }
        
        // Handle boolean toggles
        if (typeof value === 'boolean') {
          if (value) {
            // When toggle is turned on, set the option and probability
            newOptions[key] = ['variant01'] // Default variant for boolean toggles
            newOptions[`${key}Probability`] = 100
          } else {
            // When toggle is turned off, set probability to 0
            delete newOptions[key]
            newOptions[`${key}Probability`] = 0
          }
        } else {
          newOptions[key] = value
        }
        
        return newOptions
      })
    }
  }

  // === Helpers for visual preview controls ===
  const isColorOption = (key: OptionKey) => key.toLowerCase().endsWith('color')

  // (Removed variant label rendering; previews are visual-only)

  const VariantPreviewGrid = ({ optionKey, option }: { optionKey: OptionKey; option: AvatarOption }) => {
    const current = selectedOptions
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-6 sm:gap-7 justify-items-center">
        {option.choices.map((choice) => {
          const isSelected = Array.isArray(current[optionKey]) && (current[optionKey] as string[])[0] === choice
          const override = { [optionKey]: [choice] } as Record<string, any>
          return (
            <button
              key={choice}
              onClick={() => handleOptionChange(optionKey, [choice])}
              className={`group rounded-xl p-3 sm:p-4 bg-zinc-800/60 hover:bg-zinc-800 transition-colors border shadow-sm min-w-[128px] w-full max-w-[180px] overflow-hidden ${
                isSelected ? 'border-yellow-400' : 'border-zinc-700'
              }`}
            >
              <div className="flex justify-center">
                <AvatarCreator seed={userEmail} size={104} {...(current as any)} {...override} />
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Dedicated single-row hair color selector (8 colors)
  const HairColorRow = ({ optionKey, option }: { optionKey: OptionKey; option: AvatarOption }) => {
    const current = selectedOptions
    return (
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 justify-items-center">
        {option.choices.slice(0, 8).map((hex) => {
          const isSelected = Array.isArray(current[optionKey]) && (current[optionKey] as string[])[0] === hex
          return (
            <button
              key={hex}
              onClick={() => handleOptionChange(optionKey, [hex])}
              className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-105 ${
                isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-zinc-700'
              }`}
              style={{ backgroundColor: `#${hex}` }}
              title={`#${hex}`}
            />
          )
        })}
      </div>
    )
  }

  const ColorSwatchGrid = ({ optionKey, option }: { optionKey: OptionKey; option: AvatarOption }) => {
    const current = selectedOptions
    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4 sm:gap-5 md:gap-6 justify-items-center">
        {option.choices.map((hex) => {
          const isSelected = Array.isArray(current[optionKey]) && (current[optionKey] as string[])[0] === hex
          return (
            <button
              key={hex}
              onClick={() => handleOptionChange(optionKey, [hex])}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-105 ${
                isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-zinc-700'
              }`}
              style={{ backgroundColor: `#${hex}` }}
              title={`#${hex}`}
            />
          )
        })}
      </div>
    )
  }

  if (!session?.user?.email) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl xl:max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Customize Your Character</h1>
            <p className="text-zinc-500">Make your avatar unique to you</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Preview Section - Sticky on mobile */}
            <div className="lg:w-[30%]">
              <div className="bg-zinc-900 rounded-lg p-8 w-full sticky top-4">
                <h2 className="text-xl font-semibold text-yellow-400 mb-4 text-center">Preview</h2>
                <div className="flex justify-center">
                  <AvatarCreator 
                    seed={userEmail} 
                    size={200} 
                    showRandomizeButton={true}
                    onRandomize={() => {
                      // Load from localStorage after randomization
                      const savedPrefs = localStorage.getItem('avatarPreferences')
                      if (savedPrefs) {
                        setSelectedOptions(JSON.parse(savedPrefs))
                      }
                    }}
                    {...selectedOptions} 
                  />
                </div>
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded-md transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="lg:flex-1">
              <div className="space-y-6">
                {OPTION_GROUPS.map(group => (
                  <div key={group.title} className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-400 mb-4">{group.title}</h2>
                    <div className="space-y-8">
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

                        // Hide skin color from the regular options as we'll have a dedicated card for it
                        if (key === 'skinColor' as OptionKey) {
                          return null
                        }

                        // Visual options: render either color swatches or avatar preview tiles
                        return (
                          <div key={key}>
                            <div className="text-sm font-medium text-zinc-200 mb-2">
                              {OPTION_LABELS[key as OptionKey]}
                            </div>
                            {key === 'hairColor' ? (
                              <HairColorRow optionKey={key as OptionKey} option={option} />
                            ) : isColorOption(key as OptionKey) ? (
                              <ColorSwatchGrid optionKey={key as OptionKey} option={option} />
                            ) : (
                              <VariantPreviewGrid optionKey={key as OptionKey} option={option} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Dedicated Skin Color Card */}
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-yellow-400 mb-4">Skin Color</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-200 mb-2">Natural Tones</h3>
                      <p className="text-zinc-400 text-sm mb-4">Choose a natural skin tone for your character</p>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 justify-items-center">
                        {/* White (Default) - Make it larger and more prominent */}
                        <button
                          onClick={() => handleOptionChange('skinColor', ['ffffff'])}
                          className={`w-16 h-16 rounded-full border-4 transition-all transform hover:scale-105 ${
                            Array.isArray(selectedOptions.skinColor) && selectedOptions.skinColor[0] === 'ffffff' 
                              ? 'border-yellow-400 ring-4 ring-yellow-400/30' 
                              : 'border-zinc-700'
                          }`}
                          style={{ backgroundColor: '#ffffff' }}
                          title="White (Default)"
                        >
                          {Array.isArray(selectedOptions.skinColor) && selectedOptions.skinColor[0] === 'ffffff' && (
                            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-zinc-400">
                              Default
                            </span>
                          )}
                        </button>
                        
                        {/* Comprehensive skin tone palette - first 15 colors */}
                        {SKIN_COLOR_PALETTE.slice(1, 15).map(({ color, name }) => (
                          <button
                            key={color}
                            onClick={() => handleOptionChange('skinColor', [color])}
                            className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-105 ${
                              Array.isArray(selectedOptions.skinColor) && selectedOptions.skinColor[0] === color 
                                ? 'border-yellow-400 ring-2 ring-yellow-400/30' 
                                : 'border-zinc-700'
                            }`}
                            style={{ backgroundColor: `#${color}` }}
                            title={name}
                          >
                            {Array.isArray(selectedOptions.skinColor) && selectedOptions.skinColor[0] === color && (
                              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-zinc-400 whitespace-nowrap">
                                {name}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-zinc-200 mb-2">Wild Colors</h3>
                      <p className="text-zinc-400 text-sm mb-4">Or choose a fun, vibrant color!</p>
                      
                      <div className="grid grid-cols-4 gap-4 justify-items-center">
                        {/* Wild color palette - remaining colors */}
                        {SKIN_COLOR_PALETTE.slice(15).map(({ color, name }) => (
                          <button
                            key={color}
                            onClick={() => handleOptionChange('skinColor', [color])}
                            className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-105 ${
                              Array.isArray(selectedOptions.skinColor) && selectedOptions.skinColor[0] === color 
                                ? 'border-yellow-400 ring-2 ring-yellow-400/30' 
                                : 'border-zinc-700'
                            }`}
                            style={{ backgroundColor: `#${color}` }}
                            title={name}
                          >
                            {Array.isArray(selectedOptions.skinColor) && selectedOptions.skinColor[0] === color && (
                              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-zinc-400 whitespace-nowrap">
                                {name}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
